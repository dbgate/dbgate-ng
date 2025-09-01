import { ApiCallFunction } from 'dbgate-types';

export const strmid = crypto.randomUUID();
let eventSource;
let apiLogging = true;

let apiUrl = null;
try {
  apiUrl = process.env.API_URL;
} catch {}

export function resolveApi() {
  return 'http://localhost:3001';
  // if (apiUrl) {
  //   return apiUrl;
  // }
  // return (window.location.origin + window.location.pathname).replace(/\/[a-zA-Z-]+\.html$/, '').replace(/\/*$/, '');
}

// @ts-ignore
export const apiCall: ApiCallFunction = async (controller, method, args) => {
  const resp = await fetch(`${resolveApi()}/${controller}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  return await resp.json();
};

const apiHandlers = new WeakMap();

function wantEventSource() {
  if (!eventSource) {
    eventSource = new EventSource(`${resolveApi()}/stream?strmid=${strmid}`);
    // eventSource.addEventListener('clean-cache', e => cacheClean(JSON.parse(e.data)));
  }
}

export function apiOn(event: string, handler: Function) {
  wantEventSource();
  if (!apiHandlers.has(handler)) {
    const handlerProxy = e => {
      const json = JSON.parse(e.data);
      if (apiLogging) {
        console.log('@@@ API EVENT', event, json);
      }

      handler(json);
    };
    apiHandlers.set(handler, handlerProxy);
  }

  eventSource.addEventListener(event, apiHandlers.get(handler));
}

export function apiOff(event: string, handler: Function) {}

export function transformApiArgs(args) {
  return args;
}

export function transformApiArgsInv(args) {
  return args;
}
