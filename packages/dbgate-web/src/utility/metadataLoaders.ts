import _ from 'lodash';
import { loadCachedValue, subscribeCacheChange, unsubscribeCacheChange } from './cache';
import stableStringify from 'json-stable-stringify';
import { extendDatabaseInfo } from 'dbgate-tools';
import { setLocalStorage } from '../utility/storageCache';
import { apiCall } from './api';
import { createEffect, createResource, onCleanup, Resource, ResourceReturn } from 'solid-js';
import { ConfigResponse, DatabaseInfo, StoredConnection } from 'dbgate-types';

const databaseInfoLoader = ({ conid, database, modelTransFile }) => ({
  controller: 'databaseConnections',
  action: 'structure',
  params: { conid, database, modelTransFile },
  reloadTrigger: { key: `database-structure-changed`, conid, database },
  transform: extendDatabaseInfo,
});

const schemaListLoader = ({ conid, database }) => ({
  controller: 'databaseConnections',
  action: 'schemaList',
  params: { conid, database },
  reloadTrigger: { key: `schema-list-changed`, conid, database },
});

// const tableInfoLoader = ({ conid, database, schemaName, pureName }) => ({
//   url: 'metadata/table-info',
//   params: { conid, database, schemaName, pureName },
//   reloadTrigger: `database-structure-changed-${conid}-${database}`,
// });

// const sqlObjectInfoLoader = ({ objectTypeField, conid, database, schemaName, pureName }) => ({
//   url: 'metadata/sql-object-info',
//   params: { objectTypeField, conid, database, schemaName, pureName },
//   reloadTrigger: `database-structure-changed-${conid}-${database}`,
// });

const connectionInfoLoader = ({ conid }) => ({
  controller: 'connections',
  action: 'get',
  params: { conid },
  reloadTrigger: { key: 'connection-list-changed' },
});

const configLoader = () => ({
  controller: 'config',
  action: 'get',
  params: {},
  reloadTrigger: { key: 'config-changed' },
});

const settingsLoader = () => ({
  controller: 'config',
  action: 'get-settings',
  params: {},
  reloadTrigger: { key: 'settings-changed' },
});

const platformInfoLoader = () => ({
  controller: 'config',
  action: 'platform-info',
  params: {},
  reloadTrigger: { key: 'platform-info-changed' },
});

const favoritesLoader = () => ({
  controller: 'files',
  action: 'favorites',
  params: {},
  reloadTrigger: { key: 'files-changed-favorites' },
});

// const sqlObjectListLoader = ({ conid, database }) => ({
//   url: 'metadata/list-objects',
//   params: { conid, database },
//   reloadTrigger: `database-structure-changed-${conid}-${database}`,
// });

const databaseStatusLoader = ({ conid, database }) => ({
  controller: 'databaseConnections',
  action: 'status',
  params: { conid, database },
  reloadTrigger: { key: `database-status-changed`, conid, database },
});

const databaseListLoader = ({ conid }) => ({
  controller: 'serverConnections',
  action: 'list-databases',
  params: { conid },
  reloadTrigger: { key: `database-list-changed`, conid },
  onLoaded: value => {
    if (value?.length > 0) setLocalStorage(`database_list_${conid}`, value);
  },
  errorValue: [],
});

const serverVersionLoader = ({ conid }) => ({
  controller: 'serverConnections',
  action: 'version',
  params: { conid },
  reloadTrigger: { key: `server-version-changed`, conid },
});

const databaseServerVersionLoader = ({ conid, database }) => ({
  controller: 'databaseConnections',
  action: 'server-version',
  params: { conid, database },
  reloadTrigger: { key: `database-server-version-changed`, conid, database },
});

const archiveFoldersLoader = () => ({
  controller: 'archive',
  action: 'folders',
  params: {},
  reloadTrigger: { key: `archive-folders-changed` },
});

const archiveFilesLoader = ({ folder }) => ({
  controller: 'archive',
  action: 'files',
  params: { folder },
  reloadTrigger: { key: `archive-files-changed`, folder },
});

const appFoldersLoader = () => ({
  controller: 'apps',
  action: 'folders',
  params: {},
  reloadTrigger: { key: `app-folders-changed` },
});

const appFilesLoader = ({ folder }) => ({
  controller: 'apps',
  action: 'files',
  params: { folder },
  reloadTrigger: { key: `app-files-changed`, app: folder },
});

// const dbAppsLoader = ({ conid, database }) => ({
//   url: 'apps/get-apps-for-db',
//   params: { conid, database },
//   reloadTrigger: `db-apps-changed-${conid}-${database}`,
// });

const usedAppsLoader = ({ conid, database }) => ({
  controller: 'apps',
  action: 'get-used-apps',
  params: {},
  reloadTrigger: { key: `used-apps-changed` },
});

