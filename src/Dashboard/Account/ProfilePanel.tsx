/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { Storage } from "@cuttinboard/cuttinboard-library/firebase";
import {
  useCuttinboard,
  useCuttinboardAuth,
} from "@cuttinboard/cuttinboard-library/services";
import { Button, Card, DatePicker, Form, Input, message, Space } from "antd";
import dayjs from "dayjs";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EditableAvatar from "../../components/EditableAvatar";
import { recordError } from "../../utils/utils";
import { useDashboard } from "../DashboardProvider";

function ProfilePanel() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const { user } = useCuttinboard();
  const { updateUserProfile } = useCuttinboardAuth();
  const { userDocument } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    const { avatar, birthDate, ...others } = values;
    setIsSubmitting(true);
    try {
      let photoURL: string = user.photoURL;
      if (avatar.file) {
        const profilePictureRef = ref(Storage, `users/${user.uid}/avatar`);
        const uploadTask = await uploadBytes(profilePictureRef, avatar.file);
        photoURL = await getDownloadURL(uploadTask.ref);
      }
      await updateUserProfile({
        ...others,
        avatar: photoURL,
        birthDate: birthDate?.toDate(),
      });
      await user.getIdToken(true);
      setEditing(false);
      message.success(t("Changes saved"));
    } catch (error) {
      recordError(error);
    }
    setIsSubmitting(false);
  };

  return (
    <Space
      direction="vertical"
      css={{ maxWidth: 500, minWidth: 300, width: "100%", marginBottom: 3 }}
    >
      <Card title={t("Profile")}>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            name: userDocument.name,
            lastName: userDocument.lastName,
            email: userDocument.email,
            birthDate: dayjs(userDocument.birthDate?.toDate()),
            avatar: user.photoURL,
          }}
          disabled={!editing || isSubmitting}
          onFinish={onFinish}
        >
          <Form.Item
            name="avatar"
            css={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <EditableAvatar
              defaultValue={user.photoURL}
              size={100}
              align="center"
              value={form.getFieldValue("avatar")}
              onImageEdited={(avatar) => form.setFieldValue("avatar", avatar)}
              disabled={!editing || isSubmitting}
            />
          </Form.Item>
          <Form.Item
            label={t("Name")}
            name="name"
            rules={[{ required: true, message: "" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t("Last Name")}
            name="lastName"
            rules={[{ required: true, message: "" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t("Email")}
            name="email"
            rules={[{ required: true, message: "" }, { type: "email" }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label={t("Date of Birth")}
            rules={[{ type: "date" }]}
            name="birthDate"
          >
            <DatePicker />
          </Form.Item>
        </Form>
        <Space
          css={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {editing && (
            <Button onClick={cancelEditing} disabled={isSubmitting}>
              {t("Cancel")}
            </Button>
          )}
          {editing ? (
            <Button
              icon={<SaveFilled />}
              loading={isSubmitting}
              onClick={form.submit}
              type="primary"
            >
              {t("Save")}
            </Button>
          ) : (
            <Button
              icon={<EditFilled />}
              loading={isSubmitting}
              onClick={() => setEditing(true)}
              type="link"
              disabled={false}
            >
              {t("Edit")}
            </Button>
          )}
        </Space>
      </Card>
    </Space>
  );
}

export default ProfilePanel;
