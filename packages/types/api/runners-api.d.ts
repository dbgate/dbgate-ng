export type Runners_Start_Request = {
  controller: "runners";
  action: "start";
  params: {
    script: string;
    args?: any;
  };
  response: {
    runid: string;
  };
};

export type Runners_GetNodeScript_Request = {
  controller: "runners";
  action: "getNodeScript";
  params: {
    script: string;
  };
  response: string;
};

export type Runners_Cancel_Request = {
  controller: "runners";
  action: "cancel";
  params: {
    runid: string;
  };
  response: boolean;
};

export type Runners_Files_Request = {
  controller: "runners";
  action: "files";
  params: {
    runid: string;
  };
  response: string[];
};

export type Runners_LoadReader_Request = {
  controller: "runners";
  action: "loadReader";
  params: {
    runid: string;
    file: string;
  };
  response: any;
};

export type Runners_ScriptResult_Request = {
  controller: "runners";
  action: "scriptResult";
  params: {
    runid: string;
  };
  response: any;
};

export type Runners_Request = 
  | Runners_Start_Request 
  | Runners_GetNodeScript_Request
  | Runners_Cancel_Request
  | Runners_Files_Request
  | Runners_LoadReader_Request
  | Runners_ScriptResult_Request;
