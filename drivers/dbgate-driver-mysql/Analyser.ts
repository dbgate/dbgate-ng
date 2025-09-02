// @ts-ignore - dbgate-tools types not available
import { DatabaseAnalyser, isTypeString, isTypeNumeric } from 'dbgate-tools';
import _ from 'lodash';
import * as sql from './sql/index.js';

function quoteDefaultValue(value: any): any {
  if (value == null) return value;
  if (!isNaN(value) && !isNaN(parseFloat(value))) return value;
  if (_.isString(value) && value.startsWith('CURRENT_')) return value;
  // keep NULL as default value. Is this really necessary?
  if (_.isString(value) && value?.toUpperCase() == 'NULL') return 'NULL';
  if (_.isString(value)) {
    return `'${value.replace("'", "\\'")}'`;
  }
  return value;
}

function normalizeTypeName(typeName: string): string {
  if (/int\(\d+\)/.test(typeName)) return 'int';
  return typeName;
}

function getColumnInfo(
  {
    isNullable,
    extra,
    columnName,
    dataType,
    charMaxLength,
    numericPrecision,
    numericScale,
    defaultValue,
    columnComment,
    columnType,
  }: any,
  driver: any
): any {
  const { quoteDefaultValues } = driver.__analyserInternals;
  let optionsInfo: any = {};

  const columnTypeTokens = _.isString(columnType) ? columnType.split(' ').map((x: string) => x.trim().toLowerCase()) : [];
  let fullDataType = dataType;
  if (charMaxLength && isTypeString(dataType)) fullDataType = `${dataType}(${charMaxLength})`;
  else if (numericPrecision && numericScale && isTypeNumeric(dataType))
    fullDataType = `${dataType}(${numericPrecision},${numericScale})`;
  else {
    const optionsTypeParts = columnType.match(/^(enum|set)\((.+)\)/i);
    if (optionsTypeParts?.length) {
      fullDataType = columnType;
      optionsInfo.options = optionsTypeParts[2].split(',').map((option: string) => option.substring(1, option.length - 1));
      optionsInfo.canSelectMultipleOptions = optionsTypeParts[1] == 'set';
    }
  }

  return {
    notNull: !isNullable || isNullable == 'NO' || isNullable == 'no',
    autoIncrement: !!(extra && extra.toLowerCase().includes('auto_increment')),
    columnName,
    columnComment,
    dataType: fullDataType,
    defaultValue: quoteDefaultValues ? quoteDefaultValue(defaultValue) : defaultValue,
    isUnsigned: columnTypeTokens.includes('unsigned'),
    isZerofill: columnTypeTokens.includes('zerofill'),
    ...optionsInfo,
  };
}

function getParametersSqlString(parameters: any[] = []): string {
  if (!parameters?.length) return '';

  return parameters
    .map((i: any) => {
      const mode = i.parameterMode ? `${i.parameterMode} ` : '';
      const dataType = i.dataType ? ` ${i.dataType.toUpperCase()}` : '';
      return mode + i.parameterName + dataType;
    })
    .join(', ');
}

export default class Analyser extends (DatabaseAnalyser as any) {
  constructor(dbhan: any, driver: any, version: any) {
    super(dbhan, driver, version);
  }

  createQuery(resFileName: string, typeFields: any, replacements: any = {}): any {
    let res = (sql as any)[resFileName];
    res = res.replace('#DATABASE#', this.dbhan.database);
    return super.createQuery(res, typeFields, replacements);
  }

  getRequestedViewNames(allViewNames: any): any {
    return this.getRequestedObjectPureNames('views', allViewNames);
  }

  async _computeSingleObjectId(): Promise<void> {
    const { pureName } = this.singleObjectFilter;
    this.singleObjectId = pureName;
  }

  async getViewTexts(allViewNames: any): Promise<any> {
    return this.createQuery('viewTexts', ['views'], { objectTypeField: 'views' }).then((resp: any) =>
      resp.rows.map((x: any) => ({
        pureName: x.pureName,
        createSql: `CREATE VIEW \`${x.pureName}\` AS ${x.definition}`,
      }))
    );
  }

