import { Component } from 'solid-js';
import { useConnectionList } from '../utility/metadataLoaders';
import { For } from 'solid-js';
import ConnectionAppObject from '../appobj/ConnectionAppObject';

const DatabaseWidget: Component = () => {
  const databaseList = useConnectionList();

  return (
    <div>
      <h2 class="theme-pen-0">Database Widget</h2>
      <For each={databaseList()}>{item => <ConnectionAppObject data={item} />}</For>
    </div>
  );
};

export default DatabaseWidget;
