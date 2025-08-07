export type Uploads_UploadErrorToGist_Request = {
  controller: "uploads";
  action: "uploadErrorToGist";
  params: {
    data: any;
  };
  response: {
    url: string;
  };
};

export type Uploads_DeleteGist_Request = {
  controller: "uploads";
  action: "deleteGist";
  params: {
    gistId: string;
  };
  response: boolean;
};

export type Uploads_Request = 
  | Uploads_UploadErrorToGist_Request 
  | Uploads_DeleteGist_Request;
