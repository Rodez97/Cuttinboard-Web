/** @jsx jsx */
import { jsx } from "@emotion/react";
import { SaveFilled } from "@ant-design/icons";
import { Button, Form, Input, Modal, Radio, Select, Space } from "antd";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { isEmpty } from "lodash";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  Conversation,
  useConversations,
} from "@cuttinboard-solutions/cuttinboard-library/chats";
import {
  POSITIONS,
  PrivacyLevel,
  privacyLevelToString,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

export interface ManageConvDialogRef {
  openNew: () => void;
  openEdit: (conversation: Conversation) => void;
}

type FormType = {
  name: string;
  description?: string;
  position?: string;
  privacyLevel: PrivacyLevel;
};

const ManageConvDialog = forwardRef<ManageConvDialogRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const privacyLevel = Form.useWatch("privacyLevel", form);
  const [isSubmitting, startSubmit, endSubmit] = useDisclose();
  const { addConversation, canManage, modifyConversation } = useConversations();
  const [isOpen, open, close] = useDisclose(false);
  const [title, setTitle] = useState("");
  const { location } = useCuttinboardLocation();
  const [baseConversation, setbaseConversation] = useState<Conversation | null>(
    null
  );
  const isEditing = !isEmpty(baseConversation);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("New Conversation");
    open();
  };

  const openEdit = (conversation: Conversation) => {
    setTitle("Edit Conversation");
    setbaseConversation(conversation);
    open();
  };

  const handleClose = () => {
    close();
    setbaseConversation(null);
    form.resetFields();
  };

  const onFinish = async (values: FormType) => {
    if (!canManage) {
      return;
    }
    startSubmit();
    try {
      if (isEditing) {
        const { privacyLevel, ...others } = values;
        await modifyConversation(others);
        // Report to analytics
        const analytics = getAnalytics();
        logEvent(analytics, "update_module", {
          module_privacy_level: privacyLevel,
          moduleName: "conversation",
        });
      } else {
        await addConversation(values);
        // Report to analytics
        const analytics = getAnalytics();
        logEvent(analytics, "create_module", {
          module_privacy_level: values.privacyLevel,
          moduleName: "conversation",
        });
      }
      handleClose();
    } catch (error) {
      recordError(error);
    } finally {
      endSubmit();
    }
  };

  const getInitialValues = (): FormType => {
    if (isEditing) {
      return baseConversation;
    }
    return {
      name: "",
      description: "",
      privacyLevel: PrivacyLevel.PUBLIC,
    };
  };

  return (
    <Modal
      open={isOpen}
      title={t(title)}
      confirmLoading={isSubmitting}
      onCancel={handleClose}
      footer={[
        <Button disabled={isSubmitting} onClick={handleClose} key="cancel">
          {t("Cancel")}
        </Button>,
        <Button
          type="primary"
          icon={<SaveFilled />}
          loading={isSubmitting}
          onClick={() => form.submit()}
          key="accept"
        >
          {t("Accept")}
        </Button>,
      ]}
    >
      <Form<FormType>
        form={form}
        layout="vertical"
        style={{ width: "100%" }}
        onFinish={onFinish}
        disabled={isSubmitting}
        initialValues={getInitialValues()}
        autoComplete="off"
      >
        <Form.Item
          required
          name="name"
          label={t("Name")}
          rules={[
            { required: true, message: "" },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value dont hace tailing or leading spaces
                if (value !== value.trim()) {
                  return Promise.reject(
                    new Error(t("Cannot have leading or trailing spaces"))
                  );
                }
              },
            },
          ]}
        >
          <Input maxLength={80} showCount />
        </Form.Item>

        <Form.Item name="description" label={t("Description")}>
          <Input.TextArea maxLength={255} showCount rows={3} />
        </Form.Item>

        <Form.Item
          required
          name="privacyLevel"
          label={t("Privacy Level")}
          rules={[
            {
              required: true,
              message: "",
            },
          ]}
        >
          <Radio.Group disabled={isEditing}>
            <Space direction="vertical">
              <Radio value={PrivacyLevel.PUBLIC}>
                {t(privacyLevelToString(PrivacyLevel.PUBLIC))}
              </Radio>
              <Radio value={PrivacyLevel.POSITIONS}>
                {t(privacyLevelToString(PrivacyLevel.POSITIONS))}
              </Radio>
              <Radio value={PrivacyLevel.PRIVATE}>
                {t(privacyLevelToString(PrivacyLevel.PRIVATE))}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {privacyLevel === PrivacyLevel.POSITIONS && (
          <Form.Item
            required
            name="position"
            label={t("Select Position")}
            rules={[
              {
                required: true,
                message: "",
              },
            ]}
          >
            <Select css={{ width: "100%" }} allowClear showSearch>
              {location.settings?.positions?.length && (
                <Select.OptGroup label={t("Custom")}>
                  {location.settings.positions.map((pos) => (
                    <Select.Option key={pos} value={pos}>
                      {pos}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              )}

              <Select.OptGroup label={t("Default")}>
                {POSITIONS.map((pos) => (
                  <Select.Option key={pos} value={pos}>
                    {pos}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
});

export const useManageConvs = () => {
  const baseRef = useRef<ManageConvDialogRef>(null);

  const newConv = () => {
    baseRef.current?.openNew();
  };

  const editConv = (conversation: Conversation) => {
    baseRef.current?.openEdit(conversation);
  };

  return {
    baseRef,
    newConv,
    editConv,
  };
};

export default ManageConvDialog;
