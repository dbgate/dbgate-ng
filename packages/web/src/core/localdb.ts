import Dexie, { type Table } from "dexie";
import { createDexieArrayQuery } from "../utility/dexietools";

export interface TabDefinition {
  tabid: string;
  tabComponent: string;
  title: string;
  icon: string;
  props: any;

  closedTime?: number;
  selected?: boolean;
  busy?: boolean;
  tabOrder?: number;
  multiTabIndex?: number;
  unsaved?: boolean;
  tabPreviewMode?: boolean;
  focused?: boolean;
}

class DbGateLocalDb extends Dexie {
  public tabs!: Table<TabDefinition, string>;

  public constructor() {
    super("dbgatelocaldb");

    this.version(1).stores({
      tabs: "tabid",
    });
  }
}

export const dbgateLocalDb = new DbGateLocalDb();

export const openedTabs = createDexieArrayQuery(
  () => dbgateLocalDb.tabs.filter((tab) => tab.closedTime == null).toArray(),
  "tabid"
);

export async function closeOpenedTab(tabid: string) {
  await dbgateLocalDb.tabs.update(tabid, { closedTime: Date.now() });
}

export async function setSelectedTab(tabid: string) {
  await dbgateLocalDb.tabs.toCollection().modify((tab) => {
    tab.selected = tab.tabid === tabid;
  });
}
