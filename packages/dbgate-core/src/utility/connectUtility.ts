import fs from 'fs/promises';
import _ from 'lodash';

// Type definitions for connection-related interfaces
interface ConnectionInfo {
  _id?: string;
  database?: string;
  defaultDatabase?: string;
  server?: string;
  port?: string | number;
  user?: string;
  password?: string;
  isReadOnly?: boolean;
  useSsl?: boolean;
  sslCaFile?: string;
  sslCertFile?: string;
  sslKeyFile?: string;
  sslCertFilePassword?: string;
  sslRejectUnauthorized?: boolean;
  useSshTunnel?: boolean;
  [key: string]: any;
}

interface Driver {
  defaultPort?: number;
  readOnlySessions?: boolean;
  connect(props: any): Promise<any>;
}

interface SslConfig {
  ca?: Buffer;
  cert?: Buffer;
  key?: Buffer;
  password?: string;
  rejectUnauthorized?: boolean;
  sslCaFile?: string;
  sslCertFile?: string;
  sslKeyFile?: string;
}

interface PlatformInfo {
  allowShellConnection?: boolean;
  allowConnectionFromEnvVariables?: boolean;
}

interface ConnectionsController {
  _init(): Promise<void>;
  getCore(params: { conid: string }): Promise<ConnectionInfo>;
}

// Mock implementations for dependencies that need to be imported/implemented
let platformInfo: PlatformInfo = {
  allowShellConnection: true,
  allowConnectionFromEnvVariables: true,
};

let connections: ConnectionsController = {
  async _init() {
    // Implementation needed
  },
  async getCore(params: { conid: string }) {
    // Implementation needed
    throw new Error('Connection controller not implemented');
  }
};

// Mock functions that need to be implemented
function decryptConnection(connection: ConnectionInfo, encryptor?: any): ConnectionInfo {
  // Implementation needed - decrypt connection details
  return connection;
}

async function getSshTunnelProxy(connection: ConnectionInfo): Promise<any> {
  // Implementation needed - create SSH tunnel
  throw new Error('SSH tunnel proxy not implemented');
}

async function getCloudFolderEncryptor(folid: string): Promise<any> {
  // Implementation needed - get cloud folder encryptor
  throw new Error('Cloud folder encryptor not implemented');
}

type ConnectionMode = 'app' | 'read' | 'write' | 'script';

async function loadConnection(driver: Driver, storedConnection: ConnectionInfo, connectionMode: ConnectionMode): Promise<ConnectionInfo> {
  const { allowShellConnection, allowConnectionFromEnvVariables } = platformInfo;

  if (connectionMode === 'app') {
    return storedConnection;
  }

  if (storedConnection._id || !allowShellConnection) {
    if (!storedConnection._id) {
      throw new Error('Missing connection _id');
    }

    await connections._init();
    const loaded = await connections.getCore({ conid: storedConnection._id });
    const loadedWithDb = {
      ...loaded,
      database: storedConnection.database,
    };

    if (loaded.isReadOnly) {
      if (connectionMode === 'read') return loadedWithDb;
      if (connectionMode === 'write') throw new Error('Cannot write readonly connection');
      if (connectionMode === 'script') {
        if (driver.readOnlySessions) return loadedWithDb;
        throw new Error('Cannot write readonly connection');
      }
    }
    return loadedWithDb;
  }

  if (allowConnectionFromEnvVariables) {
    return _.mapValues(storedConnection, (value, key) => {
      if (_.isString(value) && value.startsWith('${') && value.endsWith('}')) {
        return process.env[value.slice(2, -1)];
      }
      return value;
    });
  }

  return storedConnection;
}

export async function extractConnectionSslParams(connection: ConnectionInfo): Promise<SslConfig | undefined> {
  let ssl: SslConfig | undefined = undefined;
  
  if (connection.useSsl) {
    ssl = {};

    if (connection.sslCaFile) {
      ssl.ca = await fs.readFile(connection.sslCaFile);
      ssl.sslCaFile = connection.sslCaFile;
    }

    if (connection.sslCertFile) {
      ssl.cert = await fs.readFile(connection.sslCertFile);
      ssl.sslCertFile = connection.sslCertFile;
    }

    if (connection.sslKeyFile) {
      ssl.key = await fs.readFile(connection.sslKeyFile);
      ssl.sslKeyFile = connection.sslKeyFile;
    }

    if (connection.sslCertFilePassword) {
      ssl.password = connection.sslCertFilePassword;
    }

    if (!ssl.key && !ssl.ca && !ssl.cert) {
      // TODO: provide this as an option in settings
      // or per-connection as 'reject self-signed certs'
      // How it works:
      // if false, cert can be self-signed
      // if true, has to be from a public CA
      // Heroku certs are self-signed.
      // if you provide ca/cert/key files, it overrides this
      ssl.rejectUnauthorized = false;
    } else {
      ssl.rejectUnauthorized = connection.sslRejectUnauthorized;
    }
  }
  
  return ssl;
}

async function decryptCloudConnection(connection: ConnectionInfo): Promise<ConnectionInfo> {
  const m = connection?._id?.match(/^cloud\:\/\/(.+)\/(.+)$/);
  if (!m) {
    throw new Error('Invalid cloud connection ID format');
  }

  const folid = m[1];
  const cntid = m[2];

  const folderEncryptor = await getCloudFolderEncryptor(folid);
  return decryptConnection(connection, folderEncryptor);
}

export async function connectUtility(
  driver: Driver, 
  storedConnection: ConnectionInfo, 
  connectionMode: ConnectionMode, 
  additionalOptions: any = null
): Promise<any> {
  const connectionLoaded = await loadConnection(driver, storedConnection, connectionMode);

  const connection = connectionLoaded?._id?.startsWith('cloud://')
    ? {
        database: connectionLoaded.defaultDatabase,
        ...(await decryptCloudConnection(connectionLoaded)),
      }
    : {
        database: connectionLoaded.defaultDatabase,
        ...decryptConnection(connectionLoaded),
      };

  if (!connection.port && driver.defaultPort) {
    connection.port = driver.defaultPort.toString();
  }

  if (connection.useSshTunnel) {
    const tunnel = await getSshTunnelProxy(connection);
    if (tunnel.state === 'error') {
      throw new Error(tunnel.message);
    }

    connection.server = tunnel.localHost;
    connection.port = tunnel.localPort;
  }

  // @ts-ignore
  connection.ssl = await extractConnectionSslParams(connection);

  const conn = await driver.connect({ conid: connectionLoaded?._id, ...connection, ...additionalOptions });
  return conn;
}

// Export functions to allow dependency injection
export function setPlatformInfo(info: PlatformInfo): void {
  platformInfo = info;
}

export function setConnectionsController(controller: ConnectionsController): void {
  connections = controller;
}
