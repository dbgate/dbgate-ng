import { Accessor } from 'solid-js';

export interface AppObjectElement {
  icon: string;
  title: string;
  expandIcon?: string;
  isBusy?: boolean;
  colorMark?: string;
  extInfo?: string;
}

export interface AppObjectTreeNodeBase {
  element: AppObjectElement;
  children: Accessor<AppObjectTreeNodeBase[]>;
}

export interface AppObjectTreeBase {
  children: Accessor<AppObjectTreeNodeBase[]>;
}
