import useRaf from '@rooks/use-raf';
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { RefObject, useRef } from 'react';
import styled from 'styled-components';
import type { IDockItem } from '__/stores/dock.store';
import { ButtonBase } from '../utils/ButtonBase';
import { DockTooltip } from './DockTooltip';

interface IDockItemProps extends IDockItem {
  mouseX: MotionValue<null | number>;
}

function DockItem({ icon, action, appName, mouseX }: IDockItemProps) {
  const ref = useRef<HTMLImageElement>(null);

  const { width } = useDockHoverAnimation(mouseX, ref);

  return (
    <section>
      <DockItemButton aria-label={`Launch ${appName}`} onClick={action}>
        <DockTooltip label={appName}>
          <motion.img
            ref={ref}
            src={icon}
            draggable={false}
            style={{ width, willChange: 'width' }}
          />
        </DockTooltip>
      </DockItemButton>
    </section>
  );
}

const DockItemButton = styled(ButtonBase)`
  height: 100%;
  width: auto !important;

  cursor: default !important;

  transition: all 200ms ease-in;

  transform-origin: bottom;

  display: flex;
  align-items: flex-end;

  img {
    width: 57.6px;
    height: auto;
  }
`;

const baseWidth = 57.6;
const distanceLimit = baseWidth * 6;
const beyondTheDistanceLimit = distanceLimit + 1;
const distanceInput = [
  -distanceLimit,
  -distanceLimit / 1.25,
  -distanceLimit / 2,
  0,
  distanceLimit / 2,
  distanceLimit / 1.25,
  distanceLimit,
];
const widthOutput = [
  baseWidth,
  baseWidth * 1.1,
  baseWidth * 1.618,
  baseWidth * 2.618,
  baseWidth * 1.618,
  baseWidth * 1.1,
  baseWidth,
];

const useDockHoverAnimation = (
  mouseX: MotionValue<null | number>,
  ref: RefObject<HTMLImageElement>,
) => {
  const distance = useMotionValue(beyondTheDistanceLimit);
  const widthPX = useSpring(useTransform(distance, distanceInput, widthOutput), {
    damping: 25,
    stiffness: 250,
  });

  const width = useTransform(widthPX, (width) => `${width / 16}rem`);

  useRaf(() => {
    const el = ref.current;
    const mouseXVal = mouseX.get();
    if (el && mouseXVal !== null) {
      const rect = el.getBoundingClientRect();

      // get the x coordinate of the img DOMElement's center
      // the left x coordinate plus the half of the width
      const imgCenterX = rect.left + rect.width / 2;

      // difference between the x coordinate value of the mouse pointer
      // and the img center x coordinate value
      const distanceDelta = mouseXVal - imgCenterX;
      distance.set(distanceDelta);
      return;
    }

    distance.set(beyondTheDistanceLimit);
  }, true);

  return { width, ref };
};

export { DockItem };
