export type FileInfo = {
  name: string;
  size?: number;
  isDirectory: boolean;
  modifiedTime?: string;
};

export type Files_List_Request = {
  controller: "files";
  action: "list";
  params: {
    folder?: string;
  };
  response: FileInfo[];
};

export type Files_Read_Request = {
  controller: "files";
  action: "read";
  params: {
    file: string;
    encoding?: string;
  };
  response: string;
};

export type Files_Write_Request = {
  controller: "files";
  action: "write";
  params: {
    file: string;
    data: string;
    encoding?: string;
  };
  response: boolean;
};

export type Files_Delete_Request = {
  controller: "files";
  action: "delete";
  params: {
    file: string;
  };
  response: boolean;
};

export type Files_CreateFolder_Request = {
  controller: "files";
  action: "createFolder";
  params: {
    folder: string;
  };
  response: boolean;
};

export type Files_Rename_Request = {
  controller: "files";
  action: "rename";
  params: {
    file: string;
    newName: string;
  };
  response: boolean;
};

export type Files_Request =
  | Files_List_Request
  | Files_Read_Request
  | Files_Write_Request
  | Files_Delete_Request
  | Files_CreateFolder_Request
  | Files_Rename_Request;
