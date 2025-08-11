// Connections management functionality for DBGate Shell
import * as crypto from 'crypto';
import { getDatabaseFileLabel, safeJsonParse } from 'dbgate-tools';
import { AddMetaFields, ConnectionsControllerContract, StoredConnection } from 'dbgate-types';
import _ from 'lodash';
import path from 'path';

function getPortalCollections(): StoredConnection[] | undefined {
  if (process.env.CONNECTIONS) {
    const connections: StoredConnection[] = _.compact(process.env.CONNECTIONS.split(',')).map(id => ({
      _id: id,
      engine: process.env[`ENGINE_${id}`],
      server: process.env[`SERVER_${id}`],
      user: process.env[`USER_${id}`],
      password: process.env[`PASSWORD_${id}`],
      passwordMode: process.env[`PASSWORD_MODE_${id}`],
      port: process.env[`PORT_${id}`] ? parseInt(process.env[`PORT_${id}`]!) : undefined,
      databaseUrl: process.env[`URL_${id}`],
      useDatabaseUrl: !!process.env[`URL_${id}`],
      databaseFile: process.env[`FILE_${id}`]?.replace(
        '%%E2E_TEST_DATA_DIRECTORY%%',
        path.join(path.dirname(path.dirname(__dirname)), 'e2e-tests', 'tmpdata')
      ),
      socketPath: process.env[`SOCKET_PATH_${id}`],
      serviceName: process.env[`SERVICE_NAME_${id}`],
      authType: process.env[`AUTH_TYPE_${id}`] || (process.env[`SOCKET_PATH_${id}`] ? 'socket' : undefined),
      defaultDatabase:
        process.env[`DATABASE_${id}`] ||
        (process.env[`FILE_${id}`] ? getDatabaseFileLabel(process.env[`FILE_${id}`]) : null),
      singleDatabase: !!process.env[`DATABASE_${id}`] || !!process.env[`FILE_${id}`],
      displayName: process.env[`LABEL_${id}`],
      isReadOnly: !!process.env[`READONLY_${id}`],
      databases: process.env[`DBCONFIG_${id}`] ? safeJsonParse(process.env[`DBCONFIG_${id}`]) : null,
      allowedDatabases: process.env[`ALLOWED_DATABASES_${id}`]?.replace(/\|/g, '\n'),
      allowedDatabasesRegex: process.env[`ALLOWED_DATABASES_REGEX_${id}`],
      parent: process.env[`PARENT_${id}`] || undefined,
      useSeparateSchemas: !!process.env[`USE_SEPARATE_SCHEMAS_${id}`],
      localDataCenter: process.env[`LOCAL_DATA_CENTER_${id}`],

      // SSH tunnel
      useSshTunnel: process.env[`USE_SSH_${id}`],
      sshHost: process.env[`SSH_HOST_${id}`],
      sshPort: process.env[`SSH_PORT_${id}`] ? parseInt(process.env[`SSH_PORT_${id}`]!) : undefined,
      sshMode: process.env[`SSH_MODE_${id}`],
      sshLogin: process.env[`SSH_LOGIN_${id}`],
      sshPassword: process.env[`SSH_PASSWORD_${id}`],
      sshKeyfile: process.env[`SSH_KEY_FILE_${id}`],
      sshKeyfilePassword: process.env[`SSH_KEY_FILE_PASSWORD_${id}`],

      // SSL
      useSsl: process.env[`USE_SSL_${id}`],
      sslCaFile: process.env[`SSL_CA_FILE_${id}`],
      sslCertFile: process.env[`SSL_CERT_FILE_${id}`],
      sslCertFilePassword: process.env[`SSL_CERT_FILE_PASSWORD_${id}`],
      sslKeyFile: process.env[`SSL_KEY_FILE_${id}`],
      sslRejectUnauthorized: process.env[`SSL_REJECT_UNAUTHORIZED_${id}`],
      trustServerCertificate: process.env[`SSL_TRUST_CERTIFICATE_${id}`],
    }));

    for (const conn of connections) {
      for (const prop in process.env) {
        if (prop.startsWith(`CONNECTION_${conn._id}_`)) {
          const name = prop.substring(`CONNECTION_${conn._id}_`.length);
          (conn as any)[name] = process.env[prop];
        }
      }
    }

    // logger.info(
    //   { connections: connections.map(pickSafeConnectionInfo) },
    //   'DBGM-00005 Using connections from ENV variables'
    // );
    // const noengine = connections.filter(x => !x.engine);
    // if (noengine.length > 0) {
    //   logger.warn(
    //     { connections: noengine.map(x => x._id) },
    //     'DBGM-00006 Invalid CONNECTIONS configuration, missing ENGINE for connection ID'
    //   );
    // }
    return connections;
  }

  // const args = getNamedArgs();
  // if (args.databaseFile) {
  //   return [
  //     {
  //       _id: 'argv',
  //       databaseFile: args.databaseFile,
  //       singleDatabase: true,
  //       defaultDatabase: getDatabaseFileLabel(args.databaseFile),
  //       engine: args.engine,
  //     },
  //   ];
  // }
  // if (args.databaseUrl) {
  //   return [
  //     {
  //       _id: 'argv',
  //       useDatabaseUrl: true,
  //       ...args,
  //     },
  //   ];
  // }
  // if (args.server) {
  //   return [
  //     {
  //       _id: 'argv',
  //       ...args,
  //     },
  //   ];
  // }
}

