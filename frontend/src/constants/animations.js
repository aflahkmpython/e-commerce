export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02 },
  transition: { type: "spring", stiffness: 300, damping: 15 }
};

export const buttonPulse = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1 }
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const inputFocus = "focus:ring-2 focus:ring-neon-teal focus:border-neon-teal border-gray-200 transition-all duration-300";
