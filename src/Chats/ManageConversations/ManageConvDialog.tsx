/** @jsx jsx */
import { jsx } from "@emotion/react";
import { SaveFilled, UsergroupAddOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
} from "antd";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { TrimRule } from "../../utils/utils";
import { isEmpty } from "lodash";
import {
  employeesSelectors,
  useAppSelector,
  useConversations,
  useCuttinboardLocation,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library";
import EmployeesSelectDialog from "../../shared/organisms/EmployeesSelectDialog";
import {
  IConversation,
  IEmployee,
  POSITIONS,
  PrivacyLevel,
  privacyLevelToString,
} from "@cuttinboard-solutions/types-helpers";

export interface ManageConvDialogRef {
  openNew: () => void;
  openEdit: (conversation: IConversation) => void;
}

type FormType = {
  name: string;
  description?: string;
  position?: string;
  privacyLevel: PrivacyLevel;
  initialPrivateMembers?: IEmployee[];
};

const ManageConvDialog = forwardRef<ManageConvDialogRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const { addConversation, updateConversation } = useConversations();
  const [isOpen, open, close] = useDisclose(false);
  const [title, setTitle] = useState("");
  const { location } = useCuttinboardLocation();
  const [baseConversation, setBaseConversation] =
    useState<IConversation | null>(null);
  const isEditing = !isEmpty(baseConversation);
  const employees = useAppSelector(employeesSelectors.selectAll);
  const [addMembersOpen, openAddMembers, closeAddMembers] = useDisclose();

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("New Conversation");
    form.setFieldsValue({
      privacyLevel: PrivacyLevel.PUBLIC,
    });
    open();
  };

  const openEdit = (conversation: IConversation) => {
    setTitle("Edit Conversation");
    setBaseConversation(conversation);
    form.setFieldsValue({
      name: conversation.name,
      description: conversation.description,
      position: conversation.position,
      privacyLevel: conversation.privacyLevel,
    });
    open();
  };

  const handleClose = () => {
    close();
    setBaseConversation(null);
    form.resetFields();
  };

  const onFinish = async ({ initialPrivateMembers, ...values }: FormType) => {
    if (baseConversation) {
      const { privacyLevel, ...others } = values;
      updateConversation(baseConversation, {
        name: others.name || baseConversation.name,
        description: others.description || baseConversation.description,
      });
    } else {
      addConversation(
        {
          ...values,
          description: values.description || "",
        },
        location,
        employees,
        initialPrivateMembers
      );
    }
    handleClose();
  };

  return (
    <Modal
      open={isOpen}
      title={t(title)}
      onCancel={handleClose}
      footer={[
        <Button onClick={handleClose} key="cancel">
          {t("Cancel")}
        </Button>,
        <Button
          type="primary"
          icon={<SaveFilled />}
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
            TrimRule,
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
          label={t("Membership Type")}
          rules={[
            {
              required: true,
              message: "",
            },
          ]}
          help
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

        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.privacyLevel !== currentValues.privacyLevel
          }
        >
          {({ getFieldValue }) => {
            const privacyLevel = getFieldValue("privacyLevel");

            switch (privacyLevel) {
              case PrivacyLevel.PRIVATE:
                return (
                  <Typography.Text type="secondary">
                    {t("PUBLIC_DESCRIPTION")}
                  </Typography.Text>
                );
              case PrivacyLevel.POSITIONS:
                return (
                  <Typography.Text type="secondary">
                    {t("POSITIONS_DESCRIPTION")}
                  </Typography.Text>
                );
              case PrivacyLevel.PUBLIC:
                return (
                  <Typography.Text type="secondary">
                    {t("PRIVATE_DESCRIPTION")}
                  </Typography.Text>
                );
            }
          }}
        </Form.Item>

        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.privacyLevel !== currentValues.privacyLevel
          }
        >
          {({ getFieldValue }) => {
            const privacyLevel = getFieldValue("privacyLevel");

            return (
              privacyLevel === PrivacyLevel.POSITIONS && (
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
                  <Select
                    css={{ width: "100%" }}
                    allowClear
                    showSearch
                    disabled={isEditing}
                  >
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
              )
            );
          }}
        </Form.Item>

        {!baseConversation && (
          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.privacyLevel !== currentValues.privacyLevel ||
              prevValues.initialPrivateMembers !==
                currentValues.initialPrivateMembers
            }
          >
            {({ getFieldValue, setFieldValue }) => {
              const privacyLevel: PrivacyLevel = getFieldValue("privacyLevel");
              const getMembers: IEmployee[] | undefined = getFieldValue(
                "initialPrivateMembers"
              );

              return (
                privacyLevel === PrivacyLevel.PRIVATE && (
                  <Form.Item label={t("Select Members")}>
                    <React.Fragment>
                      <Button
                        type="primary"
                        onClick={openAddMembers}
                        block
                        icon={<UsergroupAddOutlined />}
                      >
                        {getMembers && getMembers.length > 0
                          ? t("{{0}} Member(s) Selected", {
                              0: getMembers.length,
                            })
                          : t("Select Members")}
                      </Button>
                      <EmployeesSelectDialog
                        onChange={(members) => {
                          setFieldValue("initialPrivateMembers", members);
                        }}
                        selected={getMembers}
                        source={employees}
                        onClose={closeAddMembers}
                        onCancel={closeAddMembers}
                        open={addMembersOpen}
                      />
                    </React.Fragment>
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
});

export const useManageConvs = () => {
  const baseRef = useRef<ManageConvDialogRef>(null);

  const newConversation = () => {
    baseRef.current?.openNew();
  };

  const editConversation = (conversation: IConversation) => {
    baseRef.current?.openEdit(conversation);
  };

  return {
    ManageConvDialog: <ManageConvDialog ref={baseRef} />,
    newConversation,
    editConversation,
  };
};

export default ManageConvDialog;
