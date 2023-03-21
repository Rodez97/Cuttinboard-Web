/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useLocalStorage } from "@rehooks/local-storage/lib/use-localstorage";
import { Button, Checkbox, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWizard } from "react-use-wizard";
import {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionWrapper,
  UserTypeCard,
} from "./SectionWrapper";

export type UserType = "employee" | "owner";

function UserTypeSelector() {
  const { t } = useTranslation();
  const { nextStep } = useWizard();
  const [userType, setUserType] = useState<UserType>("owner");
  const [, , removeNewUser] = useLocalStorage<string | undefined>(
    "cuttinboard:new-user"
  );

  const handleNext = () => {
    if (userType === "owner") {
      nextStep();
    } else {
      removeNewUser();
    }
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
          {t("Welcome to Cuttinboard!")}
        </Typography.Title>
        <Typography.Text
          type="secondary"
          css={{
            fontSize: 20,
          }}
        >
          {t("What type of user are you?")}
        </Typography.Text>
      </SectionHeader>

      <SectionContent>
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <UserTypeCard
            selected={userType === "owner"}
            onClick={() => setUserType("owner")}
          >
            <div className="title-container">
              <Typography.Text className="title">
                {t("I am an Owner")}
              </Typography.Text>

              <Checkbox
                checked={userType === "owner"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setUserType("owner");
                  }
                }}
              />
            </div>

            <Typography.Text type="secondary" className="description">
              {t("I want to get Cuttinboard for my restaurant(s)")}
            </Typography.Text>
          </UserTypeCard>

          <UserTypeCard
            selected={userType === "employee"}
            onClick={() => setUserType("employee")}
          >
            <div className="title-container">
              <Typography.Text className="title">
                {t("I am an employee")}
              </Typography.Text>

              <Checkbox
                checked={userType === "employee"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setUserType("employee");
                  }
                }}
              />
            </div>

            <Typography.Text type="secondary" className="description">
              {t("I want to join my team on Cuttinboard")}
            </Typography.Text>
          </UserTypeCard>
        </div>
      </SectionContent>

      <SectionFooter>
        <Button onClick={handleNext} type="primary" size="large">
          {t("Next")}
        </Button>
      </SectionFooter>
    </SectionWrapper>
  );
}

export default UserTypeSelector;
