import Dexie, { Table } from "dexie";
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
  () => dbgateLocalDb.tabs.toArray(),
  "tabid"
);