const serverStatusLoader = () => ({
  controller: 'serverConnections',
  action: 'server-status',
  params: {},
  reloadTrigger: { key: `server-status-changed` },
});

const connectionListLoader = () => ({
  controller: 'connections',
  action: 'list',
  params: {},
  reloadTrigger: { key: `connection-list-changed` },
});

const installedPluginsLoader = () => ({
  controller: 'plugins',
  action: 'installed',
  params: {},
  reloadTrigger: { key: `installed-plugins-changed` },
});

const filesLoader = ({ folder }) => ({
  controller: 'files',
  action: 'list',
  params: { folder },
  reloadTrigger: { key: `files-changed`, folder },
});
const allFilesLoader = () => ({
  controller: 'files',
  action: 'list-all',
  params: {},
  reloadTrigger: { key: `all-files-changed` },
});
const authTypesLoader = ({ engine }) => ({
  controller: 'plugins',
  action: 'auth-types',
  params: { engine },
  reloadTrigger: { key: `installed-plugins-changed` },
  errorValue: null,
});

const publicCloudFilesLoader = () => ({
  controller: 'cloud',
  action: 'public-files',
  params: {},
  reloadTrigger: { key: `public-cloud-changed` },
});
const cloudContentListLoader = () => ({
  controller: 'cloud',
  action: 'content-list',
  params: {},
  reloadTrigger: { key: `cloud-content-changed` },
});

async function getCore(loader, args) {
  const { controller, action, params, reloadTrigger, transform, onLoaded, errorValue } = loader(args);
  const key = stableStringify({ controller, action, ...params });

  async function doLoad() {
    const resp = await apiCall(controller, action, params);
    if (resp?.errorMessage && errorValue !== undefined) {
      if (onLoaded) onLoaded(errorValue);
      return errorValue;
    }
    const res = (transform || (x => x))(resp);
    if (onLoaded) onLoaded(res);
    return res;
  }

  const res = await loadCachedValue(reloadTrigger, key, doLoad);
  return res;
}

export function useCore<T>(loader, args): Resource<T> {
  const { controller, action, params, reloadTrigger, transform, onLoaded } = loader(args);
  const cacheKey = stableStringify({ controller, action, ...params });

  // Any value that changes here will refetch
  const source = () => [cacheKey, reloadTrigger?.version?.() ?? reloadTrigger ?? 0];

  const [resource, { refetch, mutate }] = createResource(
    source,
    async () => {
      const res = await getCore(loader, args);
      const out = transform ? transform(res) : res;
      onLoaded?.(out);
      return out;
    }
  );

  // Hook your external cache bus
  createEffect(() => {
    if (!reloadTrigger) return;
    const handler = () => refetch();
    subscribeCacheChange(reloadTrigger, cacheKey, handler);
    onCleanup(() => unsubscribeCacheChange(reloadTrigger, cacheKey, handler));
  });

  return resource;
}

/** @returns {Promise<import('dbgate-types').DatabaseInfo>} */
export function getDatabaseInfo(args) {
  return getCore(databaseInfoLoader, args);
}

/** @returns {import('dbgate-types').DatabaseInfo} */
export function useDatabaseInfo(args) {
  return useCore<DatabaseInfo>(databaseInfoLoader, args);
}

export async function getDbCore(args, objectTypeField = undefined) {
  const db = await getDatabaseInfo(args);
  if (!db) return null;
  return db[objectTypeField || args.objectTypeField].find(
    x => x.pureName == args.pureName && x.schemaName == args.schemaName
  );
}

export function useDbCore(args, objectTypeField = undefined) {
  return null
  // const dbStore = useDatabaseInfo(args);
  // if (!dbStore) return null;
  // if (_.isArray(objectTypeField)) {
  //   for (const field of objectTypeField) {
  //     const res = dbStore[field || args.objectTypeField].find(
  //       x => x.pureName == args.pureName && x.schemaName == args.schemaName
  //     );
  //     if (res) return res;
  //   }
  // } else {
  //   return db[objectTypeField || args.objectTypeField].find(
  //     x => x.pureName == args.pureName && x.schemaName == args.schemaName
  //   );
  // }

}

/** @returns {Promise<import('dbgate-types').TableInfo>} */
export function getTableInfo(args) {
  return getDbCore(args, 'tables');
}

/** @returns {import('dbgate-types').TableInfo} */
export function useTableInfo(args) {
  return useDbCore(args, 'tables');
}

/** @returns {Promise<import('dbgate-types').ViewInfo>} */
export function getViewInfo(args) {
  return getDbCore(args, 'views');
}

/** @returns {import('dbgate-types').ViewInfo} */
export function useViewInfo(args) {
  return useDbCore(args, ['views', 'matviews']);
}

/** @returns {import('dbgate-types').CollectionInfo} */
export function useCollectionInfo(args) {
  return useDbCore(args, 'collections');
}

export function getSqlObjectInfo(args) {
  return getDbCore(args);
}

