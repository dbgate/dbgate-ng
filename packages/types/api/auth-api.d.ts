export type Auth_Login_Request = {
  controller: "auth";
  action: "login";
  params: {
    user?: string;
    password?: string;
    authType?: string;
  };
  response: {
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[];
  };
};

export type Auth_Logout_Request = {
  controller: "auth";
  action: "logout";
  params: {};
  response: boolean;
};

export type Auth_RefreshToken_Request = {
  controller: "auth";
  action: "refreshToken";
  params: {
    refreshToken: string;
  };
  response: {
    accessToken: string;
  };
};

export type Auth_OauthToken_Request = {
  controller: "auth";
  action: "oauthToken";
  params: {
    code: string;
    state?: string;
  };
  response: {
    accessToken: string;
    refreshToken?: string;
  };
};

export type Auth_Request =
  | Auth_Login_Request
  | Auth_Logout_Request
  | Auth_RefreshToken_Request
  | Auth_OauthToken_Request;
