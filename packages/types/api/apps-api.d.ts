export type Apps_Get_Request = {
  controller: "apps";
  action: "get";
  params: {};
  response: {
    installed: string[];
    available: string[];
  };
};

export type Apps_Request = Apps_Get_Request;
