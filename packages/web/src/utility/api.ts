export const strmid = crypto.randomUUID();

export async function apiCall(
  _route: string,
  _args: {} = undefined,
  _options: { skipDisableChecks: boolean } = undefined
) {}

const _apiHandlers = new WeakMap();

export function apiOn(_event: string, _handler: Function) {}

export function apiOff(_event: string, _handler: Function) {}

export function transformApiArgs(args) {
  return args;
}

export function transformApiArgsInv(args) {
  return args;
}
