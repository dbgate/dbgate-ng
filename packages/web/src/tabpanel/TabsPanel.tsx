import { Component, For, JSX } from "solid-js";
import { openedTabs } from "../core/localdb";
import { Key } from "@solid-primitives/keyed";
import FontIcon from "../elements/FontIcon";

const TabsPanel: Component = () => {
  return (
    <div class="flex theme-face-3 h-full w-full items-center">
      <For each={openedTabs}>
        {(tab) => (
            <div class="px-3 text-sm border-r theme-border last:border-none theme-pen-1 h-full flex items-center cursor-pointer group">
            <FontIcon padRight icon={tab.icon} /> {tab.title}
            <span class="opacity-0 group-hover:opacity-100 transition-opacity">
              <FontIcon icon='icon close' padLeft />
            </span>
            </div>
        )}
      </For>
    </div>
  );
};

export default TabsPanel;
