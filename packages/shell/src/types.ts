// Core types for DBGate Shell
// Re-export types from the API types package for convenience

export type { Connection } from "../../types/api/connections-api";

// Shell-specific types
export interface ConnectionConfig {
  server: string;
  engine: string;
  user?: string;
  password?: string;
  port?: number;
  database?: string;
  displayName?: string;
  authType?: string;
  useDatabaseUrl?: boolean;
  databaseUrl?: string;
  ssl?: boolean;
  isReadOnly?: boolean;
  defaultDatabase?: string;
}

export interface EnvironmentConnectionConfig {
  [key: string]: string | undefined;
}

export interface ConnectionTestResult {
  msgtype: "connected" | "error";
  message?: string;
}

export interface DatabaseInfo {
  name: string;
  tables?: any[];
  views?: any[];
  procedures?: any[];
  functions?: any[];
  triggers?: any[];
  schemas?: any[];
}
