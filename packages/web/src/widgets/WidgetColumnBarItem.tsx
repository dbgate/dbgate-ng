import { Component, JSX, Show, createSignal, createEffect, useContext, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import _ from 'lodash';

import WidgetTitle from './WidgetTitle';
// import { splitterDrag } from '../utility/splitterDrag';
import { getLocalStorage, setLocalStorage } from '../utility/storageCache';

export interface WidgetColumnBarItemProps {
  title: string;
  name: string;
  skip?: boolean;
  positiveCondition?: boolean;
  height?: string | number | null;
  collapsed?: boolean | null;
  storageName?: string | null;
  onClose?: (() => void) | null;
  children: JSX.Element;
  'data-testid'?: string;
}

interface DynamicProps {
  splitterVisible: boolean;
  visibleItemsCount: number;
}

const WidgetColumnBarItem: Component<WidgetColumnBarItemProps> = (props) => {
  const [size, setSize] = createSignal(0);
  const [visible, setVisible] = createSignal(
    props.storageName && getLocalStorage(props.storageName) && getLocalStorage(props.storageName).visible != null
      ? getLocalStorage(props.storageName).visible
      : !props.collapsed
  );

  const [dynamicProps, setDynamicProps] = createStore<DynamicProps>({
    splitterVisible: false,
    visibleItemsCount: 0,
  });

  // Context functions - these would need to be provided by parent components
//   const pushWidgetItemDefinition = useContext(PushWidgetItemDefinitionContext);
//   const updateWidgetItemDefinition = useContext(UpdateWidgetItemDefinitionContext);
//   const widgetColumnBarHeight = useContext(WidgetColumnBarHeightContext);

  let widgetItemIndex: number;

//   onMount(() => {
//     if (pushWidgetItemDefinition) {
//       widgetItemIndex = pushWidgetItemDefinition(
//         {
//           collapsed: props.collapsed,
//           height: props.height,
//           skip: props.skip,
//           positiveCondition: props.positiveCondition,
//         },
//         { get: () => dynamicProps, set: setDynamicProps }
//       );
//     }
//   });

//   // Update widget item definition when props change
//   createEffect(() => {
//     if (updateWidgetItemDefinition && widgetItemIndex !== undefined) {
//       updateWidgetItemDefinition(widgetItemIndex, {
//         collapsed: !visible(),
//         height: props.height,
//         skip: props.skip,
//         positiveCondition: props.positiveCondition,
//       });
//     }
//   });

//   // Set initial size when height or parent height changes
//   createEffect(() => {
//     const parentHeight = widgetColumnBarHeight?.() || 0;
//     setInitialSize(props.height, parentHeight);
//   });

//   // Save to localStorage when size or visibility changes
//   createEffect(() => {
//     const parentHeight = widgetColumnBarHeight?.() || 0;
//     if (props.storageName && parentHeight > 0) {
//       setLocalStorage(props.storageName, {
//         relativeHeight: size() / parentHeight,
//         visible: visible(),
//       });
//     }
//   });

  const setInitialSize = (initialSize: string | number | null, parentHeight: number) => {
    if (props.storageName) {
      const storage = getLocalStorage(props.storageName);
      if (storage) {
        setSize(parentHeight * storage.relativeHeight);
        return;
      }
    }
    
    if (_.isString(initialSize) && initialSize.endsWith('px')) {
      setSize(parseInt(initialSize.slice(0, -2)));
    } else if (_.isString(initialSize) && initialSize.endsWith('%')) {
      setSize((parentHeight * parseFloat(initialSize.slice(0, -1))) / 100);
    } else {
      setSize(parentHeight / 3);
    }
  };

  const collapsible = () => dynamicProps.visibleItemsCount !== 1 || !visible();

  const handleTitleClick = () => {
    if (collapsible()) {
      setVisible(!visible());
    }
  };

  const handleSplitterResize = (delta: number) => {
    setSize(size() + delta);
  };

  let wrapperRef: HTMLDivElement;

  return (
    <Show when={!props.skip && (props.positiveCondition ?? true)}>
      <WidgetTitle
        clickable={collapsible()}
        onClick={collapsible() ? handleTitleClick : undefined}
        data-testid={props['data-testid']}
        onClose={props.onClose}
      >
        {props.title}
      </WidgetTitle>

      <Show when={visible()}>
        <div
          ref={wrapperRef!}
          class="overflow-hidden relative flex-col flex"
          style={
            dynamicProps.splitterVisible
              ? { height: `${size()}px` }
              : { flex: '1 1 0' }
          }
          data-testid={props['data-testid'] ? `${props['data-testid']}_content` : undefined}
        >
          {props.children}
        </div>

        <Show when={dynamicProps.splitterVisible}>
          <div
            class="vertical-split-handle"
            // use:splitterDrag={['clientY', handleSplitterResize]}
          />
        </Show>
      </Show>
    </Show>
  );
};

// // Context definitions - these would need to be created in parent components
// export const PushWidgetItemDefinitionContext = createContext<
//   ((definition: any, dynamicProps: any) => number) | undefined
// >();

// export const UpdateWidgetItemDefinitionContext = createContext<
//   ((index: number, definition: any) => void) | undefined
// >();

// export const WidgetColumnBarHeightContext = createContext<(() => number) | undefined>();

export default WidgetColumnBarItem;