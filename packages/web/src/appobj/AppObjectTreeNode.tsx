import { Component, createEffect, createSignal, JSX, Show, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import FontIcon from '../elements/FontIcon';
import { AppObjectElement } from './AppObjectTreeBase';

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

export interface AppObjectTreeNodeProps {
  element: AppObjectElement;
  indentLevel?: number;
  filter?: string;
  onClick?: () => void;
}

const AppObjectTreeNode: Component<AppObjectTreeNodeProps> = (props) => {

  return (
    <>
      <div
        class="p-1.5 text-sm cursor-pointer whitespace-nowrap font-normal relative flex items-center group dbgate-list"
        draggable={true}
        onClick={props.onClick}
      >

        <Show when={props.element.expandIcon}>
          <span class="mr-1" onClick={(e) => {
            e.stopPropagation();
            // handleExpand();
          }}>
            <FontIcon icon={props.element.expandIcon!} />
          </span>
        </Show>

        <Show when={props.indentLevel}>
          <span style={{ 'margin-right': `${props.indentLevel! * 16}px` }} />
        </Show>

        <span class='mr-1'>
          <Show when={props.element.isBusy} fallback={<FontIcon icon={props.element.icon} />}>
            <FontIcon icon="icon loading" />
          </Show>
        </span>

        <Show when={props.element.colorMark}>
          <FontIcon style={{ color: props.element.colorMark }} icon="icon square" />
        </Show>

        <TokenizedFilteredText text={props.element.title} filter={props.filter} />

        {/* <Show when={props.statusIconBefore}>
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
        </Show> */}

        <Show when={props.element.extInfo}>
          <span class="font-normal ml-1 dbgate-graytext">
            <TokenizedFilteredText text={props.element.extInfo!} filter={props.filter} />
          </span>
        </Show>

        {/* <Show when={props.onPin}>
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
        </Show> */}
      </div>
    </>
  );
};

export default AppObjectTreeNode;