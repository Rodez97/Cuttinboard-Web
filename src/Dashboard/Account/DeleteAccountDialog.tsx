/** @jsx jsx */
import { useDeleteAccount } from "@cuttinboard-solutions/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Alert, Form, Input, Modal } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { useDashboard } from "../DashboardProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

function DeleteAccountDialog({ open, onClose }: Props) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { deleteAccount, error, deleting } = useDeleteAccount();
  const { userDocument } = useDashboard();

  const onFinish = async ({ password }: { password: string }) => {
    try {
      await deleteAccount(password);
    } catch (error) {
      recordError(error);
    }
  };

  const isOwner = useMemo(
    () => Boolean(userDocument?.subscriptionId),
    [userDocument?.subscriptionId]
  );

  return (
    <Modal
      title={t("Are you sure you want to delete your account?")}
      confirmLoading={deleting}
      open={open}
      onOk={form.submit}
      onCancel={onClose}
      okButtonProps={{
        disabled: deleting || isOwner,
      }}
    >
      {isOwner ? (
        <Alert
          message={t(
            "You cannot delete your account while you have an active subscription. Please cancel your subscription first before attempting to delete your account. Please note that once your account is deleted, this action cannot be reversed and all of your related data will be permanently erased. If you have any issues canceling your subscription or have any questions about deleting your account, please contact our support team for assistance"
          )}
          type="error"
        />
      ) : (
        <Alert
          message={t(
            "If you delete your account, all of your data will be permanently erased and you will be removed from all locations and organizations you belong to. This action cannot be reversed. Are you sure you want to proceed with deleting your account?"
          )}
          type="warning"
        />
      )}
      <Form
        layout="vertical"
        initialValues={{ password: "" }}
        form={form}
        onFinish={onFinish}
        autoComplete="off"
        disabled={deleting || isOwner}
        css={{ marginTop: 16 }}
      >
        <Form.Item
          name="password"
          rules={[
            { required: true, message: t("Please input your password!") },
          ]}
        >
          <Input.Password placeholder={t("Password")} />
        </Form.Item>
      </Form>

      {error && <Alert message={error.message} type="error" showIcon />}
    </Modal>
  );
}

export default DeleteAccountDialog;
