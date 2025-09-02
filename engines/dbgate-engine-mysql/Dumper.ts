// @ts-ignore - dbgate-tools types not available
import { SqlDumper, arrayToHexString } from 'dbgate-tools';
// @ts-ignore - lodash types
import isArray from 'lodash/isArray';

// Type definitions
type TransformType = 'GROUP:YEAR' | 'YEAR' | 'MONTH' | 'DAY' | 'GROUP:MONTH' | 'GROUP:DAY' | string;
type NamedObjectInfo = any;
type ColumnInfo = any;
type ConstraintInfo = any;

export default class Dumper extends (SqlDumper as any) {
  transform(type: TransformType, dumpExpr: () => void): void {
    switch (type) {
      case 'GROUP:YEAR':
      case 'YEAR':
        this.put('^year(%c)', dumpExpr);
        break;
      case 'MONTH':
        this.put('^month(%c)', dumpExpr);
        break;
      case 'DAY':
        this.put('^day(%c)', dumpExpr);
        break;
      case 'GROUP:MONTH':
        this.put("^date_format(%c, '%s')", dumpExpr, '%Y-%m');
        break;
      case 'GROUP:DAY':
        this.put("^date_format(%c, '%s')", dumpExpr, '%Y-%m-%d');
        break;
      default:
        dumpExpr();
        break;
    }
  }

  renameTable(obj: NamedObjectInfo, newName: string): void {
    this.putCmd('^rename ^table %f ^to %i', obj, newName);
  }

  changeColumn(oldcol: ColumnInfo, newcol: ColumnInfo, constraints: ConstraintInfo[]): void {
    if (!oldcol.notNull) {
      this.fillNewNotNullDefaults({
        ...newcol,
        columnName: oldcol.columnName,
      });
    }
    this.put('^alter ^table %f ^change ^column %i %i ', oldcol, oldcol.columnName, newcol.columnName);
    this.columnDefinition(newcol);
    this.inlineConstraints(constraints);
    this.endCommand();
  }

  autoIncrement(): void {}

  specialColumnOptions(column: ColumnInfo): void {
    if (column.isUnsigned) {
      this.put('^unsigned ');
    }
    if (column.isZerofill) {
      this.put('^zerofill ');
    }
    if (column.autoIncrement) {
      this.put('^auto_increment ');
    }
  }

  columnDefinition(col: ColumnInfo, options?: any): void {
    super.columnDefinition(col, options);
    if (col.columnComment) {
      this.put(' ^comment %v ', col.columnComment);
    }
  }

  renameColumn(column: ColumnInfo, newcol: string): void {
    this.changeColumn(
      column,
      {
        ...column,
        columnName: newcol,
      },
      []
    );
  }

  enableConstraints(table: NamedObjectInfo, enabled: boolean): void {
    this.putCmd('^set FOREIGN_KEY_CHECKS = %s', enabled ? '1' : '0');
  }

  comment(value: string): void {
    this.put('/* %s */', value);
  }

  beginTransaction(): void {
    this.putCmd('^start ^transaction');
  }

  selectTableIntoNewTable(sourceName: NamedObjectInfo, targetName: NamedObjectInfo): void {
    this.putCmd('^create ^table %f (^select * ^from %f)', targetName, sourceName);
  }

  putByteArrayValue(value: Uint8Array): void {
    this.putRaw(`unhex('${arrayToHexString(value)}')`);
  }

  selectScopeIdentity(): void {
    this.put('^select ^last_insert_id()');
  }

  callableTemplate(func: any): void {
    const parameters = (func.parameters || []).filter((x: any) => x.parameterMode != 'RETURN');

    const putParameters = (parameters: any[], delimiter: string) => {
      this.putCollection(delimiter, parameters || [], (param: any) => {
        if (param.parameterMode == 'IN') {
          this.putRaw('@' + param.parameterName);
        } else {
          this.putRaw('@' + param.parameterName + 'Output');
        }
      });
    };

    const putSetParamters = (parameters: any[]) => {
      for (const param of parameters || []) {
        if (param.parameterMode == 'IN') {
          this.put('SET @%s = :%s', param.parameterName, param.parameterName);
          this.endCommand();
        }
      }
      this.put('&n');
    };

    if (func.objectTypeField == 'procedures') {
      putSetParamters(func.parameters);
      this.put('^call %f(&>&n', func);
      putParameters(parameters, ',&n');
      this.put('&<&n)');
      this.endCommand();
    }

    if (func.objectTypeField == 'functions') {
      putSetParamters(parameters);
      this.put('^select %f(&>&n', func);
      putParameters(parameters, ',&n');
      this.put('&<&n)');
      this.endCommand();
    }
  }

  putValue(value: any, dataType?: string): void {
    const dataLower = dataType?.toLowerCase();
    if (dataLower?.includes('date')) {
      if (typeof value == 'string') {
        this.putRaw("'");
        this.putRaw(this.escapeString(value.replace(/(?:Z|[+-]\d{2}:?\d{2})$/, '')));
        this.putRaw("'");
        return;
      }
    }
    super.putValue(value, dataType);
  }
}
