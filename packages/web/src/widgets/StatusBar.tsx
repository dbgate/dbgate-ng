import { Component } from "solid-js";

const StatusBar: Component = () => {
    return (
        <div class='w-full h-full px-3 flex items-center text-xs theme-statusbar'>
            Status: Ready
        </div>
    );
};

export default StatusBar;