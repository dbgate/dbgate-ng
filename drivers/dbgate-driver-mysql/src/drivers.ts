// @ts-ignore - dbgate-tools types not available
import { getLogger, createBulkInsertStreamBase, makeUniqueColumnNames, extractErrorLogData } from 'dbgate-tools';
import _ from 'lodash';
import stream from 'node:stream';
// @ts-ignore - frontend drivers types not available
import driverBases from '../frontend/drivers';
import Analyser from './Analyser.js';
// @ts-ignore - mysql2 types
import mysql2 from 'mysql2';
import { EngineAuthType } from 'dbgate-types';

const logger = getLogger('mysqlDriver');

let authProxy: any;

function extractColumns(fields: any): any[] | null {
  if (fields) {
    const res = fields.map((col: any) => ({
      columnName: col.name,
    }));
    makeUniqueColumnNames(res);
    return res;
  }
  return null;
}

function zipDataRow(rowArray: any[], columns: any[]): any {
  return _.zipObject(
    columns.map((x: any) => x.columnName),
    rowArray
  );
}

const drivers = driverBases.map((driverBase: any) => ({
  ...driverBase,
  analyserClass: Analyser,

  async connect(props: any): Promise<any> {
    const { conid, server, port, user, password, database, ssl, isReadOnly, forceRowsAsObjects, socketPath, authType } =
      props;
    let awsIamToken = null;
    if (authType == 'awsIam') {
      awsIamToken = await authProxy.getAwsIamToken(props);
    }

    const options = {
      host: authType == 'socket' ? null : server,
      port: authType == 'socket' ? null : port,
      socketPath: authType == 'socket' ? socketPath || driverBase.defaultSocketPath : null,
      user,
      password: awsIamToken || password,
      database,
      ssl: authType == 'awsIam' ? ssl || { rejectUnauthorized: false } : ssl,
      rowsAsArray: forceRowsAsObjects ? false : true,
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      // TODO: test following options
      // multipleStatements: true,
    };

    const client = mysql2.createConnection(options);
    const dbhan = {
      client,
      database,
      conid,
    };
    if (isReadOnly) {
      await this.query(dbhan, 'SET SESSION TRANSACTION READ ONLY');
    }
    return dbhan;
  },

  close(dbhan: any): Promise<void> {
    return new Promise(resolve => {
      dbhan.client.end(resolve);
    });
  },

  query(dbhan: any, sql: string, options?: any): Promise<any> {
    if (sql == null) {
      return Promise.resolve({
        rows: [],
        columns: [],
      });
    }

    if (
      options?.importSqlDump &&
      (sql.trim().startsWith('/*!') || sql.trim().startsWith('/*M!')) &&
      (sql.includes('character_set_client') || sql.includes('NOTE_VERBOSITY'))
    ) {
      // skip this in SQL dumps
      return Promise.resolve({
        rows: [],
        columns: [],
      });
    }

    return new Promise((resolve, reject) => {
      dbhan.client.query(sql, function (error: any, results: any, fields: any) {
        if (error) reject(error);
        const columns = extractColumns(fields);
        resolve({
          rows: results && columns && results.map && results.map((row: any) => zipDataRow(row, columns)),
          columns,
        });
      });
    });
  },

  async stream(dbhan: any, sql: string, options: any): Promise<void> {
    const query = dbhan.client.query(sql);
    let columns: any[] = [];

    const handleEnd = () => {
      options.done();
    };

    const handleRow = (row: any) => {
      if (row && row.constructor && (row.constructor.name == 'OkPacket' || row.constructor.name == 'ResultSetHeader')) {
        options.info({
          message: `${row.affectedRows} rows affected`,
          time: new Date(),
          severity: 'info',
        });
      } else {
        if (columns) {
          options.row(zipDataRow(row, columns));
        }
      }
    };

    const handleFields = (fields: any) => {
      columns = extractColumns(fields)!;
      if (columns) options.recordset(columns);
    };

    const handleError = (error: any) => {
      logger.error(extractErrorLogData(error, this.getLogDbInfo(dbhan)), 'DBGM-00200 Stream error');
      const { message } = error;
      options.info({
        message,
        line: 0,
        time: new Date(),
        severity: 'error',
      });
    };

    query.on('error', handleError).on('fields', handleFields).on('result', handleRow).on('end', handleEnd);
  },

  async readQuery(dbhan: any, sql: string, structure?: any): Promise<any> {
    const query = dbhan.client.query(sql);

    const pass = new stream.PassThrough({
      objectMode: true,
      highWaterMark: 100,
    });

    let columns: any[] = [];
    query
      .on('error', (err: any) => {
        console.error(err);
        pass.end();
      })
      .on('fields', (fields: any) => {
        columns = extractColumns(fields)!;
        pass.write({
          __isStreamHeader: true,
          ...(structure || { columns }),
        });
      })
      .on('result', (row: any) => pass.write(zipDataRow(row, columns)))
      .on('end', () => pass.end());

    return pass;
  },

  async getVersion(dbhan: any): Promise<any> {
    const { rows } = await this.query(dbhan, "show variables like 'version'");
    const version = rows[0].Value;
    if (version) {
      const m = version.match(/(.*)-MariaDB-/);
      if (m) {
        return {
          version,
          versionText: `MariaDB ${m[1]}`,
        };
      }
    }

    return {
      version,
      versionText: `MySQL ${version}`,
    };
  },

  async listDatabases(dbhan: any): Promise<any[]> {
    const { rows } = await this.query(dbhan, 'show databases');
    return rows.map((x: any) => ({ name: x.Database }));
  },

  async listVariables(dbhan: any): Promise<any[]> {
    const { rows } = await this.query(dbhan, 'SHOW VARIABLES');
    return rows.map((row: any) => ({
      variable: row.Variable_name,
      value: row.Value,
    }));
  },

  async listProcesses(dbhan: any): Promise<any[]> {
    const { rows } = await this.query(dbhan, 'SHOW FULL PROCESSLIST');
    return rows.map((row: any) => ({
      processId: row.Id,
      connectionId: null,
      client: row.Host,
      operation: row.Info,
      namespace: row.Database,
      runningTime: row.Time,
      state: row.State,
      waitingFor: row.State && row.State.includes('Waiting'),
    }));
  },

  async killProcess(dbhan: any, processId: string): Promise<void> {
    await this.query(dbhan, `KILL ${processId}`);
  },

  async serverSummary(dbhan: any): Promise<any> {
    const [variables, processes, databases] = await Promise.all([
      this.listVariables(dbhan),
      this.listProcesses(dbhan),
      this.listDatabases(dbhan),
    ]);

    return {
      variables,
      processes: processes.map((p: any) => ({
        processId: p.processId,
        connectionId: p.connectionId,
        client: p.client,
        operation: p.operation,
        namespace: p.namespace,
        runningTime: p.runningTime,
        state: p.state,
        waitingFor: p.waitingFor,
      })),
      databases: {
        rows: databases.map((db: any) => ({
          name: db.name,
        })),
        columns: [
          {
            filterable: true,
            sortable: true,
            header: 'Database',
            fieldName: 'name',
            type: 'data',
          },
        ],
      },
    };
  },

  async writeTable(dbhan: any, name: any, options: any): Promise<any> {
    // @ts-ignore
    return createBulkInsertStreamBase(this, stream, dbhan, name, options);
  },

  getAuthTypes(): EngineAuthType[] {
    const res: EngineAuthType[] = [
      {
        title: 'Host and port',
        name: 'hostPort',
        disabledFields: ['socketPath'],
      },
      {
        title: 'Socket',
        name: 'socket',
        disabledFields: ['server', 'port'],
      },
    ];
    if (authProxy.supportsAwsIam()) {
      res.push({
        title: 'AWS IAM',
        name: 'awsIam',
      });
    }
    return res;
  },
}));

(drivers as any).initialize = (dbgateEnv: any) => {
  authProxy = dbgateEnv.authProxy;
};

export default drivers;