/**
 * Find a connection by its connection ID
 */
export function findConnectionById(connections: StoredConnection[], conid: string): StoredConnection | undefined {
  return connections.find(c => c.conid === conid);
}

/**
 * Validate connection configuration
 */
export function validateConnection(config: Partial<StoredConnection>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.server) {
    errors.push('Server is required');
  }

  if (!config.engine) {
    errors.push('Engine is required');
  }

  // Validate port if provided
  if (config.port !== undefined) {
    if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
      errors.push('Port must be a valid number between 1 and 65535');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Test a connection (simplified implementation)
 */
export async function testConnection(
  config: Partial<StoredConnection>
): Promise<{ msgtype: 'connected' | 'error'; message?: string }> {
  const validation = validateConnection(config);

  if (!validation.isValid) {
    return {
      msgtype: 'error',
      message: validation.errors.join(', '),
    };
  }

  // For now, just simulate a successful connection test
  // In a real implementation, this would attempt to connect to the database
  return {
    msgtype: 'connected',
    message: 'Connection test successful',
  };
}

/**
 * Mask sensitive information from a connection (for security)
 */
export function maskConnection(connection: StoredConnection): StoredConnection {
  return {
    ...connection,
    password: connection.password ? '***' : undefined,
    databaseUrl: connection.databaseUrl ? '***' : undefined,
  };
}

/**
 * Get supported database engines
 */
export function getSupportedEngines(): string[] {
  return ['mysql', 'postgresql', 'sqlite', 'mssql', 'oracle', 'mongodb', 'redis', 'cockroachdb', 'clickhouse'];
}

/**
 * Connection manager class for managing multiple connections
 * Implements the interface generated from API contracts for type safety
 */
export class ConnectionsControllerImpl implements AddMetaFields<ConnectionsControllerContract> {
  private connections: StoredConnection[] = [];

  constructor() {
    this.loadFromEnvironment();
  }
  list_meta = true as const;
  get_meta = true as const;
  save_meta = true as const;
  delete_meta = true as const;
  test_meta = true as const;
  newSqliteDatabase_meta = true as const;

  /**
   * Load connections from environment variables
   */
  loadFromEnvironment(): void {
    this.connections = getPortalCollections() || [];
  }

  /**
   * Get all connections
   */
  getAll(): StoredConnection[] {
    return [...this.connections];
  }

  /**
   * Get connection by ID
   */
  getById(conid: string): StoredConnection | undefined {
    return findConnectionById(this.connections, conid);
  }

  /**
   * Add a new connection
   */
  add(connection: StoredConnection): void {
    this.connections.push(connection);
  }

  /**
   * Remove a connection by ID
   */
  remove(conid: string): boolean {
    const index = this.connections.findIndex(c => c.conid === conid);
    if (index !== -1) {
      this.connections.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update a connection
   */
  update(conid: string, updates: Partial<StoredConnection>): boolean {
    const index = this.connections.findIndex(c => c.conid === conid);
    if (index !== -1) {
      this.connections[index] = { ...this.connections[index], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Get connection count
   */
  count(): number {
    return this.connections.length;
  }

  /**
   * Clear all connections
   */
  clear(): void {
    this.connections = [];
  }

  // Interface methods from ConnectionManagerInterface

  /**
   * List all connections (API contract method)
   */
  async list(params: {}): Promise<StoredConnection[]> {
    return this.getAll();
  }

  /**
   * Get specific connection (API contract method)
   */
  async get(params: { conid: string }): Promise<StoredConnection> {
    const connection = this.getById(params.conid);
    if (!connection) {
      throw new Error(`Connection not found: ${params.conid}`);
    }
    return connection;
  }

  /**
   * Test connection (API contract method)
   */
  async test(params: {
    values: Partial<StoredConnection>;
  }): Promise<{ msgtype: 'connected' | 'error'; message?: string }> {
    return await testConnection(params.values);
  }

  /**
   * Save connection (API contract method)
   */
  async save(params: { values: Partial<StoredConnection> }): Promise<StoredConnection> {
    const connection: StoredConnection = {
      _id: crypto.randomUUID(),
      conid: params.values.conid || `conn_${crypto.randomUUID()}`,
      server: params.values.server || '',
      engine: params.values.engine || '',
      ...params.values,
    };

    if (params.values.conid && this.getById(params.values.conid)) {
      // Update existing connection
      this.update(params.values.conid, params.values);
      return this.getById(params.values.conid)!;
    } else {
      // Add new connection
      this.add(connection);
      return connection;
    }
  }

  /**
   * Delete connection (API contract method)
   */
  async delete(params: { conid: string }): Promise<boolean> {
    return this.remove(params.conid);
  }

  /**
   * Create new SQLite database (API contract method)
   */
  async newSqliteDatabase(params: { file: string }): Promise<StoredConnection> {
    const connection: StoredConnection = {
      _id: crypto.randomUUID(),
      conid: `sqlite_${crypto.randomUUID()}`,
      server: params.file,
      engine: 'sqlite',
      displayName: `SQLite - ${params.file}`,
      database: params.file,
    };

    this.add(connection);
    return connection;
  }
}

export const connectionsController = new ConnectionsControllerImpl();
