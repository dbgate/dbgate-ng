import { DatabaseHandle, StoredConnection } from 'dbgate-types';
import { ProcessBase } from './ProcessBase';
import { connectUtility } from '../utility/connectUtility';

export class ServerConnectionProcess extends ProcessBase {
  connection?: StoredConnection;
  dbhan: DatabaseHandle;

  constructor() {
    super();
    this.moduleName = './ServerConnectionProcess';
  }

  async listDatabases() {
    return [{ name: 'database1' }, { name: 'database2' }, { name: 'database3' }];
  }

  async getTableList(database: string) {
    return [`${database}_table1`, `${database}_table2`];
  }

  async connect(connection: StoredConnection) {
    this.connection = connection;
    this.dbhan = await connectUtility(driver, connection, 'app');
  }
}
