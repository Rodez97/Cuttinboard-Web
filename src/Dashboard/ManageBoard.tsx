/** @jsx jsx */
import { jsx } from "@emotion/react";
import { SaveFilled } from "@ant-design/icons";
import { Alert, Button, Divider, Form, Input, Modal } from "antd/es";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash-es/isEmpty";
import { useDisclose, useGBoard } from "@rodez97/cuttinboard-library";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import { IBoard } from "@rodez97/types-helpers";

export interface ManageBoardRef {
  openNew: () => void;
  openEdit: (module: IBoard) => void;
}

type ManageBoardProps = {
  moduleName: string;
};

type FormType = {
  name: string;
  description?: string;
};

const ManageBoard = forwardRef<ManageBoardRef, ManageBoardProps>(
  ({ moduleName }, ref) => {
    const { t } = useTranslation();
    const [form] = Form.useForm<FormType>();
    const { addNewBoard, selectedBoard, updateBoard } = useGBoard();
    const [isOpen, open, close] = useDisclose(false);
    const [title, setTitle] = useState("");
    const [baseModule, setBaseModule] = useState<IBoard | null>(null);
    const isEditing = !isEmpty(baseModule);

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = () => {
      setTitle(t("New " + moduleName));
      open();
    };

    const openEdit = (module: IBoard) => {
      setTitle(t("Edit " + moduleName));
      setBaseModule(module);
      open();
    };

    const handleClose = () => {
      close();
      setBaseModule(null);
      form.resetFields();
    };

    const onFinish = async (values: FormType) => {
      if (isEditing && selectedBoard) {
        updateBoard(selectedBoard, values);
        logAnalyticsEvent("global_board_updated", {
          type: moduleName,
          name: values.name ?? selectedBoard.name,
        });
      } else {
        addNewBoard(values);
        logAnalyticsEvent("global_board_created", {
          type: moduleName,
          name: values.name,
        });
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
          initialValues={{
            name: baseModule?.name,
            description: baseModule?.description,
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

          <Alert
            message={t("Global Boards are public by default")}
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    );
  }
);

export const useManageBoard = () => {
  const baseRef = useRef<ManageBoardRef>(null);

  const newBoard = () => {
    baseRef.current?.openNew();
  };

  const editBoard = (board: IBoard) => {
    baseRef.current?.openEdit(board);
  };

  return {
    baseRef,
    newBoard,
    editBoard,
  };
};

export default ManageBoard;
