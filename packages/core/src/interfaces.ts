// Interface definitions using the generic API interface factory
import { AsyncApiInterfaceFactory } from '../../types/api/interface-factory';
import { Connections_Request } from '../../types/api/connections-api';

/**
 * Connection Manager Interface generated from API contracts
 * This ensures type safety between API contracts and implementation
 */
export type ConnectionManagerInterface = AsyncApiInterfaceFactory<Connections_Request>;

/**
 * Alternative interface with context parameter for dependency injection
 */
export type ConnectionManagerWithContextInterface = {
  [K in keyof ConnectionManagerInterface]: (
    params: Parameters<ConnectionManagerInterface[K]>[0],
    context?: { logger?: any; config?: any }
  ) => ReturnType<ConnectionManagerInterface[K]>;
};

/**
 * Utility type to extract specific method signatures
 */
export type ListConnectionsMethod = ConnectionManagerInterface['list'];
export type GetConnectionMethod = ConnectionManagerInterface['get'];
export type TestConnectionMethod = ConnectionManagerInterface['test'];
export type SaveConnectionMethod = ConnectionManagerInterface['save'];
export type DeleteConnectionMethod = ConnectionManagerInterface['delete'];
export type NewSqliteDatabaseMethod = ConnectionManagerInterface['newSqliteDatabase'];

// Example of how the generated interface looks (for documentation):
/*
export interface ConnectionManagerInterface {
  list(params: {}): Promise<Connection[]>;
  get(params: { conid: string }): Promise<Connection>;
  test(params: { values: Partial<Connection> }): Promise<{ msgtype: "connected" | "error"; message?: string; }>;
  save(params: { values: Partial<Connection> }): Promise<Connection>;
  delete(params: { conid: string }): Promise<boolean>;
  newSqliteDatabase(params: { file: string }): Promise<Connection>;
}
*/
