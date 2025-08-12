import { Component, createEffect, createSignal, JSX, Show, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import FontIcon from '../elements/FontIcon';

// Placeholder components - these would need to be implemented or imported
const CheckboxField: Component<{ checked: boolean; onChange: (e: Event) => void }> = (props) => (
  <input type="checkbox" checked={props.checked} onChange={props.onChange} />
);

const TokenizedFilteredText: Component<{ text: string; filter?: any }> = (props) => (
  <span>{props.text}</span>
);

// Placeholder utility functions - these would need to be implemented or imported
const contextMenu = (element: HTMLElement, menu: any) => {
  // Context menu implementation would go here
};

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const showSnackbarSuccess = (message: string) => {
  console.log(message); // Placeholder implementation
};

export interface AppObjectCoreProps {
  icon: string;
  title: string;
  data?: any;
  module?: any;
  isBold?: boolean;
  isGrayed?: boolean;
  isChoosed?: boolean;
  isBusy?: boolean;
  statusIcon?: string;
  statusIconBefore?: string;
  statusTitle?: string;
  statusTitleToCopy?: string;
  extInfo?: string;
  menu?: any;
  expandIcon?: string;
  checkedObjectsStore?: any;
  disableContextMenu?: boolean;
  colorMark?: string;
  onPin?: () => void;
  onUnpin?: () => void;
  showPinnedInsteadOfUnpin?: boolean;
  indentLevel?: number;
  disableBoldScroll?: boolean;
  filter?: any;
  disableHover?: boolean;
  divProps?: JSX.HTMLAttributes<HTMLDivElement>;
  onExpand?: () => void;
  onClick?: () => void;
  onMiddleClick?: () => void;
  onMouseDown?: (e: MouseEvent) => void;
  onDblClick?: (e: MouseEvent) => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnter?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  'data-testid'?: string;
  children?: JSX.Element;
}

const AppObjectCore: Component<AppObjectCoreProps> = (props) => {
  let domDiv: HTMLDivElement | undefined;
  
  const [isChecked, setIsChecked] = createSignal(false);

  // Reactive effect for checking if object is checked
  createEffect(() => {
    if (props.checkedObjectsStore && props.module && props.data) {
      const store = props.checkedObjectsStore();
      const checked = store?.find((x: any) => 
        props.module?.extractKey(props.data) === props.module?.extractKey(x)
      );
      setIsChecked(!!checked);
    }
  });

  // Effect for scrolling when bold
  createEffect(() => {
    if (props.isBold && domDiv && !props.disableBoldScroll) {
      domDiv.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  });

  // Effect for scrolling when chosen
  createEffect(() => {
    if (props.isChoosed && domDiv) {
      domDiv.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  });

  const handleExpand = () => {
    props.onExpand?.();
  };

  const handleClick = () => {
    if (props.checkedObjectsStore && props.module && props.data) {
      if (isChecked()) {
        // Remove from checked objects
        const currentStore = props.checkedObjectsStore();
        const filtered = currentStore.filter((y: any) => 
          props.module?.extractKey(props.data) !== props.module?.extractKey(y)
        );
        props.checkedObjectsStore.set?.(filtered);
      } else {
        // Add to checked objects
        const currentStore = props.checkedObjectsStore();
        props.checkedObjectsStore.set?.([...currentStore, props.data]);
      }
    } else {
      props.onClick?.();
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (e.button === 1) {
      props.onMiddleClick?.();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
    }
    props.onMouseDown?.(e);
  };

  const setChecked = (value: boolean) => {
    if (!value && isChecked() && props.checkedObjectsStore && props.module && props.data) {
      const currentStore = props.checkedObjectsStore();
      const filtered = currentStore.filter((y: any) => 
        props.module?.extractKey(props.data) !== props.module?.extractKey(y)
      );
      props.checkedObjectsStore.set?.(filtered);
    }
    if (value && !isChecked() && props.checkedObjectsStore && props.data) {
      const currentStore = props.checkedObjectsStore();
      props.checkedObjectsStore.set?.([...currentStore, props.data]);
    }
  };

  const handleDragStart = (e: DragEvent) => {
    if (props.data) {
      e.dataTransfer?.setData('app_object_drag_data', JSON.stringify(props.data));
    }
    props.onDragStart?.(e);
  };

  // Set up context menu
  onMount(() => {
    if (domDiv && !props.disableContextMenu && props.menu) {
      contextMenu(domDiv, props.menu);
    }
  });

  return (
    <>
      <div
        ref={domDiv}
        class="p-1.5 cursor-pointer whitespace-nowrap font-normal relative flex items-center group"
        classList={{
          'font-bold': props.isBold,
          'text-gray-500': props.isGrayed,
          'bg-blue-100': props.isChoosed,
          'hover:bg-gray-100': !props.disableHover
        }}
        draggable={true}
        onClick={handleClick}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onDblClick={props.onDblClick}
        onDragStart={handleDragStart}
        onDragEnter={props.onDragEnter}
        onDragEnd={props.onDragEnd}
        onDrop={props.onDrop}
        data-testid={props['data-testid']}
        {...props.divProps}
      >
        <Show when={props.checkedObjectsStore}>
          <CheckboxField
            checked={isChecked()}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              setChecked(target.checked);
            }}
          />
        </Show>
        
        <Show when={props.expandIcon}>
          <span class="mr-1" onClick={(e) => {
            e.stopPropagation();
            handleExpand();
          }}>
            <FontIcon icon={props.expandIcon!} />
          </span>
        </Show>
        
        <Show when={props.indentLevel}>
          <span style={{ 'margin-right': `${props.indentLevel! * 16}px` }} />
        </Show>
        
        <Show when={props.isBusy} fallback={<FontIcon icon={props.icon} />}>
          <FontIcon icon="icon loading" />
        </Show>
        
        <Show when={props.colorMark}>
          <FontIcon style={{ color: props.colorMark }} icon="icon square" />
        </Show>
        
        <TokenizedFilteredText text={props.title} filter={props.filter} />
        
        <Show when={props.statusIconBefore}>
          <span class="ml-1">
            <FontIcon icon={props.statusIconBefore!} />
          </span>
        </Show>
        
        <Show when={props.statusIcon}>
          <span class="ml-1">
            <FontIcon
              icon={props.statusIcon!}
              title={props.statusTitle}
              onClick={() => {
                if (props.statusTitleToCopy) {
                  copyTextToClipboard(props.statusTitleToCopy);
                  showSnackbarSuccess('Copied to clipboard');
                }
              }}
            />
          </span>
        </Show>
        
        <Show when={props.extInfo}>
          <span class="font-normal ml-1 text-gray-500">
            <TokenizedFilteredText text={props.extInfo!} filter={props.filter} />
          </span>
        </Show>
        
        <Show when={props.onPin}>
          <span
            class="z-[150] absolute right-0 text-gray-600 hover:text-gray-800 invisible group-hover:visible"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.onPin!();
            }}
          >
            <FontIcon icon="icon pin" />
          </span>
        </Show>
        
        <Show when={props.onUnpin}>
          <Show when={props.showPinnedInsteadOfUnpin} fallback={
            <span
              class="z-[150] absolute right-0 text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.onUnpin!();
              }}
            >
              <FontIcon icon="icon close" />
            </span>
          }>
            <span class="z-[150] absolute right-0 text-gray-600">
              <FontIcon icon="icon pin" />
            </span>
          </Show>
        </Show>
      </div>
      {props.children}
    </>
  );
};

export default AppObjectCore;