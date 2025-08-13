import { For, Component, createSignal } from 'solid-js';
import { AppObjectTreeBase } from './AppObjectTreeContract';
import AppObjectTreeNode from './AppObjectTreeNode';

export type AppObjectTreeProps = {
  model: AppObjectTreeBase
};

const AppObjectTree: Component<AppObjectTreeProps> = props => {
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
      <For each={props.model.children()}>
        {item => <AppObjectTreeNode
          element={item.element}
          indentLevel={0}
          filter={''}
        />
        }
      </For>
    </div>
  );
};

export default AppObjectTree;