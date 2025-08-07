export type Sessions_Create_Request = {
  controller: "sessions";
  action: "create";
  params: {
    conid: string;
    database: string;
  };
  response: {
    sesid: string;
  };
};

export type Sessions_ExecuteQuery_Request = {
  controller: "sessions";
  action: "executeQuery";
  params: {
    sesid: string;
    sql: string;
  };
  response: {
    msgid: string;
  };
};

export type Sessions_ExecuteControlCommand_Request = {
  controller: "sessions";
  action: "executeControlCommand";
  params: {
    sesid: string;
    command: string;
  };
  response: boolean;
};

export type Sessions_ExecuteReader_Request = {
  controller: "sessions";
  action: "executeReader";
  params: {
    sesid: string;
    sql: string;
  };
  response: {
    msgid: string;
  };
};

export type Sessions_Kill_Request = {
  controller: "sessions";
  action: "kill";
  params: {
    sesid: string;
  };
  response: boolean;
};

export type Sessions_Ping_Request = {
  controller: "sessions";
  action: "ping";
  params: {
    sesid: string;
  };
  response: boolean;
};

export type Sessions_StartProfiler_Request = {
  controller: "sessions";
  action: "startProfiler";
  params: {
    sesid: string;
  };
  response: boolean;
};

export type Sessions_StopProfiler_Request = {
  controller: "sessions";
  action: "stopProfiler";
  params: {
    sesid: string;
  };
  response: boolean;
};

export type Sessions_Request =
  | Sessions_Create_Request
  | Sessions_ExecuteQuery_Request
  | Sessions_ExecuteControlCommand_Request
  | Sessions_ExecuteReader_Request
  | Sessions_Kill_Request
  | Sessions_Ping_Request
  | Sessions_StartProfiler_Request
  | Sessions_StopProfiler_Request;
