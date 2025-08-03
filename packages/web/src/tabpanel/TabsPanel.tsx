import { Component, For, JSX } from "solid-js";
import { openedTabs } from "../core/localdb";
import { Key } from "@solid-primitives/keyed";


const TabsPanel: Component = () => {
  return (
    <div class='flex theme-face-3 h-full w-full items-center'>
      <For each={openedTabs} >
        {(tab) => <div class='px-2 text-sm border-r theme-border last:border-none'>{tab.title}</div>}
      </For>
    </div>
  );
};

export default TabsPanel;

