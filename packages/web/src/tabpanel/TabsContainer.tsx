import type { Component } from "solid-js";
import TabContent from "./TabContent";
import TabsPanel from "./TabsPanel";

const TabsContainer: Component = () => {
  return (
    <div class="w-full h-full">
      <div class="absolute top-0 left-0 right-0 h-[var(--dim-tabs-panel-height)]">
        <TabsPanel />
      </div>
      <div class="absolute bottom-0 left-0 right-0 top-[var(--dim-tabs-panel-height)]">
        <TabContent />
      </div>
    </div>
  );
};

export default TabsContainer;
