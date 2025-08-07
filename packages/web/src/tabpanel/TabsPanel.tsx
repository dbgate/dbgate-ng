import { Component, For, JSX } from "solid-js";
import { closeOpenedTab, openedTabs, setSelectedTab } from "../core/localdb";
import FontIcon from "../elements/FontIcon";

const TabsPanel: Component = () => {
  return (
    <div class="flex theme-face-3 h-full w-full items-center">
      <For each={openedTabs}>
        {(tab) => (
          <div
            class="pl-3 text-sm border-r theme-border last:border-none theme-pen-1 h-full flex items-center cursor-pointer group"
            classList={{ "theme-face-2": tab.selected }}
            onClick={() => setSelectedTab(tab.tabid)}
          >
            <FontIcon padRight icon={tab.icon} /> {tab.title}
            <span
              class="opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[var(--theme-face-1)] px-1 ml-2 mr-1"
              classList={{
                "opacity-100": tab.selected,
              }}
              onClick={() => closeOpenedTab(tab.tabid)}
            >
              <FontIcon icon="icon close" />
            </span>
          </div>
        )}
      </For>
    </div>
  );
};

export default TabsPanel;
