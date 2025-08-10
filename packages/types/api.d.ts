export type Connection = {
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

type ConfigResponse = {
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

type CloudUser = {
    login: string;
    name?: string;
    email?: string;
};

type DatabaseInfo = {
    name: string;
    tables?: any[];
    views?: any[];
    procedures?: any[];
    functions?: any[];
    triggers?: any[];
    schemas?: any[];
};

type AppsControllerContract = {
    get(): { installed: string[]; available: string[]; };
};

type ArchiveControllerContract = {
    folders(): { name: string; type: "jsonl" | "archive"; }[];
    createFolder(folder: string): boolean;
};

type AuthControllerContract = {
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

type ConfigControllerContract = {
    get(): ConfigResponse;
    getSettings(): Record<string, any>;
    updateSettings(values: Record<string, any>): boolean;
    saveLicenseKey(licenseKey: string): { status: string; message?: string };
};

type ConnectionControllerContract = {
    list(): Connection[];
    get(conid: string): Connection;
    save(values: Partial<Connection>): Connection;
    delete(conid: string): boolean;
    test(values: Partial<Connection>): { msgtype: "connected" | "error"; message?: string };
    newSqliteDatabase(file: string): Connection;
};

type DatabaseConnectionsControllerContract = {
    status(conid: string, database: string): { name: string; status: "ok" | "pending" | "error"; connection?: any; structure?: DatabaseInfo; };
    connect(conid: string, database: string): boolean;
    disconnect(conid: string, database: string): boolean;
    loadKeys(conid: string, database: string): any;
    loadDatabase(conid: string, database: string): DatabaseInfo;
};

type FileInfo = {
    name: string;
    size?: number;
    isDirectory: boolean;
    modifiedTime?: string;
};

type FilesControllerContract = {
    list(folder?: string): FileInfo[];
    read(file: string, encoding?: string): string;
    write(file: string, data: string, encoding?: string): boolean;
    delete(file: string): boolean;
    createFolder(folder: string): boolean;
    rename(file: string, newName: string): boolean;
};

type JslDataControllerContract = {
    getInfo(jslid: string): { name: string; structure: any; };
};

type MetadataControllerContract = {
    listObjects(conid: string, database: string): any[];
    tableInfo(conid: string, database: string, pureName: string, schemaName?: string): any;
    sqlObjectInfo(conid: string, database: string, pureName: string, objectTypeField: string, schemaName?: string): any;
};

type PluginsControllerContract = {
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

type QueryHistoryControllerContract = {
    read(): any[];
    write(entry: any): boolean;
};

type RunnersControllerContract = {
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

type DbGateApiContract = {
    apps: AppsControllerContract;
    archive: ArchiveControllerContract;
    auth: AuthControllerContract;
    cloud: CloudControllerContract;
    config: ConfigControllerContract;
    connection: ConnectionControllerContract;
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

type ApiCallFunction<T extends DbGateApiContract> = <
    K extends keyof T,
    M extends keyof T[K] & string,
    F extends T[K][M] & ((...args: any[]) => any)
>(controller: K, action: M, params: Parameters<F>[0]) => ReturnType<F>;
