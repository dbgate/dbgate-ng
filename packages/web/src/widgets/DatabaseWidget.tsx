import { Component } from 'solid-js';
import { useConnectionList } from '../utility/metadataLoaders';
import { For } from 'solid-js';
import ConnectionAppObject from '../appobj/ConnectionAppObject';
import { WidgetColumnBar } from './WidgetColumnBar';
import WidgetColumnBarItem from './WidgetColumnBarItem';

const DatabaseWidget: Component = () => {
  const databaseList = useConnectionList();

  return (
    <WidgetColumnBar>
      <WidgetColumnBarItem title="Database" name="database">
        <For each={databaseList()}>{item => <ConnectionAppObject data={item} />}</For>
      </WidgetColumnBarItem>
    </WidgetColumnBar>
  );
};

export default DatabaseWidget;
