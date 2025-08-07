export const strmid = crypto.randomUUID();

export async function apiCall(
  route: string,
  args: {} = undefined,
  options: { skipDisableChecks: boolean } = undefined
) {}

const apiHandlers = new WeakMap();

export function apiOn(event: string, handler: Function) {}

export function apiOff(event: string, handler: Function) {}

export function transformApiArgs(args) {
  return args;
}

export function transformApiArgsInv(args) {
  return args;
}
