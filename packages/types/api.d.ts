import { DatabaseInfo } from "./dbinfo";

export type StoredConnection = {
    _id?: string;
    conid?: string;
    server?: string;
    engine?: string;
    user?: string;
    password?: string;
    port?: number;
    database?: string;
    displayName?: string;
    authType?: string;
    useDatabaseUrl?: boolean;
    databaseUrl?: string;
    sshMode?: string;
    sshHost?: string;
    sshPort?: number;
    sshUser?: string;
    sshPassword?: string;
    sshKeyfile?: string;
    ssl?: boolean;
    isReadOnly?: boolean;
    defaultDatabase?: string;
};

export type ConfigResponse = {
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

export type CloudUser = {
    login: string;
    name?: string;
    email?: string;
};

export type AppsControllerContract = {
    get(params: {}): Promise<{ installed: string[]; available: string[]; }>;
};

export type ArchiveControllerContract = {
    folders(params: {}): Promise<{ name: string; type: "jsonl" | "archive"; }[]>;
    createFolder(params: { folder: string }): Promise<boolean>;
};

export type AuthControllerContract = {
    login(params: { user?: string; password?: string; authType?: string; }): Promise<{ accessToken?: string; refreshToken?: string; permissions?: string[]; }>;
    logout(params: {}): Promise<boolean>;
    refreshToken(params: { refreshToken: string }): Promise<{ accessToken: string; }>;
    oauthToken(params: { code: string; state?: string }): Promise<{ accessToken: string; refreshToken?: string; }>;
};

export type CloudControllerContract = {
    config(params: {}): Promise<{ oauth?: { url: string; scope?: string; }; isElectron?: boolean; }>;
    login(params: { code: string }): Promise<{ accessToken: string; user: CloudUser; }>;
    logout(params: {}): Promise<boolean>;
    profile(params: {}): Promise<CloudUser>;
};

export type ConfigControllerContract = {
    get(params: {}): Promise<ConfigResponse>;
    getSettings(params: {}): Promise<Record<string, any>>;
    updateSettings(params: { values: Record<string, any> }): Promise<boolean>;
    saveLicenseKey(params: { licenseKey: string }): Promise<{ status: string; message?: string }>;
};

export type ConnectionsControllerContract = {
    list(params: {}): Promise<StoredConnection[]>;
    get(params: { conid: string }): Promise<StoredConnection>;
    save(params: { values: Partial<StoredConnection> }): Promise<StoredConnection>;
    delete(params: { conid: string }): Promise<boolean>;
    test(params: { values: Partial<StoredConnection> }): Promise<{ msgtype: "connected" | "error"; message?: string }>;
    newSqliteDatabase(params: { file: string }): Promise<StoredConnection>;
};

export type DatabaseConnectionsControllerContract = {
    status(params: { conid: string; database: string }): Promise<{ name: string; status: "ok" | "pending" | "error"; connection?: any; structure?: DatabaseInfo; }>;
    connect(params: { conid: string; database: string }): Promise<boolean>;
    disconnect(params: { conid: string; database: string }): Promise<boolean>;
    loadKeys(params: { conid: string; database: string }): Promise<any>;
    loadDatabase(params: { conid: string; database: string }): Promise<DatabaseInfo>;
};

export type FileInfo = {
    name: string;
    size?: number;
    isDirectory: boolean;
    modifiedTime?: string;
};

export type FilesControllerContract = {
    list(params: { folder?: string }): Promise<FileInfo[]>;
    read(params: { file: string; encoding?: string }): Promise<string>;
    write(params: { file: string; data: string; encoding?: string }): Promise<boolean>;
    delete(params: { file: string }): Promise<boolean>;
    createFolder(params: { folder: string }): Promise<boolean>;
    rename(params: { file: string; newName: string }): Promise<boolean>;
};

export type JslDataControllerContract = {
    getInfo(params: { jslid: string }): Promise<{ name: string; structure: any; }>;
};

export type MetadataControllerContract = {
    listObjects(params: { conid: string; database: string }): Promise<any[]>;
    tableInfo(params: { conid: string; database: string; pureName: string; schemaName?: string }): Promise<any>;
    sqlObjectInfo(params: { conid: string; database: string; pureName: string; objectTypeField: string; schemaName?: string }): Promise<any>;
};

export type PluginsControllerContract = {
    script(params: { packageName: string; scriptName: string }): Promise<string>;
    search(params: { query?: string }): Promise<any[]>;
    info(params: { packageName: string }): Promise<any>;
    installed(params: {}): Promise<any[]>;
    install(params: { packageName: string }): Promise<boolean>;
    uninstall(params: { packageName: string }): Promise<boolean>;
    upgrade(params: { packageName: string }): Promise<boolean>;
    command(params: { command: string }): Promise<any>;
    authTypes(params: {}): Promise<string[]>;
};

export type QueryHistoryControllerContract = {
    read(params: {}): Promise<any[]>;
    write(params: { entry: any }): Promise<boolean>;
};

export type RunnersControllerContract = {
    start(params: { script: string; args?: any }): Promise<{ runid: string; }>;
    getNodeScript(params: { script: string }): Promise<string>;
    cancel(params: { runid: string }): Promise<boolean>;
    files(params: { runid: string }): Promise<string[]>;
    loadReader(params: { runid: string; file: string }): Promise<any>;
    scriptResult(params: { runid: string }): Promise<any>;
};

export type SchedulerControllerContract = {
    list(params: {}): Promise<any[]>;
};

export type ServerConnectionsControllerContract = {
    disconnect(params: { conid: string }): Promise<boolean>;
    listDatabases(params: { conid: string }): Promise<string[]>;
    version(params: { conid: string }): Promise<{ version: string; versionText?: string; }>;
    serverStatus(params: { conid: string }): Promise<any>;
    ping(params: { conid: string }): Promise<boolean>;
    refresh(params: { conid: string }): Promise<boolean>;
    createDatabase(params: { conid: string; name: string }): Promise<boolean>;
    dropDatabase(params: { conid: string; name: string }): Promise<boolean>;
    serverSummary(params: { conid: string }): Promise<any>;
    summaryCommand(params: { conid: string; command: string }): Promise<any>;
};

export type DbGateApiContract = {
    apps: AppsControllerContract;
    archive: ArchiveControllerContract;
    auth: AuthControllerContract;
    cloud: CloudControllerContract;
    config: ConfigControllerContract;
    connections: ConnectionsControllerContract;
    databaseConnections: DatabaseConnectionsControllerContract;
    files: FilesControllerContract;
    jslData: JslDataControllerContract;
    metadata: MetadataControllerContract;
    plugins: PluginsControllerContract;
    queryHistory: QueryHistoryControllerContract;
    runners: RunnersControllerContract;
    scheduler: SchedulerControllerContract;
    serverConnections: ServerConnectionsControllerContract;
};

export type AddMetaFields<T> = T & {
    [K in keyof T as `${string & K}_meta`]: true;
};

export type ApiCallFunctionGeneric<T extends DbGateApiContract> = <
    K extends keyof T,
    M extends keyof T[K] & string,
    F extends T[K][M] & ((args: Parameters<F>) => any)
>(controller: K, action: M, params: Parameters<F>) => ReturnType<F>;

export type ApiCallFunction = ApiCallFunctionGeneric<DbGateApiContract>;
