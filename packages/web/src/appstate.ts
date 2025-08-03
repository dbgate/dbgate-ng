import { createEffect, createSignal } from "solid-js";
import { createStoredSignal, subscribeCssVariable } from "./utility/signaltools";

export const [selectedWidget, setSelectedWidget] = createStoredSignal<
  string | null
>("selectedWidget", null);

export const [currentTheme, setCurrentTheme] = createStoredSignal<string>(
  "currentTheme",
  null
);

const darkModeMediaQuery = window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

export function getSystemTheme() {
  return darkModeMediaQuery?.matches ? "dark" : "light";
}

export const currentThemeDefaulted = () => {
  const theme = currentTheme() ?? getSystemTheme();
  return theme ?? "light";
};

export const currentThemeClass = () => {
  return `when-theme-common when-theme-${currentThemeDefaulted()}`;
};

subscribeCssVariable(selectedWidget, x => (x ? 1 : 0), '--dim-visible-left-panel');
