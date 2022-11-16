/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteOutlined, SaveFilled, UserOutlined } from "@ant-design/icons";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { ITodo, Todo } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Avatar, Button, DatePicker, Form, Input, List, Modal } from "antd";
import {
  addDoc,
  PartialWithFieldValue,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisclose } from "../../hooks";
import { recordError } from "../../utils/utils";
import AssignUser from "./AssignUser";
import { isEmpty, isEqual } from "lodash";
import moment from "moment";

export interface ManageTaskBlockRef {
  openNew: () => void;
  openEdit: (taskBlock: Todo) => void;
}

type FormDataType = {
  name: string;
  description?: string;
  dueDate?: moment.Moment;
};

const ManageTaskBlock = forwardRef<ManageTaskBlockRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormDataType>();
  const { selectedApp } = useCuttinboardModule();
  const [isOpen, open, close] = useDisclose(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, startSubmit, endSubmit] = useDisclose();
  const [baseTaskBlock, setBaseTaskBlock] = useState<Todo>(null);
  const [assignUserOpen, openAssignUser, closeAssignUser] = useDisclose();
  const [assignedUser, assignUser] = useState<ITodo["assignedTo"]>(null);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("Add Task Block");
    open();
  };

  const openEdit = (taskBlock: Todo) => {
    setTitle("Edit Task Block");
    setBaseTaskBlock(taskBlock);
    const { dueDate, assignedTo, name, description } = taskBlock;
    assignUser(assignedTo);
    form.setFieldsValue({
      name,
      description,
      dueDate: dueDate ? moment(dueDate.toDate()) : undefined,
    });
    open();
  };

  const handleClose = () => {
    close();
    setBaseTaskBlock(null);
    assignUser(null);
    form.resetFields();
  };

  const onFinish = async ({ dueDate, ...values }: FormDataType) => {
    startSubmit();
    const valuesToAdd: PartialWithFieldValue<ITodo> = values;

    if (dueDate) {
      valuesToAdd.dueDate = Timestamp.fromDate(dueDate.toDate());
    }

    try {
      if (baseTaskBlock) {
        if (!isEqual(baseTaskBlock.assignedTo, assignedUser)) {
          valuesToAdd.assignedTo = assignedUser;
        }

        await baseTaskBlock.update(valuesToAdd);
      } else {
        if (assignedUser) {
          valuesToAdd.assignedTo = assignedUser;
        }

        await addDoc(selectedApp.contentRef, {
          ...valuesToAdd,
          createdAt: serverTimestamp(),
          createdBy: Auth.currentUser?.uid,
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
      onCancel={handleClose}
      confirmLoading={isSubmitting}
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
      <Form<FormDataType>
        form={form}
        onFinish={onFinish}
        disabled={isSubmitting}
        autoComplete="off"
        layout="vertical"
        size="small"
      >
        <Form.Item
          name="name"
          label={t("Title")}
          required
          rules={[
            { required: true, message: "" },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value dont hace tailing or leading spaces
                if (value !== value?.trim()) {
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
        <Form.Item
          name="description"
          label={t("Description")}
          rules={[
            {
              validator: async (_, value) => {
                // Check if value dont hace tailing or leading spaces
                if (value !== value?.trim()) {
                  return Promise.reject(
                    new Error(t("Cannot have leading or trailing spaces"))
                  );
                }
              },
            },
            {
              max: 255,
              message: t("Max 255 characters"),
            },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
          ]}
        >
          <Input.TextArea maxLength={255} showCount rows={3} />
        </Form.Item>
        <Form.Item label={t("Assigned to")}>
          {isEmpty(assignedUser) ? (
            <div>
              <Button
                block
                type="dashed"
                onClick={openAssignUser}
                css={{ marginBottom: "20px" }}
              >
                {t("Assign")}
              </Button>

              <AssignUser
                open={assignUserOpen}
                onCancel={closeAssignUser}
                onSelectedEmployee={(emp) => {
                  assignUser({
                    id: emp.id,
                    name: emp.fullName,
                    email: emp.email,
                  });
                  closeAssignUser();
                }}
              />
            </div>
          ) : (
            <List.Item
              extra={
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  type="link"
                  shape="circle"
                  onClick={() => assignUser(null)}
                />
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={assignedUser.name}
                description={assignedUser.email}
              />
            </List.Item>
          )}
        </Form.Item>
        <Form.Item name="dueDate" label={t("Due Date")}>
          <DatePicker showTime />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default ManageTaskBlock;
