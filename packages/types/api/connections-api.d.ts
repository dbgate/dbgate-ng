export type Connection = {
  _id?: string;
  conid?: string;
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
  sshMode?: string;
  sshHost?: string;
  sshPort?: number;
  sshUser?: string;
  sshPassword?: string;
  sshKeyfile?: string;
  ssl?: boolean;
  isReadOnly?: boolean;
  defaultDatabase?: string;
};

export type Connections_List_Request = {
  controller: "connections";
  action: "list";
  params: {};
  response: Connection[];
};

export type Connections_Get_Request = {
  controller: "connections";
  action: "get";
  params: {
    conid: string;
  };
  response: Connection;
};

export type Connections_Save_Request = {
  controller: "connections";
  action: "save";
  params: {
    values: Partial<Connection>;
  };
  response: Connection;
};

export type Connections_Delete_Request = {
  controller: "connections";
  action: "delete";
  params: {
    conid: string;
  };
  response: boolean;
};

export type Connections_Test_Request = {
  controller: "connections";
  action: "test";
  params: {
    values: Partial<Connection>;
  };
  response: {
    msgtype: "connected" | "error";
    message?: string;
  };
};

export type Connections_NewSqliteDatabase_Request = {
  controller: "connections";
  action: "newSqliteDatabase";
  params: {
    file: string;
  };
  response: Connection;
};

export type Connections_Request = 
  | Connections_List_Request 
  | Connections_Get_Request 
  | Connections_Save_Request 
  | Connections_Delete_Request 
  | Connections_Test_Request 
  | Connections_NewSqliteDatabase_Request;
