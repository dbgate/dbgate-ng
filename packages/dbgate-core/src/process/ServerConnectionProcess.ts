import { StoredConnection } from '../../../dbgate-types';
import { ProcessBase } from './ProcessBase';

export class ServerConnectionProcess extends ProcessBase {
  connection?: StoredConnection;

  constructor() {
    super();
    this.moduleName = './ServerConnectionProcess';
  }

  async getDatabases() {
    return ['database1', 'database2', 'database3'];
  }

  async getTableList(database: string) {
    return [`${database}_table1`, `${database}_table2`];
  }

  async connect(connection: StoredConnection) {
    this.connection = connection;
  }
}
