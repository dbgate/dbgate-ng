// Export all controller types
export * from './apps-api';
export * from './archive-api';
export * from './auth-api';
export * from './cloud-api';
export * from './config-api';
export * from './connections-api';
export * from './database-connections-api';
export * from './files-api';
export * from './jsldata-api';
export * from './metadata-api';
export * from './plugins-api';
export * from './query-history-api';
export * from './runners-api';
export * from './scheduler-api';
export * from './server-connections-api';
export * from './sessions-api';
export * from './storage-api';
export * from './uploads-api';

// Master union type for all API requests
export type ApiRequest = 
  | import('./apps-api').Apps_Request
  | import('./archive-api').Archive_Request
  | import('./auth-api').Auth_Request
  | import('./cloud-api').Cloud_Request
  | import('./config-api').Config_Request
  | import('./connections-api').Connections_Request
  | import('./database-connections-api').DatabaseConnections_Request
  | import('./files-api').Files_Request
  | import('./jsldata-api').JslData_Request
  | import('./metadata-api').Metadata_Request
  | import('./plugins-api').Plugins_Request
  | import('./query-history-api').QueryHistory_Request
  | import('./runners-api').Runners_Request
  | import('./scheduler-api').Scheduler_Request
  | import('./server-connections-api').ServerConnections_Request
  | import('./sessions-api').Sessions_Request
  | import('./storage-api').Storage_Request
  | import('./uploads-api').Uploads_Request;
