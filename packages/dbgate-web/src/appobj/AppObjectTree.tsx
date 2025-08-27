import { For, Component, createSignal } from 'solid-js';
import { AppObjectTreeBase, AppObjectTreeNodeBase } from './AppObjectTreeBase';
import AppObjectTreeNode from './AppObjectTreeNode';

export type AppObjectTreeProps = {
  model: AppObjectTreeBase
};

function getFlatChildrenList(list: AppObjectTreeNodeBase[], result: { node: AppObjectTreeNodeBase, indentLevel: number }[] = [], indentLevel = 0): { node: AppObjectTreeNodeBase, indentLevel: number }[] {
  for (const child of list) {
    result.push({ node: child, indentLevel });
    if (child.isExpanded()) {
      getFlatChildrenList(child.children(), result, indentLevel + 1);
    }
  }

  return result;
}

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
      <For each={getFlatChildrenList(props.model.children())}>
        {item => <AppObjectTreeNode
          element={item.node.element()}
          indentLevel={item.indentLevel}
          filter={''}
          onClick={() => item.node.onClick()}
        />
        }
      </For>
    </div>
  );
};

export default AppObjectTree;