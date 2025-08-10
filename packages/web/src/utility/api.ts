import { ApiCallFunction } from "dbgate-types";

export const strmid = crypto.randomUUID();

// @ts-ignore
export const apiCall: ApiCallFunction =async (controller, method, args) => {
  const resp = await fetch(`/api/${controller}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  return await resp.json();
}

const apiHandlers = new WeakMap();

export function apiOn(event: string, handler: Function) { }

export function apiOff(event: string, handler: Function) { }

export function transformApiArgs(args) {
  return args;
}

export function transformApiArgsInv(args) {
  return args;
}
