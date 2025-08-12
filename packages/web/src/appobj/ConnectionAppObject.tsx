import { Component, createSignal, createEffect, JSX } from 'solid-js';
import _ from 'lodash';
import AppObjectCore from './AppObjectCore';

// Placeholder imports - these would need to be implemented or imported from the actual modules
const DEFAULT_CONNECTION_SEARCH_SETTINGS = {
  displayName: true,
  server: true,
  user: true,
  engine: true,
  database: true
};

// Utility functions that would need to be implemented
const filterNameCompoud = (filter: any, names: (string | null)[], databases: string[]) => {
  // Placeholder implementation
  return true;
};

const getLocalStorage = (key: string) => {
  if (typeof localStorage !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || 'null');
  }
  return null;
};

const apiCall = (endpoint: string, params?: any) => {
  // Placeholder API call implementation
  console.log('API Call:', endpoint, params);
  return Promise.resolve();
};

const getConnectionLabel = (data: any, options?: { showUnsaved?: boolean }) => {
  return data.displayName || data.server || 'Connection';
};

const showModal = (component: any, props: any) => {
  // Placeholder modal implementation
  console.log('Show modal:', component, props);
};

const openNewTab = (tabConfig: any) => {
  // Placeholder tab opening implementation
  console.log('Open new tab:', tabConfig);
};

const hasPermission = (permission: string) => {
  // Placeholder permission check
  return true;
};

const isProApp = () => {
  // Placeholder pro app check
  return false;
};

const _t = (key: string, options?: { defaultMessage: string; values?: any }) => {
  return options?.defaultMessage || key;
};

// Module-level functions (equivalent to Svelte's context="module")
export const extractKey = (data: any) => data._id;

export const createMatcher = (filter: any, cfg = DEFAULT_CONNECTION_SEARCH_SETTINGS) => (props: any) => {
  const { _id, displayName, server, user, engine } = props;
  const databases = getLocalStorage(`database_list_${_id}`) || [];
  const match = (engine || '').match(/^([^@]*)@/);
  const engineDisplay = match ? match[1] : engine;

  return filterNameCompoud(
    filter,
    [
      cfg.displayName ? displayName : null,
      cfg.server ? server : null,
      cfg.user ? user : null,
      cfg.engine ? engineDisplay : null,
    ],
    cfg.database ? databases.map((x: any) => x.name) : []
  );
};

export function openConnection(connection: any, disableExpand = false) {
  // Placeholder implementation - would need actual store management
  console.log('Opening connection:', connection._id, { disableExpand });
  
  if (connection.singleDatabase) {
    // Handle single database connection
    apiCall('database-connections/refresh', {
      conid: connection._id,
      database: connection.defaultDatabase,
      keepOpen: true,
    });
  } else {
    // Handle server connection
    apiCall('server-connections/refresh', {
      conid: connection._id,
      keepOpen: true,
    });
  }
}

export function disconnectServerConnection(conid: string, showConfirmation = true) {
  // Placeholder implementation
  console.log('Disconnecting server connection:', conid, { showConfirmation });
  
  if (showConfirmation) {
    showModal('ConfirmModal', {
      message: _t('connection.closeConfirm', {
        defaultMessage: 'Closing connection will close opened tabs, continue?',
      }),
      onConfirm: () => disconnectServerConnection(conid, false),
    });
    return;
  }

  apiCall('server-connections/disconnect', { conid });
}

export interface ConnectionAppObjectProps {
  data: any;
  passProps?: any;
  [key: string]: any; // For spread props
}

