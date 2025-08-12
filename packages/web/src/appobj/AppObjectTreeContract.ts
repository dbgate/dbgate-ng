import { Accessor } from 'solid-js';

interface AppObjectElement {
  icon: string;
  title: string;
  data?: any;
}

interface AppObjectTreeNode {
  element: AppObjectElement;
  children: Accessor<AppObjectTreeNode[]>;
}

export interface AppObjectTreeContract {
  children: Accessor<AppObjectTreeNode[]>;
}
