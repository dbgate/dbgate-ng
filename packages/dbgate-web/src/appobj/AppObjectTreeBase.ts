import { Accessor } from 'solid-js';

export interface AppObjectElement {
  icon: string;
  title: string;
  expandIcon?: string;
  isBusy?: boolean;
  colorMark?: string;
  extInfo?: string;
}

export abstract class AppObjectTreeNodeBase {
  element: Accessor<AppObjectElement>;
  get children(): Accessor<AppObjectTreeNodeBase[]> { return () => [] }
  onClick() { }
}

export abstract class AppObjectTreeBase {
  childCache: { [key: string]: AppObjectTreeNodeBase } = {};
  getOrCreateNode(key: string, factory: () => AppObjectTreeNodeBase): AppObjectTreeNodeBase {
    if (!this.childCache[key]) {
      this.childCache[key] = factory();
    }
    return this.childCache[key];
  }
  abstract get children(): Accessor<AppObjectTreeNodeBase[]>;
}
