import { createSignal } from "solid-js";

export const [selectedWidget, setSelectedWidget] = createSignal<string | null>(null);
