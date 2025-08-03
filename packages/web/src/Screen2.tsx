import { Show, For, createEffect, createMemo, createSignal, onMount } from "solid-js";
import type { Component } from "solid-js";
import TabsContainer from "./tabpanel/TabsContainer";

const WidgetIconPanel = () => <div class="w-full h-full flex items-start justify-center pt-2 bg-gray-600 text-gray-200">Icons</div>;
const WidgetContainer = () => <div class="w-full h-full p-3 bg-gray-100">WidgetContainer</div>;
const StatusBar = () => <div class="w-full h-full px-3 flex items-center bg-sky-500 text-white text-xs">StatusBar</div>;


const App: Component = () => {
  return <div>
    <div class='fixed left-0 w-[var(--dim-widget-icon-size)] bottom-5 top-0'><WidgetIconPanel /></div>
    <div class='fixed bottom-0 left-0 right-0 h-[var(--dim-statusbar-height)]'><StatusBar /></div>
    <div
      class="fixed top-[var(--dim-header-top)] left-[var(--dim-widget-icon-size)] bottom-[var(--dim-statusbar-height)] w-[var(--dim-left-panel-width)]"
    >
      <WidgetContainer />
    </div>
    <div class='fixed left-[var(--dim-content-left)]'><TabsContainer /></div>
  </div>;

};

export default App;