const ConnectionAppObject: Component<ConnectionAppObjectProps> = (props) => {
  const [statusIcon, setStatusIcon] = createSignal<string | null>(null);
  const [statusTitle, setStatusTitle] = createSignal<string | null>(null);
  const [extInfo, setExtInfo] = createSignal<string | null>(null);
  const [engineStatusIcon, setEngineStatusIcon] = createSignal<string | null>(null);
  const [engineStatusTitle, setEngineStatusTitle] = createSignal<string | null>(null);

  // Placeholder stores - these would need to be actual SolidJS stores
  const [extensions] = createSignal({ drivers: [] });
  const [openedConnections] = createSignal<string[]>([]);
  const [openedSingleDatabaseConnections] = createSignal<string[]>([]);
  const [currentDatabase] = createSignal<any>(null);
  const [focusedConnectionOrDatabase] = createSignal<any>(null);
  const [cloudSigninTokenHolder] = createSignal<any>(null);
  const [apps] = createSignal<any[]>([]);

  const handleConnect = (disableExpand = false) => {
    openConnection(props.data, disableExpand);
  };

  const handleOpenConnectionTab = () => {
    openNewTab({
      title: getConnectionLabel(props.data),
      icon: props.data._id.startsWith('cloud://') ? 'img cloud-connection' : 'img connection',
      tabComponent: 'ConnectionTab',
      props: {
        conid: props.data._id,
      },
    });
  };

  const handleDoubleClick = async () => {
    if (openedSingleDatabaseConnections().includes(props.data._id)) {
      // switchCurrentDatabase({ connection: props.data, name: props.data.defaultDatabase });
      return;
    }
    if (openedConnections().includes(props.data._id)) {
      return;
    }
    handleConnect(true);
  };

  const handleClick = async () => {
    // Placeholder for connection click handling
    console.log('Connection clicked:', props.data._id);
  };

  const handleMouseDown = () => {
    // focusedConnectionOrDatabase.set({
    //   conid: props.data?._id,
    //   connection: props.data,
    //   database: props.data.singleDatabase ? props.data.defaultDatabase : null,
    // });
  };

  const handleRestoreDatabase = () => {
    openNewTab({
      title: 'Restore #',
      icon: 'img db-restore',
      tabComponent: 'RestoreDatabaseTab',
      props: {
        conid: props.data._id,
      },
    });
  };

  const getContextMenu = () => {
    const driver = extensions().drivers.find((x: any) => x.engine === props.data.engine);
    
    const handleRefresh = () => {
      apiCall('server-connections/refresh', { conid: props.data._id });
    };
    
    const handleDisconnect = () => {
      disconnectServerConnection(props.data._id);
    };
    
    const handleDelete = () => {
      showModal('ConfirmModal', {
        message: _t('connection.deleteConfirm', {
          defaultMessage: 'Really delete connection {name}?',
          values: { name: getConnectionLabel(props.data) },
        }),
        onConfirm: () => apiCall('connections/delete', props.data),
      });
    };
    
    const handleDuplicate = () => {
      if (props.data._id.startsWith('cloud://')) {
        apiCall('cloud/duplicate-connection', { conid: props.data._id });
      } else {
        apiCall('connections/save', {
          ...props.data,
          _id: undefined,
          displayName: `${getConnectionLabel(props.data)} - copy`,
        });
      }
    };
    
    const handleCreateDatabase = () => {
      showModal('InputTextModal', {
        header: _t('connection.createDatabase', { defaultMessage: 'Create database' }),
        value: 'newdb',
        label: _t('connection.databaseName', { defaultMessage: 'Database name' }),
        onConfirm: (name: string) =>
          apiCall('server-connections/create-database', {
            conid: props.data._id,
            name,
          }),
      });
    };
    
    const handleServerSummary = () => {
      openNewTab({
        title: getConnectionLabel(props.data),
        icon: 'img server',
        tabComponent: 'ServerSummaryTab',
        props: {
          conid: props.data._id,
        },
      });
    };
    
    const handleNewQuery = () => {
      const tooltip = `${getConnectionLabel(props.data)}`;
      openNewTab({
        title: 'Query #',
        icon: 'img sql-file',
        tooltip,
        tabComponent: 'QueryTab',
        focused: true,
        props: {
          conid: props.data._id,
        },
      });
    };

    return [
      !props.data.singleDatabase && [
        !openedConnections().includes(props.data._id) && {
          text: _t('connection.connect', { defaultMessage: 'Connect' }),
          onClick: handleConnect,
          isBold: true,
        },
        openedConnections().includes(props.data._id) && {
          text: _t('connection.disconnect', { defaultMessage: 'Disconnect' }),
          onClick: handleDisconnect,
        },
      ],
      { divider: true },
      {
        text: openedConnections().includes(props.data._id)
          ? _t('connection.viewDetails', { defaultMessage: 'View details' })
          : _t('connection.edit', { defaultMessage: 'Edit' }),
        onClick: handleOpenConnectionTab,
      },
      !openedConnections().includes(props.data._id) && {
        text: _t('connection.delete', { defaultMessage: 'Delete' }),
        onClick: handleDelete,
      },
      {
        text: _t('connection.duplicate', { defaultMessage: 'Duplicate' }),
        onClick: handleDuplicate,
      },
      { divider: true },
      !props.data.singleDatabase && [
        hasPermission(`dbops/query`) && {
          onClick: handleNewQuery,
          text: _t('connection.newQuery', { defaultMessage: 'New Query (server)' }),
          isNewQuery: true,
        },
        openedConnections().includes(props.data._id) &&
          props.data.status && {
            text: _t('connection.refresh', { defaultMessage: 'Refresh' }),
            onClick: handleRefresh,
          },
        hasPermission(`dbops/createdb`) &&
          openedConnections().includes(props.data._id) &&
          driver?.supportedCreateDatabase &&
          !props.data.isReadOnly && {
            text: _t('connection.createDatabase', { defaultMessage: 'Create database' }),
            onClick: handleCreateDatabase,
          },
        driver?.supportsServerSummary && {
          text: _t('connection.serverSummary', { defaultMessage: 'Server summary' }),
          onClick: handleServerSummary,
        },
      ],
      driver?.supportsDatabaseRestore &&
        isProApp() &&
        hasPermission(`dbops/sql-dump/import`) &&
        !props.data.isReadOnly && { 
          onClick: handleRestoreDatabase, 
          text: 'Restore database backup' 
        },
    ];
  };

  // Effect for engine status
  createEffect(() => {
    if (extensions().drivers.find((x: any) => x.engine === props.data.engine)) {
      const match = (props.data.engine || '').match(/^([^@]*)@/);
      setExtInfo(match ? match[1] : props.data.engine);
      setEngineStatusIcon(null);
      setEngineStatusTitle(null);
    } else {
      setExtInfo(props.data.engine);
      setEngineStatusIcon('img warn');
      setEngineStatusTitle(_t('connection.engineDriverNotFound', {
        defaultMessage:
          'Engine driver {engine} not found, review installed plugins and change engine in edit connection dialog',
        values: { engine: props.data.engine },
      }));
    }
  });

  // Effect for connection status
  createEffect(() => {
    const { _id, status } = props.data;
    if (openedConnections().includes(_id)) {
      if (!status) setStatusIcon('icon loading');
      else if (status.name === 'pending') setStatusIcon('icon loading');
      else if (status.name === 'ok') setStatusIcon('img ok');
      else setStatusIcon('img error');
      if (status && status.name === 'error') {
        setStatusTitle(status.message);
      }
    } else {
      setStatusIcon(null);
      setStatusTitle(null);
    }
  });

  const handleMiddleClick = () => {
    const contextMenu = _.flattenDeep(getContextMenu());
    const newQueryItem = contextMenu.find((x: any) => x.isNewQuery);
    if (newQueryItem) {
      newQueryItem.onClick();
    }
  };

  return (
    <AppObjectCore
      {...props}
      data={props.data}
      title={getConnectionLabel(props.data, { showUnsaved: true })}
      icon={props.data._id.startsWith('cloud://') 
        ? 'img cloud-connection' 
        : props.data.singleDatabase 
          ? 'img database' 
          : 'img server'
      }
      isBold={props.data.singleDatabase
        ? currentDatabase()?.connection?._id === props.data._id && 
          currentDatabase()?.name === props.data.defaultDatabase
        : currentDatabase()?.connection?._id === props.data._id
      }
      statusIcon={statusIcon() || engineStatusIcon()}
      statusTitle={statusTitle() || engineStatusTitle()}
      statusTitleToCopy={statusTitle() || engineStatusTitle()}
      statusIconBefore={props.data.isReadOnly ? 'icon lock' : undefined}
      extInfo={extInfo()}
      colorMark={props.passProps?.connectionColorFactory && 
        props.passProps?.connectionColorFactory({ conid: props.data._id })
      }
      menu={getContextMenu}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDblClick={handleDoubleClick}
      onMiddleClick={handleMiddleClick}
      isChoosed={props.data._id === focusedConnectionOrDatabase()?.conid &&
        (props.data.singleDatabase
          ? focusedConnectionOrDatabase()?.database === props.data.defaultDatabase
          : !focusedConnectionOrDatabase()?.database)
      }
      disableBoldScroll={!!focusedConnectionOrDatabase()}
    />
  );
};

export default ConnectionAppObject;
