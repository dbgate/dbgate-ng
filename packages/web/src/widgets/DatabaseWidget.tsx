import { Component } from 'solid-js';
import { useConnectionList } from '../utility/metadataLoaders';
import { For } from 'solid-js';
import ConnectionAppObject from '../appobj/ConnectionAppObject';
import { WidgetColumnBar } from './WidgetColumnBar';

const DatabaseWidget: Component = () => {
  const databaseList = useConnectionList();

  return (
    <WidgetColumnBar>
      {[
        {
          title: 'Connections',
          name: 'connections',
          initialHeight: '40%',
          renderBody: () => <For each={databaseList()}>{item => <ConnectionAppObject data={item} />}</For>,
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
