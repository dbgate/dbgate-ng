import { Component, JSX, Show, mergeProps, splitProps } from 'solid-js';
import FontIcon from '../elements/FontIcon';

export interface WidgetTitleProps {
  clickable?: boolean;
  onClose?: (() => void) | null;
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

const WidgetTitle: Component<WidgetTitleProps> = (props) => {
  const mergedProps = mergeProps({
    clickable: false,
    onClose: null
  }, props);

  const [local, others] = splitProps(mergedProps, ['clickable', 'onClose', 'onClick', 'children']);

  return (
    <div
      onClick={local.onClick}
      classList={{
        'p-1.5 font-bold uppercase dbgate-sidebar-section flex items-center justify-between': true,
        'cursor-pointer select-none': local.clickable
      }}
      {...others}
    >
      {local.children}
      <Show when={local.onClose}>
        <div
          class="cursor-pointer dbgate-action-icon"
          onClick={local.onClose}
        >
          <FontIcon icon="icon close" />
        </div>
      </Show>
    </div>
  );
};

export default WidgetTitle;
