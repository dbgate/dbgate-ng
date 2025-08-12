import { createSignal, For, JSX, createMemo, Index } from 'solid-js';
import { createElementBounds } from '@solid-primitives/bounds';
import WidgetTitle from './WidgetTitle';
import FontIcon from '../elements/FontIcon';

export interface WidgetColumnBarItemProps {
  title: string;
  name: string;
  initialHeight?: string;
  renderBody: () => JSX.Element;
  defaultExpanded?: boolean;
}

export interface WidgetColumnBarProps {
  children: WidgetColumnBarItemProps[];
}

export const WidgetColumnBar = (props: WidgetColumnBarProps) => {
  const [domWrap, setDomWrap] = createSignal<HTMLElement>();
  const bounds = createElementBounds(domWrap);

  // Track expanded state for each item
  const [expandedItems, setExpandedItems] = createSignal<Set<string>>(
    new Set(props.children.filter(item => item.defaultExpanded !== false).map(item => item.name))
  );

  const toggleItem = (name: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const isExpanded = (name: string) => expandedItems().has(name);

  // Calculate available height for expanded items
  const availableHeight = createMemo(() => {
    const totalHeight = bounds.height || 0;
    const titleHeight = 40; // Approximate height of each title
    const expandedCount = expandedItems().size;
    const totalTitleHeight = props.children.length * titleHeight;
    
    return expandedCount > 0 ? (totalHeight - totalTitleHeight) / expandedCount : 0;
  });

  return (
    <div ref={setDomWrap} class="absolute inset-0 flex flex-col overflow-hidden">
      <Index each={props.children}>
        {(item, index) => {
          const itemData = item();
          const expanded = () => isExpanded(itemData.name);
          
          return (
            <div class="flex flex-col">
              <WidgetTitle
                clickable={true}
                onClick={() => toggleItem(itemData.name)}
              >
                <div class="flex items-center gap-2">
                  <div 
                    class="transition-transform duration-200 text-sm"
                    classList={{
                      'rotate-90': expanded(),
                      'rotate-0': !expanded()
                    }}
                  >
                    <FontIcon icon='icon chevron-right' />
                  </div>
                  {itemData.title}
                </div>
              </WidgetTitle>
              
              <div
                class="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  height: expanded() ? `${availableHeight()}px` : '0px',
                  'min-height': expanded() ? '100px' : '0px'
                }}
              >
                <div class="h-full overflow-auto">
                  {itemData.renderBody()}
                </div>
              </div>
            </div>
          );
        }}
      </Index>
    </div>
  );
};
