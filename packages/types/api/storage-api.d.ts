export type Storage_Connections_Request = {
  controller: "storage";
  action: "connections";
  params: {};
  response: any[];
};

export type Storage_GetConnection_Request = {
  controller: "storage";
  action: "getConnection";
  params: {
    conid: string;
  };
  response: any;
};

export type Storage_GetConnectionsForLoginPage_Request = {
  controller: "storage";
  action: "getConnectionsForLoginPage";
  params: {};
  response: any[];
};

export type Storage_ReadConfig_Request = {
  controller: "storage";
  action: "readConfig";
  params: {
    group: string;
  };
  response: any;
};

export type Storage_SendAuditLog_Request = {
  controller: "storage";
  action: "sendAuditLog";
  params: {
    entry: any;
  };
  response: boolean;
};

export type Storage_Request =
  | Storage_Connections_Request
  | Storage_GetConnection_Request
  | Storage_GetConnectionsForLoginPage_Request
  | Storage_ReadConfig_Request
  | Storage_SendAuditLog_Request;
