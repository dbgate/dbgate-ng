import { createSignal } from "solid-js";
import { createStoredSignal } from "./utility/signalutl";

export const [selectedWidget, setSelectedWidget] = createStoredSignal<
  string | null
>("selectedWidget", null);
