import { Component } from 'solid-js';
import { useConnectionList } from '../utility/metadataLoaders';
import { For } from 'solid-js';
import ConnectionAppObject from '../appobj/ConnectionAppObject';
import { WidgetColumnBar } from './WidgetColumnBar';
import AppObjectTree from '../appobj/AppObjectTree';
import { ConnectionsObjectTree } from '../appobj/ConnectionsObjectTree';

const DatabaseWidget: Component = () => {
  const databaseList = useConnectionList();

  return (
    <WidgetColumnBar>
      {[
        {
          title: 'Connections',
          name: 'connections',
          initialHeight: '40%',
          // renderBody: () => <For each={databaseList()}>{item => <ConnectionAppObject data={item} />}</For>,
          renderBody: () => <AppObjectTree model={new ConnectionsObjectTree()} />,
        },
        {
          title: 'Tables, views, functions',
          name: 'dbObjects',
          renderBody: () => <div>XXX</div>,
        },
      ]}
    </WidgetColumnBar>
  );
};

export default DatabaseWidget;
