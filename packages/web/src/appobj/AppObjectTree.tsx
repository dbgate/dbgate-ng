import { For, Component, JSX, createSignal } from 'solid-js';

export type AppObjectTreeProps = {
  items: any[];
  groupFunc: (item: any) => string;
  module: any;
  checkedObjectsStore?: any;
  disableContextMenu?: boolean;
  passProps?: any;
  onDropOnGroup?: (group: string, data: any) => void;
  groupContextMenu?: any;
  collapsedGroupNames?: string[];
  filter?: (item: any) => boolean;
};

export const AppObjectTree: Component<AppObjectTreeProps> = props => {
  const [expandedGroups, setExpandedGroups] = createSignal<string[]>([]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(
      expandedGroups().includes(group)
        ? expandedGroups().filter(x => x != group)
        : [...expandedGroups(), group]
    );
  };

  return (
    <div class="app-object-tree">
      <For each={props.items}>
        {item => {
          const group = props.groupFunc(item);
          const isExpanded = expandedGroups().includes(group);

          return (
            <div class="group">
              <div class="group-header" onClick={() => toggleGroup(group)}>
                {isExpanded ? '-' : '+'} {group}
              </div>
              <div class={isExpanded ? 'group-content' : 'group-content hidden'}>
                TODO
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};