  async _runAnalysis(): Promise<any> {
    const tables = await this.createQuery('tables', ['tables']);
    const columns = await this.createQuery('columns', ['tables', 'views']);
    const pkColumns = await this.createQuery('primaryKeys', ['tables']);
    const fkColumns = await this.createQuery('foreignKeys', ['tables']);
    const indexes = await this.createQuery('indexes', ['tables']);
    const uniqueNames = await this.createQuery('uniqueNames', ['tables']);
    const views = await this.createQuery('views', ['views']);
    const programmables = await this.createQuery('programmables', ['procedures', 'functions']);
    const triggers = await this.createQuery('triggers', ['triggers']);
    const parameters = await this.createQuery('parameters', ['procedures', 'functions']);
    const schedulerEvents = await this.createQuery('schedulerEvents', ['schedulerEvents']);

    return this.mergeAnalyseResult({
      tables: tables.rows.map((table: any) => ({
        ...table,
        objectTypeField: 'tables',
        columns: columns.rows
          .filter((col: any) => col.pureName == table.pureName)
          .map((col: any) => getColumnInfo(col, this.driver)),
        primaryKey: DatabaseAnalyser.extractPrimaryKeys(table, pkColumns.rows),
        foreignKeys: DatabaseAnalyser.extractForeignKeys(table, fkColumns.rows),
        indexes: DatabaseAnalyser.extractIndexes(table, indexes.rows),
        uniques: DatabaseAnalyser.extractUniques(table, uniqueNames.rows),
        triggers: triggers.rows.filter((x: any) => x.tableName == table.pureName),
      })),
      views: views.rows.map((view: any) => ({
        ...view,
        objectTypeField: 'views',
        columns: columns.rows
          .filter((col: any) => col.pureName == view.pureName)
          .map((col: any) => getColumnInfo(col, this.driver)),
      })),
      procedures: programmables.rows
        .filter((x: any) => x.objectType == 'PROCEDURE')
        .map((proc: any) => ({
          objectId: proc.objectId,
          pureName: proc.pureName,
          objectTypeField: 'procedures',
          createSql: `DELIMITER //\n\n${proc.definition}\n\nDELIMITER ;`,
          parameters: parameters.rows
            .filter((x: any) => x.objectId == proc.objectId)
            .map((param: any) => ({
              ...param,
              dataType: normalizeTypeName(param.dataType),
            })),
        })),
      functions: programmables.rows
        .filter((x: any) => x.objectType == 'FUNCTION')
        .map((func: any) => ({
          objectId: func.objectId,
          pureName: func.pureName,
          objectTypeField: 'functions',
          createSql: func.definition,
          parameters: parameters.rows
            .filter((x: any) => x.objectId == func.objectId)
            .map((param: any) => ({
              ...param,
              dataType: normalizeTypeName(param.dataType),
            })),
        })),
      schedulerEvents: schedulerEvents.rows.map((event: any) => ({
        ...event,
        objectTypeField: 'schedulerEvents',
        createSql: event.definition,
      })),
    });
  }

  async _getFastSnapshot(): Promise<any> {
    return this.createQuery('tables', ['tables']).then((resp: any) => ({
      tables: resp.rows,
    }));
  }

  async getModifications(): Promise<any> {
    const tableModificationsQueryData = await this.createQuery('tableModifications', ['tables']);
    const procedureModificationsQueryData = await this.createQuery('procedureModifications', ['procedures']);
    const functionModificationsQueryData = await this.createQuery('functionModifications', ['functions']);
    const triggerModificationsQueryData = await this.createQuery('triggersModifications', ['triggers']);
    const schedulerEventModificationsQueryData = await this.createQuery('schedulerEventsModifications', ['schedulerEvents']);

    return [
      ...tableModificationsQueryData.rows.map((x: any) => ({ ...x, objectTypeField: 'tables' })),
      ...procedureModificationsQueryData.rows.map((x: any) => ({ ...x, objectTypeField: 'procedures' })),
      ...functionModificationsQueryData.rows.map((x: any) => ({ ...x, objectTypeField: 'functions' })),
      ...triggerModificationsQueryData.rows.map((x: any) => ({ ...x, objectTypeField: 'triggers' })),
      ...schedulerEventModificationsQueryData.rows.map((x: any) => ({ ...x, objectTypeField: 'schedulerEvents' })),
    ];
  }
}
