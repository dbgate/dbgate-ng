import { Accessor } from 'solid-js';

export interface AppObjectElement {
  icon: string;
  title: string;
  data?: any;
}

export interface AppObjectTreeNode {
  element: AppObjectElement;
  children: Accessor<AppObjectTreeNode[]>;
}

export interface AppObjectTreeContract {
  children: Accessor<AppObjectTreeNode[]>;
}
