import { DatabaseInfo } from "./dbinfo";

export type StoredConnection = {
    _id?: string;
    conid?: string;
    server: string;
    engine: string;
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
    get(): { installed: string[]; available: string[]; };
};

export type ArchiveControllerContract = {
    folders(): { name: string; type: "jsonl" | "archive"; }[];
    createFolder(folder: string): boolean;
};

export type AuthControllerContract = {
    login(params: { user?: string; password?: string; authType?: string; }): { accessToken?: string; refreshToken?: string; permissions?: string[]; };
    logout(): boolean;
    refreshToken(refreshToken: string): { accessToken: string; };
    oauthToken(code: string, state?: string): { accessToken: string; refreshToken?: string; };
};

type CloudControllerContract = {
    config(): { oauth?: { url: string; scope?: string; }; isElectron?: boolean; };
    login(code: string): { accessToken: string; user: CloudUser; };
    logout(): boolean;
    profile(): CloudUser;
};

export type ConfigControllerContract = {
    get(): ConfigResponse;
    getSettings(): Record<string, any>;
    updateSettings(values: Record<string, any>): boolean;
    saveLicenseKey(licenseKey: string): { status: string; message?: string };
};

export type ConnectionsControllerContract = {
    list(): StoredConnection[];
    get(conid: string): StoredConnection;
    save(values: Partial<StoredConnection>): StoredConnection;
    delete(conid: string): boolean;
    test(values: Partial<StoredConnection>): { msgtype: "connected" | "error"; message?: string };
    newSqliteDatabase(file: string): StoredConnection;
};

export type DatabaseConnectionsControllerContract = {
    status(conid: string, database: string): { name: string; status: "ok" | "pending" | "error"; connection?: any; structure?: DatabaseInfo; };
    connect(conid: string, database: string): boolean;
    disconnect(conid: string, database: string): boolean;
    loadKeys(conid: string, database: string): any;
    loadDatabase(conid: string, database: string): DatabaseInfo;
};

export type FileInfo = {
    name: string;
    size?: number;
    isDirectory: boolean;
    modifiedTime?: string;
};

export type FilesControllerContract = {
    list(folder?: string): FileInfo[];
    read(file: string, encoding?: string): string;
    write(file: string, data: string, encoding?: string): boolean;
    delete(file: string): boolean;
    createFolder(folder: string): boolean;
    rename(file: string, newName: string): boolean;
};

export type JslDataControllerContract = {
    getInfo(jslid: string): { name: string; structure: any; };
};

export type MetadataControllerContract = {
    listObjects(conid: string, database: string): any[];
    tableInfo(conid: string, database: string, pureName: string, schemaName?: string): any;
    sqlObjectInfo(conid: string, database: string, pureName: string, objectTypeField: string, schemaName?: string): any;
};

export type PluginsControllerContract = {
    script(packageName: string, scriptName: string): string;
    search(query?: string): any[];
    info(packageName: string): any;
    installed(): any[];
    install(packageName: string): boolean;
    uninstall(packageName: string): boolean;
    upgrade(packageName: string): boolean;
    command(command: string): any;
    authTypes(): string[];
};

export type QueryHistoryControllerContract = {
    read(): any[];
    write(entry: any): boolean;
};

export type RunnersControllerContract = {
    start(script: string, args?: any): { runid: string; };
    getNodeScript(script: string): string;
    cancel(runid: string): boolean;
    files(runid: string): string[];
    loadReader(runid: string, file: string): any;
    scriptResult(runid: string): any;
};

type SchedulerControllerContract = {
    list(): any[];
};

type ServerConnectionsControllerContract = {
    disconnect(conid: string): boolean;
    listDatabases(conid: string): string[];
    version(conid: string): { version: string; versionText?: string; };
    serverStatus(conid: string): any;
    ping(conid: string): boolean;
    refresh(conid: string): boolean;
    createDatabase(conid: string, name: string): boolean;
    dropDatabase(conid: string, name: string): boolean;
    serverSummary(conid: string): any;
    summaryCommand(conid: string, command: string): any;
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

export type ApiCallFunction<T extends DbGateApiContract> = <
    K extends keyof T,
    M extends keyof T[K] & string,
    F extends T[K][M] & ((...args: any[]) => any)
>(controller: K, action: M, params: Parameters<F>[0]) => ReturnType<F>;
