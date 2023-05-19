/** @jsx jsx */
import {
  FIRESTORE,
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Alert, Button, Form, Input, Typography } from "antd/es";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
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
import { collection, getDocs, query, where } from "firebase/firestore";
import { ILocationAddress } from "@cuttinboard-solutions/types-helpers";
import isEmpty from "lodash-es/isEmpty";

export interface GMArgs {
  name: string;
  lastName: string;
  email: string;
}

type AddGMProps = {
  locationName: string;
};

export type IUpgradeOwnerData = {
  locationName: string;
  intId?: string;
  address?: ILocationAddress;
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

      if (gm?.email) {
        // Check if the new employee is already an organization level employee
        const checkForSupervisor = await getDocs(
          query(
            collection(FIRESTORE, "Organizations", user.uid, "employees"),
            where("email", "==", gm.email.toLowerCase())
          )
        );
        if (checkForSupervisor.size === 1) {
          throw new Error("Employee is already an organization level employee");
        }
      }

      const upgradeAccount = httpsCallable<IUpgradeOwnerData, void>(
        FUNCTIONS,
        "http-locations-upgradecreate"
      );
      await upgradeAccount({
        locationName,
        gm,
      });
      // Report to analytics
      logAnalyticsEvent("sign_up_flow", {
        type: "owner",
        gmAdded: isEmpty(gm) ? false : true,
      });
      // Redirect to dashboard
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
