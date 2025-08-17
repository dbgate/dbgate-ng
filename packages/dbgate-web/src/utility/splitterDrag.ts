// splitterDrag.ts
import { Accessor, onCleanup } from "solid-js";

type Axis = "clientX" | "clientY";

export default function splitterDrag(el: HTMLElement, axisAccessor: Accessor<Axis>) {
  let start: number | null = null;

  const getAxis = () => axisAccessor?.() ?? "clientX";

  const handleDown = (e: MouseEvent) => {
    start = (e as any)[getAxis()];
    document.addEventListener("mousemove", handleMove, true);
    document.addEventListener("mouseup", handleUp, true);
  };

  const handleMove = (e: MouseEvent) => {
    e.preventDefault();
    const axis = getAxis();
    const curr = (e as any)[axis] as number;
    const diff = (start == null ? 0 : curr - start);
    start = curr;

    el.dispatchEvent(new CustomEvent("resizeSplitter", { detail: diff }));
  };

  const handleUp = (e: MouseEvent) => {
    e.preventDefault();
    start = null;
    document.removeEventListener("mousemove", handleMove, true);
    document.removeEventListener("mouseup", handleUp, true);
  };

  el.addEventListener("mousedown", handleDown);

  onCleanup(() => {
    el.removeEventListener("mousedown", handleDown);
    document.removeEventListener("mousemove", handleMove, true);
    document.removeEventListener("mouseup", handleUp, true);
  });
}
