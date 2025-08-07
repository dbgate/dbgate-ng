import _ from "lodash";
import type {
  CheckInfo,
  ColumnInfo,
  ColumnsConstraintInfo,
  ConstraintInfo,
  DatabaseInfo,
  ForeignKeyInfo,
  IndexInfo,
  NamedObjectInfo,
  PrimaryKeyInfo,
  SqlObjectInfo,
  TableInfo,
  UniqueInfo,
} from "../../types";

export class DatabaseInfoAlterProcessor {
  constructor(public db: DatabaseInfo) {}

  createTable(table: TableInfo) {
    this.db.tables.push(table);
  }

  dropTable(table: TableInfo) {
    _.remove(
      this.db.tables,
      (x) => x.pureName === table.pureName && x.schemaName === table.schemaName
    );
  }

  createSqlObject(obj: SqlObjectInfo) {
    this.db[obj.objectTypeField].push(obj);
  }

  dropSqlObject(obj: SqlObjectInfo) {
    _.remove(
      this.db[obj.objectTypeField] as SqlObjectInfo[],
      (x) => x.pureName === obj.pureName && x.schemaName === obj.schemaName
    );
  }

  createColumn(column: ColumnInfo) {
    const table = this.db.tables.find(
      (x) =>
        x.pureName === column.pureName && x.schemaName === column.schemaName
    );
    if (!table)
      throw new Error(
        `createColumn error, cannot find table: ${column.schemaName}.${column.pureName}`
      );
    table.columns.push(column);
  }

  changeColumn(oldColumn: ColumnInfo, newColumn: ColumnInfo) {
    const table = this.db.tables.find(
      (x) =>
        x.pureName === oldColumn.pureName &&
        x.schemaName === oldColumn.schemaName
    );
    if (!table)
      throw new Error(
        `changeColumn error, cannot find table: ${oldColumn.schemaName}.${oldColumn.pureName}`
      );
    table.columns = table.columns.map((x) =>
      x.columnName === oldColumn.columnName ? newColumn : x
    );
  }

  dropColumn(column: ColumnInfo) {
    const table = this.db.tables.find(
      (x) =>
        x.pureName === column.pureName && x.schemaName === column.schemaName
    );
    if (!table)
      throw new Error(
        `dropColumn error, cannot find table: ${column.schemaName}.${column.pureName}`
      );
    _.remove(table.columns, (x) => x.columnName === column.columnName);
  }

  createConstraint(constraint: ConstraintInfo) {
    const table = this.db.tables.find(
      (x) =>
        x.pureName === constraint.pureName &&
        x.schemaName === constraint.schemaName
    );
    switch (constraint.constraintType) {
      case "primaryKey":
        table.primaryKey = constraint as PrimaryKeyInfo;
        break;
      case "sortingKey":
        table.sortingKey = constraint as ColumnsConstraintInfo;
        break;
      case "foreignKey":
        table.foreignKeys.push(constraint as ForeignKeyInfo);
        break;
      case "index":
        table.indexes.push(constraint as IndexInfo);
        break;
      case "unique":
        table.uniques.push(constraint as UniqueInfo);
        break;
      case "check":
        table.checks.push(constraint as CheckInfo);
        break;
    }
  }

  changeConstraint(
    oldConstraint: ConstraintInfo,
    _newConstraint: ConstraintInfo
  ) {
    const _table = this.db.tables.find(
      (x) =>
        x.pureName === oldConstraint.pureName &&
        x.schemaName === oldConstraint.schemaName
    );
  }

  dropConstraint(constraint: ConstraintInfo) {
    const table = this.db.tables.find(
      (x) =>
        x.pureName === constraint.pureName &&
        x.schemaName === constraint.schemaName
    );
    switch (constraint.constraintType) {
      case "primaryKey":
        table.primaryKey = null;
        break;
      case "sortingKey":
        table.sortingKey = null;
        break;
      case "foreignKey":
        table.foreignKeys = table.foreignKeys.filter(
          (x) => x.constraintName !== constraint.constraintName
        );
        break;
      case "index":
        table.indexes = table.indexes.filter(
          (x) => x.constraintName !== constraint.constraintName
        );
        break;
      case "unique":
        table.uniques = table.uniques.filter(
          (x) => x.constraintName !== constraint.constraintName
        );
        break;
      case "check":
        table.checks = table.checks.filter(
          (x) => x.constraintName !== constraint.constraintName
        );
        break;
    }
  }

  renameTable(table: TableInfo, newName: string) {
    this.db.tables.find(
      (x) => x.pureName === table.pureName && x.schemaName === table.schemaName
    ).pureName = newName;
  }

  renameSqlObject(obj: SqlObjectInfo, newName: string) {
    this.db[obj.objectTypeField].find(
      (x) => x.pureName === obj.pureName && x.schemaName === obj.schemaName
    ).pureName = newName;
  }

  renameColumn(column: ColumnInfo, newName: string) {
    const table = this.db.tables.find(
      (x) =>
        x.pureName === column.pureName && x.schemaName === column.schemaName
    );
    table.columns.find((x) => x.columnName === column.columnName).columnName =
      newName;
  }

  renameConstraint(_constraint: ConstraintInfo, _newName: string) {}

  recreateTable(_oldTable: TableInfo, _newTable: TableInfo) {
    throw new Error(
      "recreateTable not implemented for DatabaseInfoAlterProcessor"
    );
  }

  fillPreloadedRows(
    table: NamedObjectInfo,
    _oldRows: any[],
    newRows: any[],
    key: string[],
    insertOnly: string[],
    _autoIncrementColumn: string
  ) {
    const tableInfo = this.db.tables.find(
      (x) => x.pureName === table.pureName && x.schemaName === table.schemaName
    );
    tableInfo.preloadedRows = newRows;
    tableInfo.preloadedRowsKey = key;
    tableInfo.preloadedRowsInsertOnly = insertOnly;
  }

  setTableOption(table: TableInfo, optionName: string, optionValue: string) {
    const tableInfo = this.db.tables.find(
      (x) => x.pureName === table.pureName && x.schemaName === table.schemaName
    );
    tableInfo[optionName] = optionValue;
  }
}
