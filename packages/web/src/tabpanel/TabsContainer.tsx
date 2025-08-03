import type { Component } from "solid-js";
import TabsPanel from "./TabsPanel";
import TabContent from "./TabContent";

const TabsContainer: Component = () => {
  return (
    <div class="w-full h-full">
      <div class="absolute top-0 left-0 right-0 height-[var(--dim-tabs-panel-height)]">
        <TabsPanel />
      </div>
      <div class="absolute bottom-0 left-0 right-0 top-[var(--dim-tabs-panel-height)]">
        <TabContent />
      </div>
    </div>
  );
};

export default TabsContainer;
