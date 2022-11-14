import { DeleteOutlined, ShopOutlined, TeamOutlined } from "@ant-design/icons";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Typography,
} from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

export interface DeleteLocationDialogRef {
  openDialog: (location: Location) => void;
}

const DeleteLocationDialog = forwardRef<DeleteLocationDialogRef, {}>(
  (_, ref) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [location, setLocation] = useState<Location>(null);
    const [error, setError] = useState<Error>(null);

    const deleteLocation = async ({ password }: { password: string }) => {
      try {
        setDeleting(true);
        const credential = EmailAuthProvider.credential(
          Auth.currentUser.email,
          password
        );
        await reauthenticateWithCredential(Auth.currentUser, credential);
        await deleteDoc(location.docRef);
        // Report to analytics
        const analytics = getAnalytics();
        logEvent(analytics, "delete_location", {
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

    const openDialog = (location: Location) => {
      setLocation(location);
      setOpen(true);
    };

    const close = () => {
      setOpen(false);
      setDeleting(false);
      setLocation(null);
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
          ,
        ]}
      >
        <List.Item.Meta avatar={<ShopOutlined />} title={location.name} />
        <List.Item.Meta
          avatar={<TeamOutlined />}
          title={t("{{0}} member(s)", { 0: location.members?.length ?? 0 })}
        />
        <Divider />
        <Typography>
          {t(
            "This action cannot be undone. This will permanently delete this locacion, data, and all information associated"
          )}
        </Typography>
        <Divider />
        <Form
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
            <Input.Password />
          </Form.Item>
        </Form>
        {error && <Alert type="error" showIcon message={t(error.message)} />}
      </Modal>
    );
  }
);

export default DeleteLocationDialog;
