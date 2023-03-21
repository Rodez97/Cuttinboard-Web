/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import LangSelect from "./LangSelect";
import PasswordPanel from "./PasswordPanel";
import ContactDetails from "./ContactDetails";
import ProfilePanel from "./ProfilePanel";
import { Button, Layout } from "antd";
import { UserDeleteOutlined } from "@ant-design/icons";
import React from "react";
import DeleteAccountDialog from "./DeleteAccountDialog";
import usePageTitle from "../../hooks/usePageTitle";
import { GrayPageHeader } from "../../shared";

function Account() {
  const { t } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  usePageTitle("Account");

  return (
    <Layout>
      <GrayPageHeader title={t("Account Details")} />
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
        }}
      >
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

      <DeleteAccountDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      />
    </Layout>
  );
}

export default Account;
