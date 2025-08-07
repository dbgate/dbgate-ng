export type JslData_GetInfo_Request = {
  controller: "jsldata";
  action: "getInfo";
  params: {
    jslid: string;
  };
  response: {
    name: string;
    structure: any;
  };
};

export type JslData_Request = JslData_GetInfo_Request;
