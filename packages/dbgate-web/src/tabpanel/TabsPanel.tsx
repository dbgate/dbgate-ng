import { Component, For, JSX } from "solid-js";
import { closeOpenedTab, openedTabs, setSelectedTab } from "../core/localdb";
import FontIcon from "../elements/FontIcon";

const TabsPanel: Component = () => {
  return (
    <div class="flex dbgate-tab h-full w-full items-center text-nowrap overflow-x-auto">
      <For each={openedTabs}>
        {(tab) => (
          <div
            class="pl-3 text-sm border-r last:border-r-0 h-full flex items-center cursor-pointer group dbgate-tab "
            classList={{ "dbgate-tab-active border-t": tab.selected }}
            onClick={() => setSelectedTab(tab.tabid)}
          >
            <FontIcon padRight icon={tab.icon} /> {tab.title}
            <span
              class="opacity-0 group-hover:opacity-100 transition-opacity px-1 ml-2 mr-1 dbgate-action-icon"
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
