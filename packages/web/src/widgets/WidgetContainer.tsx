import { Match, Switch, type Component } from "solid-js";
import { selectedWidget } from "../appstate";
import DatabaseWidget from "./DatabaseWidget";
import ThemePaletteWidget from "./ThemePaletteWidget";

const WidgetContainer: Component = () => {
  return (
    <div class="w-full h-full p-3 theme-face-1 theme-pen-1">
      <Switch>
        <Match when={selectedWidget() === "database"}>
          <DatabaseWidget />
        </Match>
        <Match when={selectedWidget() === "theme-palette"}>
          <ThemePaletteWidget />
        </Match>
      </Switch>
    </div>
  );
};

export default WidgetContainer;
