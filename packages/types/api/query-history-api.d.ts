export type QueryHistory_Read_Request = {
  controller: "queryHistory";
  action: "read";
  params: {};
  response: any[];
};

export type QueryHistory_Write_Request = {
  controller: "queryHistory";
  action: "write";
  params: {
    entry: any;
  };
  response: boolean;
};

export type QueryHistory_Request = 
  | QueryHistory_Read_Request 
  | QueryHistory_Write_Request;
