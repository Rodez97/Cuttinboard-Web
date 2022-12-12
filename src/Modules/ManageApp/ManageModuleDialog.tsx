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
  Board,
  useBoard,
} from "@cuttinboard-solutions/cuttinboard-library/boards";
import {
  POSITIONS,
  PrivacyLevel,
  privacyLevelToString,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

export interface ManageModuleDialogRef {
  openNew: () => void;
  openEdit: (module: Board) => void;
}

type ManageModuleProps = {
  moduleName: string;
};

type FormType = {
  name: string;
  description?: string;
  position?: string;
  privacyLevel: PrivacyLevel;
};

const ManageModuleDialog = forwardRef<ManageModuleDialogRef, ManageModuleProps>(
  ({ moduleName }, ref) => {
    const { t } = useTranslation();
    const [form] = Form.useForm<FormType>();
    const privacyLevel = Form.useWatch("privacyLevel", form);
    const [isSubmitting, startSubmit, endSubmit] = useDisclose();
    const { addNewBoard, selectedBoard, canManageBoard } = useBoard();
    const [isOpen, open, close] = useDisclose(false);
    const [title, setTitle] = useState("");
    const { location } = useCuttinboardLocation();
    const [baseModule, setBaseModule] = useState<Board | null>(null);
    const isEditing = !isEmpty(baseModule);

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = () => {
      setTitle(t("New ") + moduleName);
      open();
    };

    const openEdit = (module: Board) => {
      setTitle(t("Edit ") + moduleName);
      setBaseModule(module);
      open();
    };

    const handleClose = () => {
      close();
      setBaseModule(null);
      form.resetFields();
    };

    const onFinish = async (values: FormType) => {
      if (!canManageBoard) {
        return;
      }
      startSubmit();
      try {
        if (isEditing && selectedBoard) {
          const { privacyLevel, position, ...others } = values;
          if (selectedBoard.privacyLevel === PrivacyLevel.POSITIONS) {
            const admins = selectedBoard.accessTags?.filter((at) =>
              at.startsWith("hostId_")
            );
            const accessTags = [...(admins ?? []), position];
            await selectedBoard.update({ ...others, accessTags });
          } else {
            await selectedBoard.update(others);
          }
          // Report to analytics
          const analytics = getAnalytics();
          logEvent(analytics, "update_module", {
            module_privacy_level: selectedBoard.privacyLevel,
            moduleName,
          });
        } else {
          const { position, ...others } = values;
          if (others.privacyLevel === PrivacyLevel.POSITIONS) {
            await addNewBoard({
              ...others,
              accessTags: position ? [position] : [],
            });
          } else {
            await addNewBoard(others);
          }
          // Report to analytics
          const analytics = getAnalytics();
          logEvent(analytics, "create_module", {
            module_privacy_level: others.privacyLevel,
            moduleName,
          });
        }
        endSubmit();
        handleClose();
      } catch (error) {
        recordError(error);
        endSubmit();
      }
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
          initialValues={{
            name: baseModule?.name,
            description: baseModule?.description,
            position: baseModule?.position,
            privacyLevel: baseModule?.privacyLevel ?? PrivacyLevel.PUBLIC,
          }}
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
                  // Check if value don't have tailing or leading spaces
                  if (value && value !== value.trim()) {
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

          <Form.Item name="privacyLevel" label={t("Privacy Level")}>
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
  }
);

export const useManageModule = () => {
  const baseRef = useRef<ManageModuleDialogRef>(null);

  const newModule = () => {
    baseRef.current?.openNew();
  };

  const editModule = (module: Board) => {
    baseRef.current?.openEdit(module);
  };

  return {
    baseRef,
    newModule,
    editModule,
  };
};

export default ManageModuleDialog;