/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DeleteOutlined,
  NumberOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input, List, Modal } from "antd";
import { logEvent } from "firebase/analytics";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  FIRESTORE,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ANALYTICS } from "firebase";
import { ILocation } from "@cuttinboard-solutions/types-helpers";

export interface DeleteLocationDialogRef {
  openDialog: (location: ILocation) => void;
}

export default forwardRef<DeleteLocationDialogRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { user } = useCuttinboard();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [location, setLocation] = useState<ILocation>({} as ILocation);
  const [error, setError] = useState<Error | null>(null);

  const deleteLocation = async ({ password }: { password: string }) => {
    if (!user.email) {
      throw new Error("User email is not set.");
    }
    try {
      setDeleting(true);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(FIRESTORE, location.refPath));
      // Report to analytics
      logEvent(ANALYTICS, "delete_location", {
        location_id: location.id,
        location_name: location.name,
      });
      // Close dialog
      close();
    } catch (error) {
      setError(error);
      recordError(error);
      setDeleting(false);
    }
  };

  const openDialog = (location: ILocation) => {
    setLocation(location);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setDeleting(false);
    setLocation({} as ILocation);
    setError(null);
    form.resetFields();
  };

  useImperativeHandle(ref, () => ({
    openDialog,
  }));

  if (!location) {
    return null;
  }

  return (
    <Modal
      confirmLoading={deleting}
      open={open}
      title={t("Are you sure you want to delete this location?")}
      onOk={form.submit}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close} type="dashed">
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={deleting}
          onClick={form.submit}
          icon={<DeleteOutlined />}
        >
          {t("Delete")}
        </Button>,
      ]}
    >
      <List size="small" bordered>
        <List.Item>
          <List.Item.Meta avatar={<ShopOutlined />} title={location.name} />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<TeamOutlined />}
            title={t("{{0}} Member(s)", { 0: location.members?.length ?? 0 })}
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<NumberOutlined />}
            title={t("ID: {{0}}", { 0: location.intId ?? "---" })}
          />
        </List.Item>
      </List>

      <Alert
        css={{ marginTop: 16 }}
        message={t(
          "This action will permanently delete this location and all associated data. It cannot be undone. Are you sure you want to proceed?"
        )}
        type="warning"
      />
      <Form
        css={{ marginTop: 16 }}
        form={form}
        autoComplete="off"
        onFinish={deleteLocation}
        disabled={deleting}
        layout="vertical"
      >
        <Form.Item
          label={t("Please type your password to confirm")}
          required
          name="password"
          rules={[{ required: true, message: "" }]}
        >
          <Input.Password autoComplete="none" />
        </Form.Item>
      </Form>
      {error && <Alert type="error" showIcon message={t(error.message)} />}
    </Modal>
  );
});
