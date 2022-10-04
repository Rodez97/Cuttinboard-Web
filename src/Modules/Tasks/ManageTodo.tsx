/** @jsx jsx */
import { jsx } from "@emotion/react";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { useRef, useState } from "react";
import QuickTodo, { QuickTodoRef } from "../../components/QuickTodo";
import { useTranslation } from "react-i18next";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Todo,
  Todo_Task,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import AssignUser from "./AssignUser";
import { getAvatarByUID, recordError } from "../../utils/utils";
import { Avatar, Button, DatePicker, Form, Input, List } from "antd";
import { GrayPageHeader } from "../../components/PageHeaders";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import { Timestamp } from "firebase/firestore";

export interface ManageTodoProps {
  todos: Todo[];
  title: string;
}

type FormDataType = {
  name: string;
  description?: string;
  dueDate: moment.Moment;
  tasks?: Record<string, Todo_Task>;
  assignedTo?: { id: string; name: string; email: string };
};

const ManageTodo = ({ todos, title }: ManageTodoProps) => {
  const { todoId } = useParams();
  const [form] = Form.useForm<FormDataType>();
  const tasks = Form.useWatch("tasks", form);
  const assignedTo = Form.useWatch("assignedTo", form);
  const [selectedTodo] = useState(() => {
    if (!todoId) {
      return null;
    }
    return todos.find((td) => td.id === todoId);
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const quickTodoRef = useRef<QuickTodoRef>(null);
  const { moduleContentRef } = useCuttinboardModule();
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    form.resetFields();
    navigate(-1);
  };

  const handleClearEmployee = () => {
    form.setFieldValue("assignedTo", null);
  };

  const onFinish = async ({ dueDate, ...values }: FormDataType) => {
    setSubmitting(true);
    quickTodoRef.current?.addTask();
    const valuesToAdd: Partial<Todo> = values;
    if (dueDate) {
      valuesToAdd.dueDate = Timestamp.fromDate(dueDate.toDate());
    }
    try {
      if (selectedTodo) {
        await selectedTodo.update(valuesToAdd);
      } else {
        await addDoc(moduleContentRef, {
          ...valuesToAdd,
          createdAt: serverTimestamp(),
          createdBy: Auth.currentUser?.uid,
        });
      }
      setSubmitting(false);
      handleClose();
    } catch (error) {
      recordError(error);
      setSubmitting(false);
    }
  };

  return (
    <Form<FormDataType>
      form={form}
      onFinish={onFinish}
      initialValues={{
        ...selectedTodo,
        dueDate:
          selectedTodo?.dueDate && moment(selectedTodo.dueDate?.toDate()),
      }}
      disabled={submitting}
    >
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <div>
                <GrayPageHeader onBack={() => navigate(-1)} title={t(title)} />
                <div
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 20,
                  }}
                >
                  <div
                    css={{
                      minWidth: 300,
                      maxWidth: 400,
                      margin: "auto",
                      width: "100%",
                    }}
                  >
                    <Form.Item
                      name="name"
                      required
                      rules={[{ required: true, message: "" }]}
                    >
                      <Input
                        placeholder={t("Title")}
                        maxLength={80}
                        showCount
                      />
                    </Form.Item>
                    <Form.Item name="description">
                      <Input.TextArea
                        placeholder={t("Description")}
                        maxLength={255}
                        showCount
                        rows={3}
                      />
                    </Form.Item>
                    <Form.Item name="assignedTo">
                      {assignedTo ? (
                        <List.Item
                          extra={
                            <Button
                              icon={<DeleteOutlined />}
                              danger
                              type="link"
                              shape="circle"
                              disabled={submitting}
                              onClick={handleClearEmployee}
                            />
                          }
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={<UserOutlined />}
                                src={getAvatarByUID(assignedTo.id)}
                              />
                            }
                            title={assignedTo?.name}
                            description={assignedTo.email}
                          />
                        </List.Item>
                      ) : (
                        <Button
                          block
                          type="dashed"
                          onClick={() => navigate("assign")}
                          css={{ marginBottom: "20px" }}
                          disabled={submitting}
                        >
                          {t("Assign")}
                        </Button>
                      )}
                    </Form.Item>
                    <Form.Item name="dueDate">
                      <DatePicker showTime placeholder={t("Due Date")} />
                    </Form.Item>
                    <Form.Item name="tasks">
                      <QuickTodo
                        tasks={tasks ?? {}}
                        onChange={(tasks) => form.setFieldValue("tasks", tasks)}
                        ref={quickTodoRef}
                      />
                    </Form.Item>

                    <Button
                      htmlType="submit"
                      block
                      type="primary"
                      loading={submitting}
                      css={{ margin: "20px 0px" }}
                    >
                      {t("Accept")}
                    </Button>

                    <Button
                      onClick={handleClose}
                      danger
                      block
                      type="dashed"
                      disabled={submitting}
                    >
                      {t("Cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="assign"
            element={
              <AssignUser
                onSelectedEmployee={({ id, name, lastName, email }) => {
                  console.log({ id, name, lastName, email });

                  form.setFieldValue("assignedTo", {
                    id,
                    name: `${name} ${lastName}`,
                    email,
                  });
                  console.log(form.getFieldsValue());
                }}
              />
            }
          />
        </Route>
      </Routes>
    </Form>
  );
};

export default ManageTodo;
