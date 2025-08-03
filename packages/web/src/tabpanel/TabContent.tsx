import { Component, JSX } from 'solid-js';

interface TabContentProps {
    active?: boolean;
    children?: JSX.Element;
}

const TabContent: Component<TabContentProps> = (props) => {
    return (
        <div style={{ display: props.active ? 'block' : 'none' }}>
            XXX
        </div>
    );
};

export default TabContent;