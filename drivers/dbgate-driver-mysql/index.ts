import drivers from './drivers.js';

export default {
  packageName: 'dbgate-plugin-mysql',
  drivers,
  initialize(dbgateEnv: any) {
    (drivers as any).initialize(dbgateEnv);
  },
};
