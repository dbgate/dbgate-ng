import { ProcessContainerProxy, ProcessWorkerProxy } from 'dbgate-core';
import { ServerConnectionsControllerContract, StoredConnection, AddMetaFields } from 'dbgate-types';
import { getConnectionsController } from './connections';
import { ServerConnectionProcess } from 'dbgate-core/src/process/ServerConnectionProcess';

interface OpenedConnection {
  conid: string;
  connection: StoredConnection;
  worker: ProcessWorkerProxy<ServerConnectionProcess> & ServerConnectionProcess;
  databases: { name: string }[];
  version?: { version: string; versionText?: string };
  status: {
    name: 'pending' | 'ok' | 'error';
    message?: string;
  };
  lastPinged?: number;
  disconnected: boolean;
}

interface ConnectionStatus {
  name: 'pending' | 'ok' | 'error';
  message?: string;
}

export class ServerConnectionsControllerImpl implements AddMetaFields<ServerConnectionsControllerContract> {
  private opened: OpenedConnection[] = [];
  private closed: { [conid: string]: ConnectionStatus } = {};
  private processContainer: ProcessContainerProxy;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();

  // Meta fields for API contract
  disconnect_meta = true as const;
  listDatabases_meta = true as const;
  version_meta = true as const;
  serverStatus_meta = true as const;
  ping_meta = true as const;
  refresh_meta = true as const;
  createDatabase_meta = true as const;
  dropDatabase_meta = true as const;
  serverSummary_meta = true as const;
  summaryCommand_meta = true as const;

  constructor() {
    this.processContainer = new ProcessContainerProxy();
  }

