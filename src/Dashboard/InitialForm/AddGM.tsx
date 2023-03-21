/** @jsx jsx */
import {
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { STRIPE_PRICE_ID } from "@cuttinboard-solutions/types-helpers";
import { jsx } from "@emotion/react";
import { Alert, Button, Form, Input, Typography } from "antd";
import { ANALYTICS } from "firebase";
import { logEvent } from "firebase/analytics";
import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useWizard } from "react-use-wizard";
import useSignUpLocalTracker from "../../hooks/useSignUpLocalTracker";
import { recordError, TrimRule } from "../../utils/utils";
import {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionWrapper,
} from "./SectionWrapper";

export interface GMArgs {
  name: string;
  lastName: string;
  email: string;
}

type AddGMProps = {
  locationName: string;
};

type IUpgradeOwnerData = {
  price: string;
  locationName: string;
  gm: GMArgs | null;
};

function AddGM({ locationName }: AddGMProps) {
  const [form] = Form.useForm<GMArgs>();
  const navigate = useNavigate();
  const { user } = useCuttinboard();
  const { t } = useTranslation();
  const { previousStep } = useWizard();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, , removeNewUser] = useSignUpLocalTracker();

  const confirmCreation = async (gm: GMArgs | null) => {
    try {
      setIsLoading(true);
      const upgradeAccount = httpsCallable<IUpgradeOwnerData, void>(
        FUNCTIONS,
        "http-locations-upgradeCreate"
      );
      await upgradeAccount({
        price: STRIPE_PRICE_ID,
        locationName,
        gm,
      });
      // Report to analytics
      logEvent(ANALYTICS, "upgrade-create-location", {
        method: "stripe",
        price: STRIPE_PRICE_ID,
        uid: user.uid,
      });
      // REdirect to dashboard
      navigate("/dashboard/owner-portal");
      // Remove new user
      removeNewUser();
    } catch (error) {
      recordError(error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async (gm: GMArgs) => {
    confirmCreation(gm);
  };

  const handleSkip = () => {
    confirmCreation(null);
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <Typography.Title
          level={2}
          css={{
            marginBottom: "0 !important",
          }}
        >
          {t("Add a General Manager to {{0}}?", {
            0: locationName,
          })}
        </Typography.Title>
      </SectionHeader>

      <SectionContent>
        <Form
          layout="vertical"
          autoComplete="off"
          autoCorrect="off"
          onFinish={handleNext}
          form={form}
          css={{
            maxWidth: 400,
            width: "100%",
            margin: "0 auto",
          }}
          disabled={isLoading}
        >
          <Form.Item
            name="name"
            label={t("Name")}
            rules={[
              {
                required: true,
                message: "",
              },
              {
                max: 20,
                message: t("Name must be 20 characters or less"),
              },
              {
                whitespace: true,
                message: t("Name cannot be empty"),
              },
              TrimRule,
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={t("Last Name")}
            rules={[
              {
                required: true,
                message: "",
              },
              {
                max: 20,
                message: t("Name must be 20 characters or less"),
              },
              {
                whitespace: true,
                message: t("Name cannot be empty"),
              },
              TrimRule,
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "",
              },
              {
                validator(_, value) {
                  if (value && value === user.email) {
                    return Promise.reject(new Error(t("You can't be the GM")));
                  }
                  return Promise.resolve();
                },
              },
              { type: "email", message: t("Must be a valid email") },
              TrimRule,
            ]}
            label={t("Email")}
          >
            <Input />
          </Form.Item>
        </Form>

        {error && <Alert message={t(error.message)} type="error" showIcon />}
      </SectionContent>

      <SectionFooter>
        <Button
          onClick={previousStep}
          type="dashed"
          size="large"
          disabled={isLoading}
        >
          {t("Back")}
        </Button>
        <Button
          onClick={handleSkip}
          type="default"
          size="large"
          disabled={isLoading}
        >
          {t("Skip")}
        </Button>
        <Button
          onClick={form.submit}
          type="primary"
          size="large"
          loading={isLoading}
        >
          {t("Done")}
        </Button>
      </SectionFooter>
    </SectionWrapper>
  );
}

export default AddGM;
