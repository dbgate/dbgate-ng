import { createSignal, For, JSX, createMemo, Index } from 'solid-js';
import { createElementBounds } from '@solid-primitives/bounds';
import WidgetTitle from './WidgetTitle';
import FontIcon from '../elements/FontIcon';

export interface WidgetColumnBarItemProps {
  title: string;
  name: string;
  initialHeight?: string; // percentage of parent height (40%) or pixels (20px)
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

  // Parse height string (e.g., "40%", "200px") to pixels
  const parseHeight = (heightStr: string | undefined, totalHeight: number): number => {
    if (!heightStr) return 0;
    
    if (heightStr.endsWith('%')) {
      const percentage = parseFloat(heightStr.slice(0, -1));
      return (totalHeight * percentage) / 100;
    } else if (heightStr.endsWith('px')) {
      return parseFloat(heightStr.slice(0, -2));
    } else {
      // Assume pixels if no unit specified
      return parseFloat(heightStr) || 0;
    }
  };

  // Calculate height for each item
  const getItemHeight = createMemo(() => {
    const totalHeight = bounds.height || 0;
    const titleHeight = 40; // Approximate height of each title
    const totalTitleHeight = props.children.length * titleHeight;
    const availableContentHeight = totalHeight - totalTitleHeight;
    
    const itemHeights = new Map<string, number>();
    const expandedItemNames = Array.from(expandedItems());
    
    // If only one item is expanded, give it full height
    if (expandedItemNames.length === 1) {
      itemHeights.set(expandedItemNames[0], availableContentHeight);
      return itemHeights;
    }
    
    // Calculate heights for items with specific initialHeight
    let usedHeight = 0;
    let itemsWithoutHeight = 0;
    
    props.children.forEach(item => {
      if (expandedItems().has(item.name)) {
        if (item.initialHeight) {
          const height = parseHeight(item.initialHeight, availableContentHeight);
          itemHeights.set(item.name, height);
          usedHeight += height;
        } else {
          itemsWithoutHeight++;
        }
      }
    });
    
    // Distribute remaining height among items without specific height
    const remainingHeight = Math.max(0, availableContentHeight - usedHeight);
    const defaultHeight = itemsWithoutHeight > 0 ? remainingHeight / itemsWithoutHeight : 0;
    
    props.children.forEach(item => {
      if (expandedItems().has(item.name) && !item.initialHeight) {
        itemHeights.set(item.name, defaultHeight);
      }
    });
    
    return itemHeights;
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
                  height: expanded() ? `${getItemHeight().get(itemData.name) || 0}px` : '0px',
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
