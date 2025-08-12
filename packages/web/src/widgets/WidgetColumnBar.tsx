import { JSX, Show } from 'solid-js';

export interface WidgetColumnBarProps {
  children: JSX.Element;
}

export const WidgetColumnBar = (props: WidgetColumnBarProps) => {
  return <>{props.children}</>;
};
