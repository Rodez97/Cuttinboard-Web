/** @jsx jsx */
import { jsx } from "@emotion/react";
import FirstLocation from "./FirstLocation";
import UserTypeSelector from "./UserTypeSelector";
import { Wizard } from "react-use-wizard";
import { useRef } from "react";
import StepLayout from "./StepLayout";
import { useTranslation } from "react-i18next";
import Step1 from "../../assets/images/InitialForm/Step1.webp";
import Step2 from "../../assets/images/InitialForm/Step2.webp";
import { AnimatePresence } from "framer-motion";
import AnimatedStep from "../../shared/molecules/AnimatedStep";

function InitialForm() {
  const { t } = useTranslation();
  const previousStep = useRef<number>(1);

  return (
    <div
      css={{
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Wizard wrapper={<AnimatePresence initial={false} mode="wait" />}>
        <AnimatedStep previousStep={previousStep}>
          <StepLayout
            image={Step1}
            text={t(
              "\"With Cuttinboard's scheduling tool, I can easily manage my staff's schedules, and the app's push notifications keep everyone on track. It's been a lifesaver! I can't believe I get all of this for only {{0}} a month.\"",
              {
                0: "$50",
              }
            )}
            author="Mark Williamson"
            role={t("GENERAL_MANAGER") + " | Melville Steakhouse"}
          >
            <UserTypeSelector />
          </StepLayout>
        </AnimatedStep>

        <AnimatedStep previousStep={previousStep}>
          <StepLayout
            image={Step2}
            text={t(
              '"Thanks to this software, we can now spend less time on administrative tasks and more time focusing on providing great service to our customers. It has truly revolutionized the way we do business."'
            )}
            author="Olivia Lee"
            role={t("OWNER") + " | Slurp Noodle Bar"}
          >
            <FirstLocation />
          </StepLayout>
        </AnimatedStep>
      </Wizard>
    </div>
  );
}

export default InitialForm;
