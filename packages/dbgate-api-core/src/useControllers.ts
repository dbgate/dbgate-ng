import { getConnectionsController } from './controllers/connections';
import express from 'express';
import _ from 'lodash';
import { extractErrorLogData } from 'dbgate-tools';
import { getExpressPath, getLogger } from 'dbgate-core';
import { MissingCredentialsError } from 'dbgate-core';
import { getServerConnectionsController } from './controllers/serverConnections';

const logger = getLogger('useController');

function listInstanceMethods(obj: any, { includeSymbols = false } = {}): string[] {
  const keys = new Set();
  let cur = obj;

  while (cur && cur !== Object.prototype) {
    const props = includeSymbols ? Reflect.ownKeys(cur) : Object.getOwnPropertyNames(cur);
    for (const k of props) {
      if (k === 'constructor') continue;
      const d = Object.getOwnPropertyDescriptor(cur, k);
      if (d && typeof d.value === 'function') keys.add(k); // normal methods
      // (optional) include getter-returned functions:
      // if (d && d.get && typeof d.get.call(obj) === 'function') keys.add(k);
    }
    cur = Object.getPrototypeOf(cur);
  }
  return [...keys] as string[];
}

function useController(app: any, electron: any, route: any, controller: any) {
  if (controller._init) {
    logger.info(`DBGM-00096 Calling init controller for controller ${route}`);
    try {
      controller._init();
    } catch (err) {
      logger.error(extractErrorLogData(err), `DBGM-00097 Error initializing controller, exiting application`);
      process.exit(1);
    }
  }

  for (const methodName of listInstanceMethods(controller)) {
    const obj = controller[methodName];
    if (!_.isFunction(obj)) continue;
    const meta = controller[`${methodName}_meta`];
    if (!meta) continue;

    if (electron) {
      if (meta === true) {
        const handler = `${route.substring(1)}-${_.kebabCase(methodName)}`;
        // console.log('REGISTERING HANDLER', handler);
        // @ts-ignore
        electron.ipcMain.handle(handler, async (event, args) => {
          try {
            const data = await controller[methodName](args);
            // console.log('HANDLED API', handler, data);
            if (data === undefined) return null;
            return data;
          } catch (err) {
            if (err instanceof MissingCredentialsError) {
              return {
                missingCredentials: true,
                apiErrorMessage: 'Missing credentials',
                // @ts-ignore
                detail: err.detail,
              };
            }
            // @ts-ignore
            return { apiErrorMessage: err.message };
          }
        });
      }

      continue;
    }

    let method = 'post';
    let raw = false;

    // if (_.isString(meta)) {
    //   method = meta;
    // }
    if (_.isPlainObject(meta)) {
      method = meta.method;
      raw = meta.raw;
    }

    const fullRoute = `${getExpressPath(route)}/${methodName}`

    console.log(`Registering route: ${fullRoute}`)

    if (raw) {
      // @ts-ignore
      app[method](fullRoute, (req, res) => controller[methodName](req, res));
    } else {
      // @ts-ignore
      app[method](fullRoute, async (req, res) => {
        // if (controller._init && !controller._init_called) {
        //   await controller._init();
        //   controller._init_called = true;
        // }
        try {
          const data = await controller[methodName]({ ...req.body, ...req.query }, req);
          res.json(data);
        } catch (err) {
          logger.error(extractErrorLogData(err), `DBGM-00176 Error when processing route ${fullRoute}`);
          if (err instanceof MissingCredentialsError) {
            res.json({
              missingCredentials: true,
              apiErrorMessage: 'Missing credentials',
              // @ts-ignore
              detail: err.detail,
            });
          } else {
            // @ts-ignore
            res.status(500).json({ apiErrorMessage: (_.isString(err) ? err : err.message) ?? 'Unknown error' });
          }
        }
      });
    }
  }
}

export function useAllControllers(app: any, electron: any) {
  useController(app, electron, '/connections', getConnectionsController());
  useController(app, electron, '/serverConnections', getServerConnectionsController());
  // useController(app, electron, '/database-connections', databaseConnections);
  // useController(app, electron, '/metadata', metadata);
  // useController(app, electron, '/sessions', sessions);
  // useController(app, electron, '/runners', runners);
  // useController(app, electron, '/jsldata', jsldata);
  // useController(app, electron, '/config', config);
  // useController(app, electron, '/storage', storage);
  // useController(app, electron, '/archive', archive);
  // useController(app, electron, '/uploads', uploads);
  // useController(app, electron, '/plugins', plugins);
  // useController(app, electron, '/files', files);
  // useController(app, electron, '/scheduler', scheduler);
  // useController(app, electron, '/query-history', queryHistory);
  // useController(app, electron, '/apps', apps);
  // useController(app, electron, '/auth', auth);
  // useController(app, electron, '/cloud', cloud);
}
