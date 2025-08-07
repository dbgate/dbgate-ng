import _get from "lodash/get";
import type { Expression } from "./types";

export function evaluateExpression(expr: Expression, values) {
  switch (expr.exprType) {
    case "column":
      return _get(values, expr.columnName);

    case "placeholder":
      return values.__placeholder;

    case "value":
      return expr.value;

    case "raw":
      return expr.sql;

    case "call":
      return null;

    case "methodCall":
      return null;

    case "transform":
      return null;
  }
}
