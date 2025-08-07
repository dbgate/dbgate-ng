export type Metadata_ListObjects_Request = {
  controller: "metadata";
  action: "listObjects";
  params: {
    conid: string;
    database: string;
  };
  response: any[];
};

export type Metadata_TableInfo_Request = {
  controller: "metadata";
  action: "tableInfo";
  params: {
    conid: string;
    database: string;
    schemaName?: string;
    pureName: string;
  };
  response: any;
};

export type Metadata_SqlObjectInfo_Request = {
  controller: "metadata";
  action: "sqlObjectInfo";
  params: {
    conid: string;
    database: string;
    schemaName?: string;
    pureName: string;
    objectTypeField: string;
  };
  response: any;
};

export type Metadata_Request =
  | Metadata_ListObjects_Request
  | Metadata_TableInfo_Request
  | Metadata_SqlObjectInfo_Request;
