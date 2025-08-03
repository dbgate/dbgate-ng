import { Component, For, JSX } from "solid-js";
import { openedTabs } from "../core/localdb";


const TabsPanel: Component = () => {
  return (
    <div>
      <For each={openedTabs}>
        {(tab) => <div>{tab.title}</div>}
      </For>
    </div>
  );
};

export default TabsPanel;

