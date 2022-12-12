/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Form, Input, message, Typography } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { recordError } from "../../utils/utils";
import { intersection } from "lodash";
import { useParams } from "react-router-dom";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { useDashboard } from "../../Dashboard/DashboardProvider";
import { GrayPageHeader } from "../../shared";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/account";
import { useDirectMessageChat } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";

export default ({
  onCreatingChange,
  onClose,
}: {
  onCreatingChange: (status: boolean) => void;
  onClose: () => void;
}) => {
  const [form] = Form.useForm<{ email: string }>();
  const { locationId } = useParams();
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const [targetUser, setTargetUser] = useState<CuttinboardUser | null>(null);
  const dashboardContext = !locationId && useDashboard();
  const { startNewDirectMessageChat } = useDirectMessageChat();
  const [messageApi, contextHolder] = message.useMessage();

  const searchUser = async ({ email }: { email: string }) => {
    onCreatingChange(true);
    let senderOrganizations: string[] = [];
    try {
      if (locationId) {
        const senderSnap = await getDoc<CuttinboardUser>(
          doc(FIRESTORE, "Users", user.uid).withConverter(
            CuttinboardUser.firestoreConverter
          )
        );

        if (!senderSnap.exists()) {
          messageApi.open({
            type: "warning",
            content: t("There was a problem while fetching your user profile."),
          });
          setTargetUser(null);
          return onCreatingChange(false);
        }

        senderOrganizations = senderSnap.data().organizations ?? [];
      } else if (dashboardContext) {
        senderOrganizations = dashboardContext.userDocument.organizations ?? [];
      }

      const recipientSnap = await getDocs<CuttinboardUser>(
        query(
          collection(FIRESTORE, "Users"),
          where("email", "==", email)
        ).withConverter(CuttinboardUser.firestoreConverter)
      );
      if (recipientSnap.size !== 1) {
        messageApi.open({
          type: "warning",
          content: t("There is no eligible user associated with this email."),
        });
        setTargetUser(null);
        return onCreatingChange(false);
      }
      const recipient = recipientSnap.docs[0].data();
      if (intersection(senderOrganizations, recipient.organizations).length) {
        setTargetUser(recipient);
      } else {
        messageApi.open({
          type: "warning",
          content: t("There is no eligible user associated with this email."),
        });
        setTargetUser(null);
      }
    } catch (error) {
      recordError(error);
    }
    onCreatingChange(false);
  };

  const createChat = async () => {
    if (!targetUser) {
      return;
    }

    try {
      onCreatingChange(true);
      await startNewDirectMessageChat(targetUser);
      onClose();
    } catch (error) {
      recordError(error);
    } finally {
      onCreatingChange(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <Form
        layout="vertical"
        autoComplete="off"
        form={form}
        onFinish={searchUser}
      >
        <Form.Item
          name="email"
          normalize={(value: string) => value?.toLowerCase()}
          label={
            <Typography.Text type="secondary" css={{ fontSize: 18 }}>
              {t("Start a chat with someone in your organizations")}
            </Typography.Text>
          }
          rules={[
            { type: "email", message: t("Must be a valid email") },
            {
              validator(_, value) {
                if (value && value === user.email?.toLowerCase()) {
                  return Promise.reject(
                    new Error(t("You cannot enter your own email"))
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Search
            onSearch={() => form.submit()}
            placeholder={t("Type an email")}
          />
        </Form.Item>
      </Form>

      {targetUser && (
        <React.Fragment>
          <Typography>{t("Eligible User:")}</Typography>
          <GrayPageHeader
            avatar={{ src: targetUser.avatar, icon: <UserOutlined /> }}
            title={`${targetUser.name} ${targetUser.lastName}`}
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={createChat}
              />
            }
            footer={targetUser.email}
          />
        </React.Fragment>
      )}
    </div>
  );
};
