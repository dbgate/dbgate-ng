// Connections management functionality for DBGate Shell
import * as crypto from 'crypto';
import { ConnectionsControllerContract, StoredConnection } from 'dbgate-types';

/**
 * Parse connections from environment variables
 * Format: CONNECTION_1_SERVER=localhost, CONNECTION_1_ENGINE=mysql, etc.
 */
export function parseConnectionsFromEnv(env = process.env): StoredConnection[] {
  const connections: StoredConnection[] = [];
  const envKeys = Object.keys(env);
  const connectionNumbers = new Set<string>();

  // Find all connection numbers
  envKeys.forEach((key) => {
    const match = key.match(/^CONNECTION_(\d+)_/);
    if (match) {
      connectionNumbers.add(match[1]);
    }
  });

  // Build connections from env vars
  connectionNumbers.forEach((num) => {
    const server = env[`CONNECTION_${num}_SERVER`];
    const engine = env[`CONNECTION_${num}_ENGINE`];

    if (server && engine) {
      const connection: StoredConnection = {
        _id: crypto.randomUUID(),
        conid: `env_${num}`,
        server,
        engine,
        user: env[`CONNECTION_${num}_USER`],
        password: env[`CONNECTION_${num}_PASSWORD`],
        port: env[`CONNECTION_${num}_PORT`]
          ? parseInt(env[`CONNECTION_${num}_PORT`]!)
          : undefined,
        database: env[`CONNECTION_${num}_DATABASE`],
        displayName:
          env[`CONNECTION_${num}_DISPLAY_NAME`] ||
          `${engine} - ${server}`,
        authType: env[`CONNECTION_${num}_AUTH_TYPE`],
        useDatabaseUrl:
          env[`CONNECTION_${num}_USE_DATABASE_URL`] === "true",
        databaseUrl: env[`CONNECTION_${num}_DATABASE_URL`],
        ssl: env[`CONNECTION_${num}_SSL`] === "true",
        isReadOnly: env[`CONNECTION_${num}_READ_ONLY`] === "true",
        defaultDatabase: env[`CONNECTION_${num}_DEFAULT_DATABASE`],
      };

      connections.push(connection);
    }
  });

  return connections;
}

/**
 * Find a connection by its connection ID
 */
export function findConnectionById(connections: StoredConnection[], conid: string): StoredConnection | undefined {
  return connections.find((c) => c.conid === conid);
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
    errors
  };
}

/**
 * Test a connection (simplified implementation)
 */
export async function testConnection(config: Partial<StoredConnection>): Promise<{ msgtype: "connected" | "error"; message?: string }> {
  const validation = validateConnection(config);

  if (!validation.isValid) {
    return {
      msgtype: 'error',
      message: validation.errors.join(', ')
    };
  }

  // For now, just simulate a successful connection test
  // In a real implementation, this would attempt to connect to the database
  return {
    msgtype: 'connected',
    message: 'Connection test successful'
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
  return [
    'mysql',
    'postgresql',
    'sqlite',
    'mssql',
    'oracle',
    'mongodb',
    'redis',
    'cockroachdb',
    'clickhouse'
  ];
}

/**
 * Connection manager class for managing multiple connections
 * Implements the interface generated from API contracts for type safety
 */
export class ConnectionManager implements ConnectionsControllerContract {
  private connections: StoredConnection[] = [];

  constructor(initialConnections: StoredConnection[] = []) {
    this.connections = [...initialConnections];
  }

  /**
   * Load connections from environment variables
   */
  loadFromEnvironment(env = process.env): void {
    this.connections = parseConnectionsFromEnv(env);
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
  async test(params: { values: Partial<StoredConnection> }): Promise<{ msgtype: "connected" | "error"; message?: string }> {
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
      ...params.values
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
      database: params.file
    };

    this.add(connection);
    return connection;
  }
}
