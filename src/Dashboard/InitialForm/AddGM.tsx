/** @jsx jsx */
import {
  FIRESTORE,
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Button, Form, Input, Modal, Typography, message } from "antd/es";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import { httpsCallable } from "firebase/functions";
import React, { useState } from "react";
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
import isEmpty from "lodash-es/isEmpty";
import type {
  AddLocationFunctionArgs,
  GMArgs,
} from "../OwnerPortal/AddLocation/NewLocationTypes";

type AddGMProps = {
  locationName: string;
};

function AddGM({ locationName }: AddGMProps) {
  const [form] = Form.useForm<GMArgs>();
  const navigate = useNavigate();
  const { user } = useCuttinboard();
  const { t } = useTranslation();
  const { previousStep } = useWizard();
  const [, , removeNewUser] = useSignUpLocalTracker();
  const [promoCode, setPromoCode] = useState<string>();

  const confirmCreation = async (gm?: GMArgs) => {
    try {
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

      const upgradeAccount = httpsCallable<AddLocationFunctionArgs, void>(
        FUNCTIONS,
        "http-locations-upgradecreate"
      );
      await upgradeAccount({
        location: {
          name: locationName,
        },
        generalManager: gm ? gm : undefined,
        promo: promoCode,
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
      message.error(t(error?.message || "Something went wrong"));
    }
  };

  const handleNext = (gm: GMArgs) => {
    confirmCreate(gm);
  };

  const handleSkip = () => {
    confirmCreate();
  };

  const confirmCreate = (gm?: GMArgs) => {
    Modal.confirm({
      title: t("You are about to create your first location!"),
      content: (
        <React.Fragment>
          <Typography.Text
            css={{
              fontSize: 24,
              fontWeight: 500,
              textAlign: "center",
              display: "block",
              marginBottom: 16,
              // Underline
              textDecoration: "underline",
            }}
          >
            {locationName}
          </Typography.Text>
          <Form.Item
            name="promo"
            rules={[TrimRule]}
            label={t("Do you have a promo code?")}
          >
            <Input
              onChange={(e) => {
                setPromoCode(e.target.value);
              }}
            />
          </Form.Item>
        </React.Fragment>
      ),
      okText: t("Confirm"),
      cancelText: t("Cancel"),
      onOk: () => confirmCreation(gm),
    });
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
        <Form<GMArgs>
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
      </SectionContent>

      <SectionFooter>
        <Button onClick={previousStep} type="dashed" size="large">
          {t("Back")}
        </Button>
        <Button onClick={handleSkip} type="default" size="large">
          {t("Skip")}
        </Button>
        <Button onClick={form.submit} type="primary" size="large">
          {t("Done")}
        </Button>
      </SectionFooter>
    </SectionWrapper>
  );
}

export default AddGM;
