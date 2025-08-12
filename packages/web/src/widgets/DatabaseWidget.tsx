import { Component } from 'solid-js';
import { useConnectionList } from '../utility/metadataLoaders';
import { For } from 'solid-js';

const DatabaseWidget: Component = () => {
    const databaseList = useConnectionList();

    return (
        <div>
            <h2 class='theme-pen-0'>Database Widget</h2>
            <For each={databaseList()}>{item => <div>{item.displayName}</div>}</For>
            {/* Add your widget content here */}
        </div>
    );
};

export default DatabaseWidget;