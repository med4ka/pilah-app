import type { Transition } from "framer-motion";

export const tapScale = { scale: 0.97 };
export const hoverScale = { scale: 1.02 };

export const transitionFast: Transition = { duration: 0.15, ease: "easeOut" };
export const transitionModal: Transition = { duration: 0.2, ease: "easeOut" };

export const fadeSlideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: transitionFast,
};