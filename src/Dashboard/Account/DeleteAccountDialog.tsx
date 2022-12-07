import { useDeleteAccount } from "@cuttinboard-solutions/cuttinboard-library/account";
import { Alert, Form, Input, Modal } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

function DeleteAccountDialog({ open, onClose }: Props) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { deleteAccount, error, deleting } = useDeleteAccount();

  const onFinish = async ({ password }: { password: string }) => {
    try {
      await deleteAccount(password);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Modal
      title={t("Are you sure you want to delete your account?")}
      confirmLoading={deleting}
      open={open}
      onOk={form.submit}
      onCancel={onClose}
    >
      <Form
        layout="vertical"
        initialValues={{ password: "" }}
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: t("Please input your password!") },
          ]}
          help={t("You will be removed from the locations you belong to")}
        >
          <Input.Password />
        </Form.Item>
      </Form>

      {error && <Alert message={error.message} type="error" showIcon />}
    </Modal>
  );
}

export default DeleteAccountDialog;
