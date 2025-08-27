import { Accessor } from 'solid-js';

export interface AppObjectElement {
  icon: string;
  title: string;
  expandIcon?: string;
  isBusy?: boolean;
  colorMark?: string;
  extInfo?: string;
}

class AppObjectTreeNodeChildrenHolder {
  childCache: { [key: string]: AppObjectTreeNodeBase } = {};
  getOrCreateNode(key: string, factory: () => AppObjectTreeNodeBase): AppObjectTreeNodeBase {
    if (!this.childCache[key]) {
      this.childCache[key] = factory();
    }
    return this.childCache[key];
  }
  get children(): Accessor<AppObjectTreeNodeBase[]> { return () => [] }
}

export abstract class AppObjectTreeNodeBase extends AppObjectTreeNodeChildrenHolder {
  element: Accessor<AppObjectElement>;
  onClick() { }
  get isExpanded(): Accessor<boolean> {
    return () => false;
  }
}

export abstract class AppObjectTreeBase extends AppObjectTreeNodeChildrenHolder {
}
