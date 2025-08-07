export type Archive_Folders_Request = {
  controller: "archive";
  action: "folders";
  params: {};
  response: {
    name: string;
    type: "jsonl" | "archive";
  }[];
};

export type Archive_CreateFolder_Request = {
  controller: "archive";
  action: "createFolder";
  params: {
    folder: string;
  };
  response: boolean;
};

export type Archive_Request =
  | Archive_Folders_Request
  | Archive_CreateFolder_Request;
