import React from 'react';
import { motion, useScroll, useSpring, HTMLMotionProps } from 'motion/react';

export type AnimationType =
  | 'blur-reveal'
  | 'scale-spring'
  | 'clip-curtain'
  | 'slide-left'
  | 'slide-right'
  | 'soft-rise';

interface AnimatedRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  margin?: string;
}

// Apple-inspired smooth spring physics & easing
const appleSpringTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 24,
  mass: 0.8,
};

const editorialEase = [0.16, 1, 0.3, 1] as const;

export const AnimatedReveal: React.FC<AnimatedRevealProps> = ({
  children,
  animation = 'blur-reveal',
  delay = 0,
  duration = 0.65,
  className = '',
  once = true,
  margin = '0px',
  ...props
}) => {
  let initial = {};
  let whileInView = {};
  let transition: any = { duration, delay, ease: editorialEase };

  switch (animation) {
    case 'blur-reveal':
      // Apple keynote blur reveal
      initial = { opacity: 0, filter: 'blur(12px)', scale: 0.97, y: 16 };
      whileInView = { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 };
      transition = { ...appleSpringTransition, delay };
      break;

    case 'scale-spring':
      // Tactile physical pop
      initial = { opacity: 0, scale: 0.9, y: 24 };
      whileInView = { opacity: 1, scale: 1, y: 0 };
      transition = { ...appleSpringTransition, delay };
      break;

    case 'clip-curtain':
      // Editorial luxury fashion curtain reveal
      initial = { opacity: 0.2, clipPath: 'inset(100% 0% 0% 0%)' };
      whileInView = { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' };
      transition = { duration: 0.8, delay, ease: editorialEase };
      break;

    case 'slide-left':
      // Lateral slide from left
      initial = { opacity: 0, x: -36, filter: 'blur(6px)' };
      whileInView = { opacity: 1, x: 0, filter: 'blur(0px)' };
      transition = { ...appleSpringTransition, delay };
      break;

    case 'slide-right':
      // Lateral slide from right
      initial = { opacity: 0, x: 36, filter: 'blur(6px)' };
      whileInView = { opacity: 1, x: 0, filter: 'blur(0px)' };
      transition = { ...appleSpringTransition, delay };
      break;

    case 'soft-rise':
    default:
      initial = { opacity: 0, y: 20 };
      whileInView = { opacity: 1, y: 0 };
      transition = { duration: 0.5, delay, ease: editorialEase };
      break;
  }

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once, margin }}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Top scroll progress bar with subtle gold/forest green gradient
 */
export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#1F5742] via-[#E8A598] to-[#1F5742] origin-left z-50 pointer-events-none"
      style={{ scaleX }}
    />
  );
};

/**
 * Magnetic tactile button with Apple recoil physics
 */
export const AnimatedButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
