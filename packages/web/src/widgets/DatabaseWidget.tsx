import { Component } from 'solid-js';
import { useConnectionList } from '../utility/metadataLoaders';

const DatabaseWidget: Component = () => {
    const databaseList = useConnectionList();

    return (
        <div>
            <h2 class='theme-pen-0'>Database Widget</h2>
            {JSON.stringify(databaseList())}
            {/* Add your widget content here */}
        </div>
    );
};

export default DatabaseWidget;