export function useSqlObjectInfo(args) {
  return useDbCore(args);
}

export function getConnectionInfo(args): Promise<StoredConnection> {
  return getCore(connectionInfoLoader, args);
}

export function useConnectionInfo(args): Resource<StoredConnection> {
  return useCore(connectionInfoLoader, args);
}

// export function getSqlObjectList(args) {
//   return getCore(sqlObjectListLoader, args);
// }
// export function useSqlObjectList(args) {
//   return useCore(sqlObjectListLoader, args);
// }

export function getDatabaseStatus(args) {
  return getCore(databaseStatusLoader, args);
}
export function useDatabaseStatus(args) {
  return useCore(databaseStatusLoader, args);
}

export function getDatabaseList(args) {
  return getCore(databaseListLoader, args);
}
export function useDatabaseList(args) {
  return useCore(databaseListLoader, args);
}

export function getServerVersion(args) {
  return getCore(serverVersionLoader, args);
}
export function useServerVersion(args) {
  return useCore(serverVersionLoader, args);
}

export function getDatabaseServerVersion(args) {
  return getCore(databaseServerVersionLoader, args);
}
export function useDatabaseServerVersion(args) {
  return useCore(databaseServerVersionLoader, args);
}

export function getServerStatus() {
  return getCore(serverStatusLoader, {});
}
export function useServerStatus() {
  return useCore(serverStatusLoader, {});
}

export function getConnectionList(): Promise<StoredConnection[]> {
  return getCore(connectionListLoader, {});
}
export function useConnectionList(): Resource<StoredConnection[]> {
  return useCore(connectionListLoader, {});
}

export function getConfig(): Promise<ConfigResponse> {
  return getCore(configLoader, {});
}
export function useConfig(): Resource<ConfigResponse> {
  return useCore(configLoader, {});
}

export function getSettings(): Promise<Record<string, any>> {
  return getCore(settingsLoader, {});
}
export function useSettings(): Resource<Record<string, any>> {
  return useCore(settingsLoader, {});
}

export function getPlatformInfo() {
  return getCore(platformInfoLoader, {});
}
export function usePlatformInfo() {
  return useCore(platformInfoLoader, {});
}

export function getArchiveFiles(args) {
  return getCore(archiveFilesLoader, args);
}
export function useArchiveFiles(args) {
  return useCore(archiveFilesLoader, args);
}

export function getArchiveFolders(args = {}) {
  return getCore(archiveFoldersLoader, args);
}
export function useArchiveFolders(args = {}) {
  return useCore(archiveFoldersLoader, args);
}

export function getAppFiles(args) {
  return getCore(appFilesLoader, args);
}
export function useAppFiles(args) {
  return useCore(appFilesLoader, args);
}

export function getAppFolders(args = {}) {
  return getCore(appFoldersLoader, args);
}
export function useAppFolders(args = {}) {
  return useCore(appFoldersLoader, args);
}

export function getUsedApps(args = {}) {
  return getCore(usedAppsLoader, args);
}
export function useUsedApps(args = {}) {
  return useCore(usedAppsLoader, args);
}

// export function getDbApps(args = {}) {
//   return getCore(dbAppsLoader, args);
// }
// export function useDbApps(args = {}) {
//   return useCore(dbAppsLoader, args);
// }

export function getInstalledPlugins(args = {}) {
  return getCore(installedPluginsLoader, args) || [];
}
export function useInstalledPlugins(args = {}) {
  return useCore(installedPluginsLoader, args);
}

export function getFiles(args) {
  return getCore(filesLoader, args);
}
export function useFiles(args) {
  return useCore(filesLoader, args);
}

export function getAllFiles(args) {
  return getCore(allFilesLoader, args);
}
export function useAllFiles(args) {
  return useCore(allFilesLoader, args);
}

export function getFavorites(args) {
  return getCore(favoritesLoader, args);
}
export function useFavorites(args = {}) {
  return useCore(favoritesLoader, args);
}

export function getAuthTypes(args) {
  return getCore(authTypesLoader, args);
}
export function useAuthTypes(args) {
  return useCore(authTypesLoader, args);
}

// export function getDatabaseKeys(args) {
//   return getCore(databaseKeysLoader, args);
// }
// export function useDatabaseKeys(args) {
//   return useCore(databaseKeysLoader, args);
// }
export function getSchemaList(args) {
  return getCore(schemaListLoader, args);
}
export function useSchemaList(args) {
  return useCore(schemaListLoader, args);
}

export function getPublicCloudFiles(args) {
  return getCore(publicCloudFilesLoader, args);
}
export function usePublicCloudFiles(args = {}) {
  return useCore(publicCloudFilesLoader, args);
}

export function getCloudContentList(args) {
  return getCore(cloudContentListLoader, args);
}
export function useCloudContentList(args = {}) {
  return useCore(cloudContentListLoader, args);
}
