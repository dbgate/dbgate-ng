export type DatabaseInfo = {
  name: string;
  tables?: any[];
  views?: any[];
  procedures?: any[];
  functions?: any[];
  triggers?: any[];
  schemas?: any[];
};

export type DatabaseConnections_Status_Request = {
  controller: "databaseConnections";
  action: "status";
  params: {
    conid: string;
    database: string;
  };
  response: {
    name: string;
    status: "ok" | "pending" | "error";
    connection?: any;
    structure?: DatabaseInfo;
  };
};

export type DatabaseConnections_Connect_Request = {
  controller: "databaseConnections";
  action: "connect";
  params: {
    conid: string;
    database: string;
  };
  response: boolean;
};

export type DatabaseConnections_Disconnect_Request = {
  controller: "databaseConnections";
  action: "disconnect";
  params: {
    conid: string;
    database: string;
  };
  response: boolean;
};

export type DatabaseConnections_LoadKeys_Request = {
  controller: "databaseConnections";
  action: "loadKeys";
  params: {
    conid: string;
    database: string;
  };
  response: any[];
};

export type DatabaseConnections_LoadDatabase_Request = {
  controller: "databaseConnections";
  action: "loadDatabase";
  params: {
    conid: string;
    database: string;
  };
  response: DatabaseInfo;
};

export type DatabaseConnections_Request = 
  | DatabaseConnections_Status_Request 
  | DatabaseConnections_Connect_Request 
  | DatabaseConnections_Disconnect_Request 
  | DatabaseConnections_LoadKeys_Request 
  | DatabaseConnections_LoadDatabase_Request;
