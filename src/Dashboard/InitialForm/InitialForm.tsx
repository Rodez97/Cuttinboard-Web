/** @jsx jsx */
import { jsx } from "@emotion/react";
import FirstLocation from "./FirstLocation";
import UserTypeSelector from "./UserTypeSelector";
import { Wizard } from "react-use-wizard";
import AddGM from "./AddGM";
import { useRef, useState } from "react";
import StepLayout from "./StepLayout";
import { useTranslation } from "react-i18next";
import Step1 from "../../assets/images/InitialForm/Step1.webp";
import Step2 from "../../assets/images/InitialForm/Step2.webp";
import Step3 from "../../assets/images/InitialForm/Step3.webp";
import { AnimatePresence } from "framer-motion";
import AnimatedStep from "../../shared/molecules/AnimatedStep";

function InitialForm() {
  const { t } = useTranslation();
  const [locationName, setLocationName] = useState("");
  const previousStep = useRef<number>(0);

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
              "\"With Cuttinboard’s scheduling tool, I can easily manage my staff's schedules, and the app's push notifications keep everyone on track. It's been a lifesaver! I can’t believe I get all of this for only $30 a month.\""
            )}
            author="Mark Williamson"
            role="General Manager | Melville Steakhouse"
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
            role="Owner | Slurp Noodle Bar"
          >
            <FirstLocation onChanged={setLocationName} />
          </StepLayout>
        </AnimatedStep>

        <AnimatedStep previousStep={previousStep}>
          <StepLayout
            image={Step3}
            text={t(
              '"Since using Cuttinboard’s messaging software, our restaurant has become more efficient and communication between the team has improved significantly."'
            )}
            author="Isabella Rodriguez"
            role="Owner | The Guac Spot"
          >
            <AddGM locationName={locationName} />
          </StepLayout>
        </AnimatedStep>
      </Wizard>
    </div>
  );
}

export default InitialForm;
