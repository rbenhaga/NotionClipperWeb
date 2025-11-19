/**
 * Animation System - Apple/Notion Quality
 * Framer Motion variants and transitions
 * Using Apple's spring physics and easing curves
 */

import { Variants, Transition } from 'framer-motion';

// ===== APPLE-INSPIRED EASING CURVES =====

export const easings = {
  // Apple's signature ease curve
  apple: [0.4, 0.0, 0.2, 1],
  // Smooth deceleration
  easeOut: [0.0, 0.0, 0.2, 1],
  // Smooth acceleration
  easeIn: [0.4, 0.0, 1, 1],
  // Sharp entrance
  sharp: [0.4, 0.0, 0.6, 1],
  // Spring-like bounce
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// ===== SPRING TRANSITIONS =====

export const springs = {
  // Gentle spring (buttons, cards)
  gentle: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Snappy spring (modals, drawers)
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  } as Transition,

  // Bouncy spring (notifications, success states)
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  } as Transition,

  // Smooth spring (page transitions)
  smooth: {
    type: 'spring',
    stiffness: 260,
    damping: 40,
  } as Transition,
} as const;

// ===== DURATION-BASED TRANSITIONS =====

export const durations = {
  // Quick interactions (hover, focus)
  fast: {
    duration: 0.15,
    ease: easings.apple,
  } as Transition,

  // Standard interactions (clicks, form submissions)
  normal: {
    duration: 0.25,
    ease: easings.apple,
  } as Transition,

  // Slower interactions (page transitions, large animations)
  slow: {
    duration: 0.4,
    ease: easings.easeOut,
  } as Transition,
} as const;

// ===== FADE VARIANTS =====

export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: durations.normal,
  },
  exit: {
    opacity: 0,
    transition: durations.fast,
  },
};

// ===== SLIDE VARIANTS =====

export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: durations.fast,
  },
};

export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: durations.fast,
  },
};

export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: durations.fast,
  },
};

export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: durations.fast,
  },
};

// ===== SCALE VARIANTS =====

export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: durations.fast,
  },
};

export const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: durations.fast,
  },
};

// ===== MODAL/OVERLAY VARIANTS =====

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: durations.fast,
  },
};

// ===== LIST/STAGGER VARIANTS =====

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
};

// ===== HOVER/TAP STATES =====

export const hoverScale = {
  scale: 1.02,
  transition: springs.gentle,
};

export const tapScale = {
  scale: 0.98,
  transition: springs.gentle,
};

export const hoverLift = {
  y: -2,
  transition: springs.gentle,
};

// ===== LOADING/PROGRESS VARIANTS =====

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// ===== SUCCESS/CELEBRATION VARIANTS =====

export const successVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

export const confettiVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 0,
  },
  visible: {
    opacity: [0, 1, 1, 0],
    y: -100,
    x: Math.random() * 200 - 100,
    rotate: Math.random() * 360,
    transition: {
      duration: 1.5,
      ease: easings.easeOut,
    },
  },
};

// ===== PAGE TRANSITION VARIANTS =====

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Create a stagger container with custom delay
 */
export const createStaggerContainer = (
  staggerDelay: number = 0.08
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

/**
 * Create a custom spring transition
 */
export const createSpring = (
  stiffness: number = 400,
  damping: number = 30
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
});

/**
 * Create a custom duration transition
 */
export const createDuration = (
  duration: number = 0.25,
  ease: number[] = easings.apple
): Transition => ({
  duration,
  ease,
});