  private async ensureOpened(conid: string): Promise<OpenedConnection | null> {
    // Check if already opened
    let existing = this.opened.find(x => x.conid === conid);
    if (existing && !existing.disconnected) {
      return existing;
    }

    // Get connection configuration
    const connectionsController = getConnectionsController();
    const connection = connectionsController.getById(conid);
    
    if (!connection) {
      throw new Error(`Connection with conid="${conid}" not found`);
    }

    // Skip single database connections
    if ((connection as any).singleDatabase) {
      return null;
    }

    // Check for missing credentials - simplified check
    if (!connection.password && !connection.authType) {
      throw new Error(`Missing credentials for connection ${conid}`);
    }

    try {
      // Create new worker process
      const worker = await this.processContainer.createProcess(ServerConnectionProcess);
      
      const newOpened: OpenedConnection = {
        conid,
        connection,
        worker,
        databases: [],
        status: { name: 'pending' },
        disconnected: false
      };

      this.opened.push(newOpened);
      delete this.closed[conid];

      // Initialize connection - simulate connecting to the server
      // In a real implementation, this would send connection parameters to the worker
      setTimeout(async () => {
        try {
          // Simulate loading databases
          const databases = await worker.getDatabases();
          newOpened.databases = databases.map(name => ({ name }));
          newOpened.status = { name: 'ok' };
        } catch (error) {
          newOpened.status = { 
            name: 'error', 
            message: error instanceof Error ? error.message : String(error) 
          };
        }
      }, 100);

      return newOpened;
    } catch (error) {
      throw new Error(`Failed to create server connection: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async closeConnection(conid: string, kill = true): Promise<void> {
    const existing = this.opened.find(x => x.conid === conid);
    if (existing) {
      existing.disconnected = true;
      
      if (kill) {
        try {
          await existing.worker.destroy();
        } catch (error) {
          console.error('Error destroying worker:', error);
        }
      }

      this.opened = this.opened.filter(x => x.conid !== conid);
      this.closed[conid] = {
        name: 'error',
        message: 'Connection closed'
      };
    }
  }

  // API Contract Methods

  async disconnect(params: { conid: string }): Promise<boolean> {
    try {
      await this.closeConnection(params.conid, true);
      return true;
    } catch (error) {
      console.error('Error disconnecting:', error);
      return false;
    }
  }

  async listDatabases(params: { conid: string }): Promise<{ name: string }[]> {
    if (!params.conid || params.conid === '__model') {
      return [];
    }

    const opened = await this.ensureOpened(params.conid);
    return opened?.databases ?? [];
  }

  async version(params: { conid: string }): Promise<{ version: string; versionText?: string }> {
    const opened = await this.ensureOpened(params.conid);
    return opened?.version ?? { version: '1.0.0', versionText: 'Unknown' };
  }

  async serverStatus(params: { conid: string }): Promise<any> {
    const opened = this.opened.find(x => x.conid === params.conid);
    if (opened) {
      return opened.status;
    }
    return this.closed[params.conid] ?? { name: 'error', message: 'Not connected' };
  }

  async ping(params: { conid: string }): Promise<boolean> {
    try {
      const opened = await this.ensureOpened(params.conid);
      if (!opened) {
        return false;
      }

      const now = Date.now();
      const lastPing = opened.lastPinged || 0;
      
      // Only ping if more than 30 seconds since last ping
      if (now - lastPing < 30000) {
        return true;
      }

      opened.lastPinged = now;
      
      // Simulate ping by calling a simple method
      try {
        await opened.worker.getDatabases();
        return true;
      } catch (error) {
        await this.closeConnection(params.conid);
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async refresh(params: { conid: string }): Promise<boolean> {
    try {
      // Close existing connection
      await this.closeConnection(params.conid);
      
      // Reopen connection
      await this.ensureOpened(params.conid);
      return true;
    } catch (error) {
      console.error('Error refreshing connection:', error);
      return false;
    }
  }

  async createDatabase(params: { conid: string; name: string }): Promise<boolean> {
    try {
      const opened = await this.ensureOpened(params.conid);
      if (!opened) {
        return false;
      }

      if (opened.connection.isReadOnly) {
        return false;
      }

      // Simulate database creation
      // In a real implementation, this would call a method on the worker
      opened.databases.push({ name: params.name });
      return true;
    } catch (error) {
      console.error('Error creating database:', error);
      return false;
    }
  }

  async dropDatabase(params: { conid: string; name: string }): Promise<boolean> {
    try {
      const opened = await this.ensureOpened(params.conid);
      if (!opened) {
        return false;
      }

      if (opened.connection.isReadOnly) {
        return false;
      }

      // Simulate database deletion
      // In a real implementation, this would call a method on the worker
      opened.databases = opened.databases.filter(db => db.name !== params.name);
      return true;
    } catch (error) {
      console.error('Error dropping database:', error);
      return false;
    }
  }

  async serverSummary(params: { conid: string }): Promise<any> {
    try {
      const opened = await this.ensureOpened(params.conid);
      if (!opened) {
        return null;
      }

      // Return basic server summary
      return {
        connectionId: params.conid,
        engine: opened.connection.engine,
        server: opened.connection.server,
        databaseCount: opened.databases.length,
        status: opened.status,
        version: opened.version
      };
    } catch (error) {
      console.error('Error getting server summary:', error);
      return null;
    }
  }

  async summaryCommand(params: { conid: string; command: string }): Promise<any> {
    try {
      const opened = await this.ensureOpened(params.conid);
      if (!opened) {
        return null;
      }

      if (opened.connection.isReadOnly) {
        return false;
      }

      // Simulate command execution
      // In a real implementation, this would execute the command on the worker
      return {
        command: params.command,
        result: 'Command executed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing summary command:', error);
      return null;
    }
  }

  // Utility methods

  getOpenedConnectionReport(): any[] {
    return this.opened.map(con => ({
      conid: con.conid,
      status: con.status,
      versionText: con.version?.versionText,
      databaseCount: con.databases.length,
      connection: {
        engine: con.connection.engine,
        server: con.connection.server,
        authType: con.connection.authType,
        isReadOnly: con.connection.isReadOnly
      }
    }));
  }

  async cleanup(): Promise<void> {
    // Close all connections
    await Promise.all(
      this.opened.map(conn => this.closeConnection(conn.conid, true))
    );
    
    // Destroy process container
    this.processContainer.destroy();
  }
}

// Singleton instance
let serverConnectionsController: ServerConnectionsControllerImpl;

export function getServerConnectionsController(): ServerConnectionsControllerImpl {
  if (!serverConnectionsController) {
    serverConnectionsController = new ServerConnectionsControllerImpl();
  }
  return serverConnectionsController;
}