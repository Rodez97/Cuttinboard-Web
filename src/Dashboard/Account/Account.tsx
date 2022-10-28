/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import LangSelect from "./LangSelect";
import PasswordPanel from "./PasswordPanel";
import ContactDetails from "./ContactDetails";
import ProfilePanel from "./ProfilePanel";
import { Button, Layout, Typography } from "antd";
import { UserDeleteOutlined } from "@ant-design/icons";
import React from "react";
import DeleteAccountDialog from "./DeleteAccountDialog";

function Account() {
  const { t } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

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
        <ContactDetails />
        {/* Password 🔒  */}
        <PasswordPanel />
        <LangSelect />
        <Button
          size="large"
          color="error"
          css={{ minWidth: 270 }}
          onClick={() => setOpenDeleteDialog(true)}
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

      <DeleteAccountDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      />
    </Layout>
  );
}

export default Account;
