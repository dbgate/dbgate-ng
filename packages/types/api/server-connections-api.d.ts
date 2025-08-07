export type ServerConnections_Disconnect_Request = {
  controller: "serverConnections";
  action: "disconnect";
  params: {
    conid: string;
  };
  response: boolean;
};

export type ServerConnections_ListDatabases_Request = {
  controller: "serverConnections";
  action: "listDatabases";
  params: {
    conid: string;
  };
  response: string[];
};

export type ServerConnections_Version_Request = {
  controller: "serverConnections";
  action: "version";
  params: {
    conid: string;
  };
  response: {
    version: string;
    versionText?: string;
  };
};

export type ServerConnections_ServerStatus_Request = {
  controller: "serverConnections";
  action: "serverStatus";
  params: {
    conid: string;
  };
  response: any;
};

export type ServerConnections_Ping_Request = {
  controller: "serverConnections";
  action: "ping";
  params: {
    conid: string;
  };
  response: boolean;
};

export type ServerConnections_Refresh_Request = {
  controller: "serverConnections";
  action: "refresh";
  params: {
    conid: string;
  };
  response: boolean;
};

export type ServerConnections_CreateDatabase_Request = {
  controller: "serverConnections";
  action: "createDatabase";
  params: {
    conid: string;
    name: string;
  };
  response: boolean;
};

export type ServerConnections_DropDatabase_Request = {
  controller: "serverConnections";
  action: "dropDatabase";
  params: {
    conid: string;
    name: string;
  };
  response: boolean;
};

export type ServerConnections_ServerSummary_Request = {
  controller: "serverConnections";
  action: "serverSummary";
  params: {
    conid: string;
  };
  response: any;
};

export type ServerConnections_SummaryCommand_Request = {
  controller: "serverConnections";
  action: "summaryCommand";
  params: {
    conid: string;
    command: string;
  };
  response: any;
};

export type ServerConnections_Request =
  | ServerConnections_Disconnect_Request
  | ServerConnections_ListDatabases_Request
  | ServerConnections_Version_Request
  | ServerConnections_ServerStatus_Request
  | ServerConnections_Ping_Request
  | ServerConnections_Refresh_Request
  | ServerConnections_CreateDatabase_Request
  | ServerConnections_DropDatabase_Request
  | ServerConnections_ServerSummary_Request
  | ServerConnections_SummaryCommand_Request;
