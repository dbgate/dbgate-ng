import type { Component } from "solid-js";
import { Show } from "solid-js";
import TabsContainer from "../tabpanel/TabsContainer";
import StatusBar from "../widgets/StatusBar";
import WidgetContainer from "../widgets/WidgetContainer";
import WidgetIconPanel from "../widgets/WidgetIconPanel";
import {
  currentThemeClass,
  selectedWidget,
  setLeftPanelWidth,
} from "./appstate";

const Screen: Component = () => {
  const handleResizeSplitter = (e: CustomEvent) => {
    const diff = e.detail;
    setLeftPanelWidth((prevWidth) => Number(prevWidth) + diff);
  };
  return (
    <div class={currentThemeClass()}>
      <div class="fixed left-0 w-[var(--dim-widget-icon-size)] bottom-[var(--dim-statusbar-height)] top-0">
        <WidgetIconPanel />
      </div>
      <div class="fixed bottom-0 left-0 right-0 h-[var(--dim-statusbar-height)]">
        <StatusBar />
      </div>
      <div class="fixed top-[var(--dim-header-top)] left-[var(--dim-widget-icon-size)] bottom-[var(--dim-statusbar-height)] w-[var(--dim-left-panel-width)]">
        <WidgetContainer />
      </div>
      <div class="fixed left-[var(--dim-content-left)] top-0 right-0 bottom-[var(--dim-statusbar-height)]">
        <TabsContainer />
      </div>

      <Show when={selectedWidget()}>
        <div
          class="fixed top-0 left-[var(--dim-main-splitter-left)] bottom-[var(--dim-statusbar-height)] horizontal-split-handle theme-face-1"
          //@ts-ignore
          use:splitterDrag={"clientX"}
          on:resizeSplitter={handleResizeSplitter}
        />
      </Show>
    </div>
  );
};

export default Screen;
