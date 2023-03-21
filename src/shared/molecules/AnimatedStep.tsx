/** @jsx jsx */
import { jsx } from "@emotion/react";
import { motion, Variants } from "framer-motion";
import * as React from "react";
import { useWizard } from "react-use-wizard";

const variants: Variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 800 : -800,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 800 : -800,
      opacity: 0,
    };
  },
};

type Props = {
  previousStep: React.MutableRefObject<number>;
  children: React.ReactNode;
};

const AnimatedStep: React.FC<Props> = ({
  children,
  previousStep: previousStepIndex,
}) => {
  const { activeStep } = useWizard();

  React.useEffect(() => {
    return () => {
      previousStepIndex.current = activeStep;
    };
  }, [activeStep, previousStepIndex]);

  return (
    <motion.div
      custom={activeStep - previousStepIndex.current}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
};

export default React.memo(AnimatedStep);
