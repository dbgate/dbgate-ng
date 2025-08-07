export type Cloud_Config_Request = {
  controller: "cloud";
  action: "config";
  params: {};
  response: {
    oauth?: {
      url: string;
      scope?: string;
    };
    isElectron?: boolean;
  };
};

export type Cloud_Login_Request = {
  controller: "cloud";
  action: "login";
  params: {
    code: string;
  };
  response: {
    accessToken: string;
    user: {
      login: string;
      name?: string;
      email?: string;
    };
  };
};

export type Cloud_Logout_Request = {
  controller: "cloud";
  action: "logout";
  params: {};
  response: boolean;
};

export type Cloud_Profile_Request = {
  controller: "cloud";
  action: "profile";
  params: {};
  response: {
    login: string;
    name?: string;
    email?: string;
  };
};

export type Cloud_Request = 
  | Cloud_Config_Request 
  | Cloud_Login_Request 
  | Cloud_Logout_Request 
  | Cloud_Profile_Request;
