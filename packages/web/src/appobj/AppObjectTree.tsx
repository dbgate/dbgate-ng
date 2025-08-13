import { For, Component, JSX, createSignal } from 'solid-js';
import { AppObjectTreeContract } from './AppObjectTreeContract';
import AppObjectCore from './AppObjectCore';

export type AppObjectTreeProps = {
  model: AppObjectTreeContract
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
        {item => <AppObjectCore
          title={item.element.title}
          icon={item.element.icon}
          data={item.element.data}
        />
        }
      </For>
    </div>
  );
};

export default AppObjectTree;