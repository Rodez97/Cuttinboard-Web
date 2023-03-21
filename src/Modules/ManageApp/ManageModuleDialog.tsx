/** @jsx jsx */
import { jsx } from "@emotion/react";
import { SaveFilled } from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Typography,
} from "antd";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import {
  useBoard,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library";
import Select from "react-select";
import {
  getBoardPosition,
  IBoard,
  POSITIONS,
  PrivacyLevel,
  privacyLevelToString,
} from "@cuttinboard-solutions/types-helpers";

export interface ManageModuleDialogRef {
  openNew: () => void;
  openEdit: (module: IBoard) => void;
}

type ManageModuleProps = {
  moduleName: string;
};

type FormType = {
  name: string;
  description?: string;
  position?: PositionOption;
  privacyLevel: PrivacyLevel;
};

type PositionOption = {
  label: string;
  value: string;
};

type GroupedOption = {
  readonly label: string;
  readonly options: readonly PositionOption[];
};

const formatGroupLabel = (data: GroupedOption) => (
  <div
    css={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <span>{data.label}</span>
    <span
      css={{
        color: "#999",
        fontSize: "0.9em",
      }}
    >
      {data.options.length}
    </span>
  </div>
);

const ManageModuleDialog = forwardRef<ManageModuleDialogRef, ManageModuleProps>(
  ({ moduleName }, ref) => {
    const { t } = useTranslation();
    const [form] = Form.useForm<FormType>();
    const { addNewBoard, canManageBoard, updateBoard } = useBoard();
    const [isOpen, open, close] = useDisclose(false);
    const [title, setTitle] = useState("");
    const { location } = useCuttinboardLocation();
    const [baseModule, setBaseModule] = useState<IBoard | null>(null);
    const isEditing = !isEmpty(baseModule);

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = () => {
      setTitle(t("New ") + moduleName);
      open();
    };

    const openEdit = (module: IBoard) => {
      setTitle(t("Edit ") + moduleName);
      setBaseModule(module);

      const position = getBoardPosition(module);

      const positionOption: PositionOption | undefined = position
        ? {
            label: position,
            value: position,
          }
        : undefined;

      form.setFieldsValue({
        name: module.name,
        description: module.description,
        position: positionOption,
        privacyLevel: module.privacyLevel,
      });
      open();
    };

    const handleClose = () => {
      close();
      setBaseModule(null);
      form.resetFields();
    };

    const onFinish = async ({
      privacyLevel,
      position,
      ...values
    }: FormType) => {
      console.log("values", values);

      if (!canManageBoard) {
        return;
      }

      if (baseModule) {
        updateBoard(baseModule, { ...values, position: position?.value });
      } else {
        addNewBoard({ ...values, privacyLevel, position: position?.value });
      }
      handleClose();
    };

    const positionOptions = useMemo(() => {
      const groupedOptions: GroupedOption[] = [];

      if (location.settings?.positions?.length) {
        groupedOptions.push({
          label: t("Custom"),
          options: location.settings.positions.map((pos) => ({
            label: pos,
            value: pos,
          })),
        });
      }

      groupedOptions.push({
        label: t("Default"),
        options: POSITIONS.map((pos) => ({
          label: pos,
          value: pos,
        })),
      });

      return groupedOptions;
    }, [location.settings.positions, t]);

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
          initialValues={{
            name: "",
            description: "",
            privacyLevel: PrivacyLevel.PUBLIC,
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

          <Divider />

          <Form.Item name="privacyLevel" label={t("Membership Type")}>
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

              if (privacyLevel !== PrivacyLevel.POSITIONS) {
                return null;
              }

              return (
                <Form.Item
                  name="position"
                  rules={[{ required: true, message: "" }]}
                >
                  <Select<PositionOption, false, GroupedOption>
                    options={positionOptions}
                    formatGroupLabel={formatGroupLabel}
                    placeholder={t("Select Position")}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
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

  const editModule = (module: IBoard) => {
    baseRef.current?.openEdit(module);
  };

  return {
    baseRef,
    newModule,
    editModule,
  };
};

export default ManageModuleDialog;
