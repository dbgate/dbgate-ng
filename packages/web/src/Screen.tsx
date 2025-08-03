// AppShellSkeleton.tsx
import { Show, For, createEffect, createMemo, createSignal, onMount } from "solid-js";

/** ---------------- Demo state (replace with real stores later) ---------------- */
const [currentTheme] = createSignal<string | undefined>(undefined);
const [systemThemeStore] = createSignal<string>("system-light");
const [currentThemeDefinition] = createSignal<{ themeType?: "dark" | "light"; themeCss?: string } | undefined>({
  themeType: "light",
  themeCss: "",
});
const [isElectron] = createSignal(false);
const [visibleTitleBar] = createSignal(true);
const [visibleToolbar] = createSignal(true);
const [visibleWidgetSideBar, setVisibleWidgetSideBar] = createSignal(true);
const [visibleCommandPalette] = createSignal(false);
const [selectedWidget] = createSignal(true);
const [isFileDragActive] = createSignal(false);
const [openedSnackbars] = createSignal<{ id: string; text: string }[]>([
  { id: "1", text: "Hello from Snackbar" },
]);

/** -------------------- CSS variable defaults + helpers -------------------- */
function ensureDefaultCssVars() {
  const r = document.documentElement;
  const set = (k: string, v: string) => r.style.getPropertyValue(k) || r.style.setProperty(k, v);

  set("--dim-titlebar-height", "32px");
  set("--dim-toolbar-height", "40px");

  // Header top = titlebar (if visible) + toolbar (if visible). We keep it dynamic below.
  set("--dim-header-top", "72px"); // fallback; will be overridden reactively

  set("--dim-statusbar-height", "26px");
  set("--dim-widget-icon-size", "44px");
  set("--dim-left-panel-width", "280px");
  set("--dim-content-left", "44px"); // fallback; will be overridden reactively

  // Theme colors (fallbacks so you can see something right away)
  set("--theme-font-1", "#e5e7eb"); // Tailwind slate-200
  set("--theme-bg-1", "#0f172a"); // slate-900
  set("--theme-bg-inv-1", "#111827"); // gray-900
  set("--theme-bg-statusbar-inv", "#0b1220");
}

const currentThemeType = createMemo(() =>
  currentThemeDefinition()?.themeType === "dark" ? "theme-type-dark" : "theme-type-light"
);

/** Update derived layout vars: --dim-header-top and --dim-content-left */
function recalcLayoutVars() {
  const r = document.documentElement;
  const titlebar = r.style.getPropertyValue("--dim-titlebar-height") || "32px";
  const toolbar = r.style.getPropertyValue("--dim-toolbar-height") || "40px";
  const toolbarVisible = visibleToolbar();
  const headerTop = `calc(${titlebar} + ${toolbarVisible ? toolbar : "0px"})`;
  r.style.setProperty("--dim-header-top", headerTop);

  const iconSize = r.style.getPropertyValue("--dim-widget-icon-size") || "44px";
  const leftPanel = r.style.getPropertyValue("--dim-left-panel-width") || "280px";
  const showLeft = selectedWidget() && visibleWidgetSideBar();
  const contentLeft = `calc(${iconSize} + ${showLeft ? leftPanel : "0px"})`;
  r.style.setProperty("--dim-content-left", contentLeft);
}

/** Simple left panel width adjuster for the skeleton */
function adjustLeftPanelWidth(deltaPx: number) {
  const r = document.documentElement;
  const curr = r.style.getPropertyValue("--dim-left-panel-width") || "280px";
  const n = parseInt(curr, 10) || 280;
  const next = Math.max(160, Math.min(640, n + deltaPx));
  r.style.setProperty("--dim-left-panel-width", `${next}px`);
  recalcLayoutVars();
}

/** ---------------------- Inject theme CSS into <head> ---------------------- */
createEffect(() => {
  const css = currentThemeDefinition()?.themeCss;
  let el = document.getElementById("themePlugin") as HTMLStyleElement | null;
  if (css && css.trim()) {
    if (!el) {
      el = document.createElement("style");
      el.id = "themePlugin";
      document.head.appendChild(el);
    }
    el.textContent = css;
  } else if (el) {
    el.remove();
  }
});

/** -------------------------- Placeholder “components” -------------------------- */
const TitleBar = () => <div class="h-full px-3 flex items-center">TitleBar</div>;
const WidgetIconPanel = () => <div class="w-full h-full flex items-start justify-center pt-2">Icons</div>;
const StatusBar = () => <div class="w-full px-3 flex items-center">StatusBar</div>;
const WidgetContainer = () => <div class="w-full p-3">WidgetContainer</div>;
const MultiTabsContainer = () => <div class="w-full h-full p-3">Tabs content</div>;
const CommandPalette = () => (
  <div class="rounded border border-white/10 p-3 bg-white/10 backdrop-blur">CommandPalette</div>
);
const Toolbar = () => <div class="h-full px-3 flex items-center">Toolbar</div>;
const CurrentDropDownMenu = () => <div class="hidden" />;
const ModalLayer = () => <div class="hidden" />;
const DragAndDropFileTarget = () => <div class="fixed inset-0 bg-black/20 pointer-events-none">Drop files…</div>;
const Snackbar = (p: { id: string; text: string }) => (
  <div class="m-2 px-3 py-2 rounded shadow bg-neutral-900 text-white text-sm">{p.text}</div>
);
const FontIcon = (p: { icon: string }) => <span>{p.icon}</span>;

