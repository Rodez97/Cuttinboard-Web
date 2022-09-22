/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import LangSelect from "./LangSelect";
import PasswordPanel from "./PasswordPanel";
import PhonePanel from "./PhonePanel";
import ProfilePanel from "./ProfilePanel";
import { useCuttinboardAuth } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Input, Layout, message, Modal, Typography } from "antd";
import {
  ExclamationCircleOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import React, { ReactNode } from "react";

function Account() {
  const { deleteAccount } = useCuttinboardAuth();
  const { t } = useTranslation();

  const handleDeleteAccount = () => {
    let password: string;
    Modal.confirm({
      title: t("Are you sure you want to delete your account?"),
      icon: <ExclamationCircleOutlined />,
      content: ((): ReactNode => {
        return (
          <React.Fragment>
            <Typography>
              {t("You will be removed from the locations you belong to")}
            </Typography>
            <Input.Password
              placeholder={t("Password")}
              value={password}
              onChange={({ currentTarget: { value } }) => {
                password = value;
                console.log({ password });
              }}
            />
          </React.Fragment>
        );
      })(),
      async onOk() {
        try {
          await deleteAccount(password);
        } catch (error) {
          recordError(error);
          if (error?.code === "OWNER") {
            message.error(
              t("You can't delete your account because you are an Owner.")
            );
          }
        }
      },
      onCancel() {},
    });
  };

  return (
    <Layout>
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Typography.Title>{t("Account Details")}</Typography.Title>
        <Typography.Title level={5} type="secondary">
          {t("Manage your account details and security")}
        </Typography.Title>
        {/* Basic Info 🙎  */}
        <ProfilePanel />
        {/* Phone Number 📱  */}
        <PhonePanel />
        {/* Password 🔒  */}
        <PasswordPanel />
        <LangSelect />
        <Button
          size="large"
          color="error"
          css={{ minWidth: 270 }}
          onClick={handleDeleteAccount}
          icon={<UserDeleteOutlined />}
          danger
          type="primary"
        >
          {t("Delete Account")}
        </Button>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: "center" }}>
        Cuttinboard ©{new Date().getFullYear()} Elevvate Technologies
      </Layout.Footer>
    </Layout>
  );
}

export default Account;
