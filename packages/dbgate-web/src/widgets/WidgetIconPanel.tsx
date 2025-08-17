import { For, type Component } from "solid-js";
import FontIcon from "../elements/FontIcon";
import { selectedWidget, setSelectedWidget } from "../core/appstate";
import { dbgateLocalDb } from "../core/localdb";

const widgets = [
  // getCurrentConfig().storageDatabase && {
  //   icon: 'icon admin',
  //   name: 'admin',
  //   title: 'Administration',
  // },
  {
    icon: "icon database",
    name: "database",
    title: "Database connections",
  },
  // getCurrentConfig().allowPrivateCloud && {
  //   name: 'cloud-private',
  //   title: 'DbGate Cloud',
  //   icon: 'icon cloud-private',
  // },

  // {
  //   icon: 'fa-table',
  //   name: 'table',
  // },
  {
    icon: "icon file",
    name: "file",
    title: "Favorites & Saved files",
  },
  {
    icon: "icon history",
    name: "history",
    title: "Query history & Closed tabs",
  },
  {
    icon: "icon archive",
    name: "archive",
    title: "Archive (saved tabular data)",
  },
  {
    icon: "icon plugin",
    name: "plugins",
    title: "Extensions & Plugins",
  },
  {
    icon: "icon cell-data",
    name: "cell-data",
    title: "Selected cell data detail view",
  },
  {
    name: "cloud-public",
    title: "DbGate Cloud",
    icon: "icon cloud-public",
  },
  {
    icon: "icon premium",
    name: "premium",
    title: "Premium promo",
    isPremiumPromo: true,
  },
  // {
  //   icon: 'icon settings',
  //   name: 'settings',
  // },
  // {
  //   icon: 'fa-check',
  //   name: 'settings',
  // },
];

const WidgetIconPanel: Component = () => {
  const widgetIcon =
    "text-3xl py-1 cursor-pointer transition-colors duration-150 w-full text-center border-l-2 border-r-2 border-transparent dbgate-widget-icon";

  const handleAddTab = () => {
    dbgateLocalDb.tabs.add({
      tabid: crypto.randomUUID(),
      title: "Query #",
      icon: "img sql-file",
      props: {},
      tabComponent: "QueryTab",
    });
  };

  return (
    <div class="w-full h-full flex flex-col items-center justify-start dbgate-widget-panel">
      <For each={widgets}>
        {(widget) => (
          <div
            class={widgetIcon}
            classList={{
              "dbgate-widget-icon-active": selectedWidget() === widget.name,
            }}
            onClick={() =>
              setSelectedWidget((old) =>
                old == widget.name ? null : widget.name
              )
            }
          >
            <FontIcon icon={widget.icon} title={widget.title} />
          </div>
        )}
      </For>
      <div class={widgetIcon} onClick={handleAddTab}>
        <FontIcon icon="icon add" />
      </div>
    </div>
  );
};

export default WidgetIconPanel;
