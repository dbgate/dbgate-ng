import { createEffect, createSignal, For, JSX, Show } from 'solid-js';
import WidgetColumnBarItem from './WidgetColumnBarItem';
import { createElementBounds } from '@solid-primitives/bounds';
import WidgetTitle from './WidgetTitle';
export interface WidgetColumnBarItemProps {
  title: string;
  name: string;
  renderBody: () => JSX.Element;
}

export interface WidgetColumnBarProps {
  children: WidgetColumnBarItemProps[];
}

export const WidgetColumnBar = (props: WidgetColumnBarProps) => {
  const [domWrap, setDomWrap] = createSignal<HTMLElement>();

  const bounds = createElementBounds(domWrap);
  // const clientHeight = bounds.height;

  // createEffect(() => {
  //   console.log('bounds original', bounds.height);
  //   console.log('bounds derived', clientHeight);
  // });

  return (
    <div ref={setDomWrap} class="absolute inset-0">
      <For each={props.children}>
        {item => (
          <>
            <WidgetTitle>{item.title}</WidgetTitle>
            {item.renderBody()}
          </>
        )}
      </For>
    </div>
  );
};
