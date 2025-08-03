import {
  Show,
  For,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import type { Component } from "solid-js";
import TabsContainer from "./tabpanel/TabsContainer";
import WidgetIconPanel from "./widgets/WidgetIconPanel";
import WidgetContainer from "./widgets/WidgetContainer";
import StatusBar from "./widgets/StatusBar";
import { currentThemeClass } from "./appstate";

const Screen: Component = () => {
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
    </div>
  );
};

export default Screen;
