import { Match, Switch, type Component } from "solid-js";
import { selectedWidget } from "../core/appstate";
import DatabaseWidget from "./DatabaseWidget";

const WidgetContainer: Component = () => {
  return (
    <div class="w-full h-full p-3 dbgate-sidebar">
      <Switch>
        <Match when={selectedWidget() === "database"}>
          <DatabaseWidget />
        </Match>
     </Switch>
    </div>
  );
};

export default WidgetContainer;
