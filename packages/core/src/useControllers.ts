import { connectionsController } from "./controllers/connections";

function useController(app: any, electron: any, path: any, controller: any) {
    app.use(path, controller);
    electron?.webContents.on('did-finish-load', () => {
        electron.webContents.send('controller-loaded', path);
    });
}

export function useAllControllers(app: any, electron: any) {
    useController(app, electron, '/connections', connectionsController);
    // useController(app, electron, '/server-connections', serverConnections);
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