/** -------------------------------- Component -------------------------------- */
export default function AppShellSkeleton() {
  onMount(() => {
    ensureDefaultCssVars();
    recalcLayoutVars();
  });

  createEffect(recalcLayoutVars); // recompute when signals change

  return (
    <>
      {/* Mobile “not supported” (unless Electron) */}
      <div class="text-center not-supported" classList={{ isElectron: isElectron() }}>
        <div class="m-5 text-[20pt]">
          <FontIcon icon="img warn" />
        </div>
        <div class="m-3">Sorry, DbGate is not supported on mobile devices.</div>
        <div class="m-3">
          Please visit{" "}
          <a class="underline" href="https://dbgate.org">
            DbGate web
          </a>{" "}
          for more info.
        </div>
      </div>

      {/* MAIN ROOT — pinned to viewport */}
      <div
        class={`dbgate-screen ${currentTheme() ?? systemThemeStore()} ${currentThemeType()}`}
        classList={{ isElectron: isElectron() }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* TitleBar */}
        <Show when={visibleTitleBar()}>
          <div class="titlebar">
            <TitleBar />
          </div>
        </Show>

        {/* Icon bar */}
        <div class="iconbar">
          <WidgetIconPanel />
        </div>

        {/* Status bar */}
        <div class="statusbar">
          <StatusBar />
        </div>

        {/* Left widget panel */}
        <Show when={selectedWidget() && visibleWidgetSideBar()}>
          <div class="leftpanel">
            <WidgetContainer />
          </div>
        </Show>

        {/* Tabs area */}
        <div class="tabs-container">
          <MultiTabsContainer />
        </div>

        {/* Splitter (click to toggle / shift) */}
        <Show when={selectedWidget() && visibleWidgetSideBar()}>
          <div
            class="splitter horizontal-split-handle"
            title="(Skeleton) Click to add 24px. Shift+Click to subtract 24px. Ctrl+Click toggles sidebar."
            onClick={(e) => {
              if ((e as MouseEvent).ctrlKey) setVisibleWidgetSideBar((v) => !v);
              else adjustLeftPanelWidth((e as MouseEvent).shiftKey ? -24 : 24);
            }}
          />
        </Show>

        {/* Command palette */}
        <Show when={visibleCommandPalette()}>
          <div class="commands">
            <CommandPalette />
          </div>
        </Show>

        {/* Toolbar */}
        <Show when={visibleToolbar()}>
          <div class="toolbar">
            <Toolbar />
          </div>
        </Show>

        {/* Global layers */}
        <CurrentDropDownMenu />
        <ModalLayer />

        {/* File drag target */}
        <Show when={isFileDragActive()}>
          <DragAndDropFileTarget />
        </Show>

        {/* Snackbars */}
        <div class="snackbar-container">
          <For each={openedSnackbars()}>{(snack) => <Snackbar {...snack} />}</For>
        </div>
      </div>

      {/* Scoped CSS that mirrors the original layout, with Tailwind where possible */}
      <style>
        {`
          /* Root fills the viewport */
          .dbgate-screen {
            position: fixed;
            inset: 0;
            overflow: hidden;
            color: var(--theme-font-1);
            background: var(--theme-bg-1);
          }

          .titlebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--dim-titlebar-height);
          }

          .toolbar {
            position: fixed;
            top: var(--dim-toolbar-top, var(--dim-titlebar-height));
            left: 0;
            right: 0;
            height: var(--dim-toolbar-height);
            background: var(--theme-bg-1);
          }

          .iconbar {
            position: fixed;
            display: flex;
            left: 0;
            top: var(--dim-header-top);
            bottom: var(--dim-statusbar-height);
            width: var(--dim-widget-icon-size);
            background: var(--theme-bg-inv-1);
          }

          .statusbar {
            position: fixed;
            background: var(--theme-bg-statusbar-inv);
            height: var(--dim-statusbar-height);
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
          }

          .leftpanel {
            position: fixed;
            top: var(--dim-header-top);
            left: var(--dim-widget-icon-size);
            bottom: var(--dim-statusbar-height);
            width: var(--dim-left-panel-width);
            background-color: var(--theme-bg-1);
            display: flex;
          }

          .tabs-container {
            position: fixed;
            top: var(--dim-header-top);
            left: var(--dim-content-left);
            bottom: var(--dim-statusbar-height);
            right: 0;
            background-color: var(--theme-bg-1);
          }

          .splitter {
            position: absolute;
            top: var(--dim-header-top);
            bottom: var(--dim-statusbar-height);
            left: calc(var(--dim-widget-icon-size) + var(--dim-left-panel-width));
            width: 2px;
            cursor: col-resize;
            background: rgba(255,255,255,0.15);
          }

          .commands {
            position: fixed;
            top: var(--dim-header-top);
            left: var(--dim-widget-icon-size);
            z-index: 50;
          }

          .snackbar-container {
            z-index: 1000;
            position: fixed;
            right: 0;
            bottom: var(--dim-statusbar-height);
          }

          /* Mobile "not supported" behavior */
          .not-supported { display: none; }
          @media only screen and (max-width: 600px) {
            .dbgate-screen:not(.isElectron) { display: none; }
            .not-supported:not(.isElectron) { display: block; text-align: center; }
          }
        `}
      </style>
    </>
  );
}
