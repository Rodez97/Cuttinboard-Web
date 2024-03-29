/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Space } from "antd/es";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { useDashboard } from "../DashboardProvider";
import { EditableAvatar } from "../../shared";
import {
  STORAGE,
  useCuttinboard,
  useUpdateAccount,
} from "@rodez97/cuttinboard-library";
import { nanoid } from "nanoid";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

function ProfilePanel() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const { user } = useCuttinboard();
  const { updateUserProfile, updating } = useUpdateAccount();
  const { userDocument } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      const { avatar, ...others } = values;
      setIsSubmitting(true);
      let photoURL: string = user.photoURL ?? "";
      if (avatar?.file) {
        const fileExt = (avatar.file as File).name.split(".").pop();
        const newFileName = `${user.uid}_${nanoid()}.${fileExt}`;
        const profilePictureRef = ref(
          STORAGE,
          `users/${user.uid}/avatar/${newFileName}`
        );
        const uploadTask = await uploadBytes(profilePictureRef, avatar.file);
        photoURL = await getDownloadURL(uploadTask.ref);
      }
      await updateUserProfile(
        {
          ...others,
          avatar: photoURL,
        },
        null
      );
      await user.getIdToken(true);
      setEditing(false);
      message.success(t("Changes saved"));
      // Get the filled fields
      const usedFields = Object.keys(values).filter((key) => values[key]);
      // Report to analytics
      logAnalyticsEvent("user_profile_updated", {
        usedFields,
      });
    } catch (error) {
      recordError(error);
    } finally {
      setIsSubmitting(false);
    }
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
            avatar: user.photoURL ? { url: user.photoURL } : null,
          }}
          disabled={!editing || isSubmitting || updating}
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
              value={form.getFieldValue("avatar")}
              onImageEdited={(avatar) => form.setFieldValue("avatar", avatar)}
              disabled={!editing || isSubmitting || updating}
            />
          </Form.Item>
          <Form.Item
            label={t("Name")}
            name="name"
            rules={[
              { required: true, message: "" },
              {
                max: 20,
                message: t("Name must be 20 characters or less"),
              },
              {
                whitespace: true,
                message: t("Name cannot be empty"),
              },
              {
                validator: async (_, value) => {
                  // Check if value don't have tailing or leading spaces
                  if (value !== value.trim()) {
                    return Promise.reject(
                      new Error(
                        t("Name cannot have leading or trailing spaces")
                      )
                    );
                  }
                },
              },
            ]}
          >
            <Input maxLength={20} showCount />
          </Form.Item>
          <Form.Item
            label={t("Last Name")}
            name="lastName"
            rules={[
              { required: true, message: "" },
              {
                max: 20,
                message: t("Last Name must be 20 characters or less"),
              },
              {
                whitespace: true,
                message: t("Name cannot be empty"),
              },
              {
                validator: async (_, value) => {
                  // Check if value don't have tailing or leading spaces
                  if (value !== value.trim()) {
                    return Promise.reject(
                      new Error(
                        t("Name cannot have leading or trailing spaces")
                      )
                    );
                  }
                },
              },
            ]}
          >
            <Input maxLength={20} showCount />
          </Form.Item>
          <Form.Item label={t("Email")} name="email">
            <Input disabled />
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
            <Button onClick={cancelEditing} disabled={isSubmitting || updating}>
              {t("Cancel")}
            </Button>
          )}
          {editing ? (
            <Button
              icon={<SaveFilled />}
              loading={isSubmitting || updating}
              onClick={form.submit}
              type="primary"
            >
              {t("Save")}
            </Button>
          ) : (
            <Button
              icon={<EditFilled />}
              loading={isSubmitting || updating}
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
