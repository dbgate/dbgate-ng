export type Plugins_Script_Request = {
  controller: "plugins";
  action: "script";
  params: {
    packageName: string;
    scriptName: string;
  };
  response: string;
};

export type Plugins_Search_Request = {
  controller: "plugins";
  action: "search";
  params: {
    query?: string;
  };
  response: any[];
};

export type Plugins_Info_Request = {
  controller: "plugins";
  action: "info";
  params: {
    packageName: string;
  };
  response: any;
};

export type Plugins_Installed_Request = {
  controller: "plugins";
  action: "installed";
  params: {};
  response: any[];
};

export type Plugins_Install_Request = {
  controller: "plugins";
  action: "install";
  params: {
    packageName: string;
  };
  response: boolean;
};

export type Plugins_Uninstall_Request = {
  controller: "plugins";
  action: "uninstall";
  params: {
    packageName: string;
  };
  response: boolean;
};

export type Plugins_Upgrade_Request = {
  controller: "plugins";
  action: "upgrade";
  params: {
    packageName: string;
  };
  response: boolean;
};

export type Plugins_Command_Request = {
  controller: "plugins";
  action: "command";
  params: {
    command: string;
  };
  response: any;
};

export type Plugins_AuthTypes_Request = {
  controller: "plugins";
  action: "authTypes";
  params: {};
  response: string[];
};

export type Plugins_Request = 
  | Plugins_Script_Request
  | Plugins_Search_Request
  | Plugins_Info_Request
  | Plugins_Installed_Request 
  | Plugins_Install_Request 
  | Plugins_Uninstall_Request
  | Plugins_Upgrade_Request
  | Plugins_Command_Request
  | Plugins_AuthTypes_Request;
