import { addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import QuickTodo, { QuickTodoRef } from "../../components/QuickTodo";
import { useTranslation } from "react-i18next";
import { useCuttinboardModule } from "@cuttinboard/cuttinboard-library/services";
import {
  Employee,
  Todo,
  Todo_Task,
} from "@cuttinboard/cuttinboard-library/models";
import { Auth } from "@cuttinboard/cuttinboard-library/firebase";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import AssignUser from "./AssignUser";
import { recordError } from "../../utils/utils";
import { Avatar, Button, Col, DatePicker, Form, Input, List, Row } from "antd";
import { GrayPageHeader } from "../../components/PageHeaders";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";

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
  const [selectedTodo] = useState(() => {
    if (!todoId) {
      return null;
    }
    return todos.find((td) => td.id === todoId);
  });
  const [assignedTo, setAssignedTo] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(selectedTodo?.assignedTo);
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
    setAssignedTo(null);
  };

  const onFinish = async ({ dueDate, ...values }: FormDataType) => {
    console.log(values);
    setSubmitting(true);
    quickTodoRef.current?.addTask();
    const valuesToAdd: any = values;
    if (assignedTo) {
      valuesToAdd.assignedTo = {
        id: assignedTo.id,
        name: assignedTo.name,
        email: assignedTo.email,
      };
    }
    if (dueDate) {
      valuesToAdd.dueDate = dueDate.toDate();
    }
    try {
      if (selectedTodo) {
        await setDoc(selectedTodo.docRef, valuesToAdd, { merge: true });
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
    <>
      <GrayPageHeader
        className="site-page-header-responsive"
        onBack={() => navigate(-1)}
        title={t(title)}
      />

      <Form<FormDataType>
        onFinish={onFinish}
        form={form}
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
                <Row justify="center">
                  <Col
                    xs={24}
                    md={12}
                    lg={8}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      paddingTop: "10px",
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
                    {assignedTo ? (
                      <List.Item
                        actions={[
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            type="link"
                            shape="circle"
                            disabled={submitting}
                            onClick={handleClearEmployee}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={assignedTo?.name}
                          description={assignedTo.email}
                        />
                      </List.Item>
                    ) : (
                      <Button
                        block
                        type="dashed"
                        onClick={() => navigate("assign")}
                        style={{ marginBottom: "20px" }}
                        disabled={submitting}
                      >
                        {t("Assign")}
                      </Button>
                    )}
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
                      onClick={handleClose}
                      danger
                      block
                      type="dashed"
                      style={{ margin: "20px 0px" }}
                      disabled={submitting}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      htmlType="submit"
                      block
                      type="primary"
                      loading={submitting}
                    >
                      {t("Accept")}
                    </Button>
                  </Col>
                </Row>
              }
            />
            <Route
              path="assign"
              element={
                <AssignUser
                  initialSelected={assignedTo?.id}
                  onSelectedEmployee={setAssignedTo}
                />
              }
            />
          </Route>
        </Routes>
      </Form>
    </>
  );
};

export default ManageTodo;
