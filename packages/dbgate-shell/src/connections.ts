// Connections management functionality for DBGate Shell
import crypto from "node:crypto";
import type {
  Connection,
  ConnectionConfig,
  ConnectionTestResult,
  EnvironmentConnectionConfig,
} from "./types";

/**
 * Parse connections from environment variables
 * Format: CONNECTION_1_SERVER=localhost, CONNECTION_1_ENGINE=mysql, etc.
 */
export function parseConnectionsFromEnv(
  env: EnvironmentConnectionConfig = process.env
): Connection[] {
  const connections: Connection[] = [];
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
      const connection: Connection = {
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
          env[`CONNECTION_${num}_DISPLAY_NAME`] || `${engine} - ${server}`,
        authType: env[`CONNECTION_${num}_AUTH_TYPE`],
        useDatabaseUrl: env[`CONNECTION_${num}_USE_DATABASE_URL`] === "true",
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
export function findConnectionById(
  connections: Connection[],
  conid: string
): Connection | undefined {
  return connections.find((c) => c.conid === conid);
}

/**
 * Validate connection configuration
 */
export function validateConnection(config: Partial<ConnectionConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.server) {
    errors.push("Server is required");
  }

  if (!config.engine) {
    errors.push("Engine is required");
  }

  // Validate port if provided
  if (config.port !== undefined) {
    if (Number.isNaN(config.port) || config.port < 1 || config.port > 65535) {
      errors.push("Port must be a valid number between 1 and 65535");
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
  config: Partial<ConnectionConfig>
): Promise<ConnectionTestResult> {
  const validation = validateConnection(config);

  if (!validation.isValid) {
    return {
      msgtype: "error",
      message: validation.errors.join(", "),
    };
  }

  // For now, just simulate a successful connection test
  // In a real implementation, this would attempt to connect to the database
  return {
    msgtype: "connected",
    message: "Connection test successful",
  };
}

/**
 * Mask sensitive information from a connection (for security)
 */
export function maskConnection(connection: Connection): Connection {
  return {
    ...connection,
    password: connection.password ? "***" : undefined,
    databaseUrl: connection.databaseUrl ? "***" : undefined,
  };
}

/**
 * Get supported database engines
 */
export function getSupportedEngines(): string[] {
  return [
    "mysql",
    "postgresql",
    "sqlite",
    "mssql",
    "oracle",
    "mongodb",
    "redis",
    "cockroachdb",
    "clickhouse",
  ];
}

/**
 * Connection manager class for managing multiple connections
 */
export class ConnectionManager {
  private connections: Connection[] = [];

  constructor(initialConnections: Connection[] = []) {
    this.connections = [...initialConnections];
  }

  /**
   * Load connections from environment variables
   */
  loadFromEnvironment(env: EnvironmentConnectionConfig = process.env): void {
    this.connections = parseConnectionsFromEnv(env);
  }

  /**
   * Get all connections
   */
  getAll(): Connection[] {
    return [...this.connections];
  }

  /**
   * Get connection by ID
   */
  getById(conid: string): Connection | undefined {
    return findConnectionById(this.connections, conid);
  }

  /**
   * Add a new connection
   */
  add(connection: Connection): void {
    this.connections.push(connection);
  }

  /**
   * Remove a connection by ID
   */
  remove(conid: string): boolean {
    const index = this.connections.findIndex((c) => c.conid === conid);
    if (index !== -1) {
      this.connections.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update a connection
   */
  update(conid: string, updates: Partial<Connection>): boolean {
    const index = this.connections.findIndex((c) => c.conid === conid);
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
}
