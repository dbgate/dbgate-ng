export type Config_Get_Request = {
  controller: "config";
  action: "get";
  params: {};
  response: {
    login?: string;
    permissions?: string[];
    isUserLoggedIn: boolean;
    singleConnection?: any;
    configurationError?: string;
    isLicenseValid: boolean;
    logoutUrl?: string;
    isAdminPasswordMissing?: boolean;
    platformInfo: any;
    runAsPortal?: boolean;
    allowShellConnection?: boolean;
    allowShellScripting?: boolean;
    oauth?: any;
    authProviders?: any[];
  };
};

export type Config_GetSettings_Request = {
  controller: "config";
  action: "getSettings";
  params: {};
  response: Record<string, any>;
};

export type Config_UpdateSettings_Request = {
  controller: "config";
  action: "updateSettings";
  params: {
    values: Record<string, any>;
  };
  response: boolean;
};

export type Config_SaveLicenseKey_Request = {
  controller: "config";
  action: "saveLicenseKey";
  params: {
    licenseKey: string;
  };
  response: {
    status: string;
    message?: string;
  };
};

export type Config_Logout_Request = {
  controller: "config";
  action: "logout";
  params: {};
  response: boolean;
};

export type Config_Request =
  | Config_Get_Request
  | Config_GetSettings_Request
  | Config_UpdateSettings_Request
  | Config_SaveLicenseKey_Request
  | Config_Logout_Request;
