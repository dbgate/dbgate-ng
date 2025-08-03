import { Component, JSX } from "solid-js";

interface TabsPanelProps {
  activeTab: number;
  tabs: { label: string; content: JSX.Element }[];
  onTabChange?: (index: number) => void;
}

const TabsPanel: Component<TabsPanelProps> = (props) => {
  return <div>TABSPANEL</div>;
};

export default TabsPanel;
