import { Component } from "solid-js";
import { currentTheme, setCurrentTheme } from "../core/appstate";

const StatusBar: Component = () => {
  return (
    <div
      class="w-full h-full px-3 flex items-center text-xs theme-statusbar"
      onClick={() =>
        setCurrentTheme(currentTheme() === "dark" ? "light" : "dark")
      }
    >
      Theme: {currentTheme()}
    </div>
  );
};

export default StatusBar;
