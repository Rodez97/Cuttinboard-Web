/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Avatar, Button, Form, Input, List, message, Typography } from "antd";
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
import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/models";
import { getAvatarByUID, recordError } from "../../utils/utils";
import { intersection } from "lodash";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";
import { useParams } from "react-router-dom";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { useDashboard } from "../../Dashboard/DashboardProvider";

function NewDMByEmail({
  onCreatingChange,
  onClose,
}: {
  onCreatingChange: (status: boolean) => void;
  onClose: () => void;
}) {
  const { locationId } = useParams();
  const { t } = useTranslation();
  const [targetUser, setTargetUser] = useState<CuttinboardUser>(null);
  const { userDocument } = !locationId && useDashboard();
  const { startNewDMByEmail } = useDMs();

  const searchUser = async (email: string) => {
    onCreatingChange(true);
    let senderOrganizations: string[] = [];
    try {
      if (locationId) {
        const senderSnap = await getDoc<CuttinboardUser>(
          doc(Firestore, "Users", Auth.currentUser.uid).withConverter(
            CuttinboardUser.Converter
          )
        );

        if (!senderSnap.exists()) {
          message.warn(
            t("There was a problem while fetching your user profile.")
          );
          setTargetUser(null);
          return onCreatingChange(false);
        }

        senderOrganizations = senderSnap.data().organizations;
      } else {
        senderOrganizations = userDocument.organizations;
      }

      const recipientSnap = await getDocs<CuttinboardUser>(
        query(
          collection(Firestore, "Users"),
          where("email", "==", email)
        ).withConverter(CuttinboardUser.Converter)
      );
      if (recipientSnap.size !== 1) {
        message.warn(
          t("There is no eligible user associated with this email.")
        );
        setTargetUser(null);
        return onCreatingChange(false);
      }
      const recipient = recipientSnap.docs[0].data();
      if (intersection(senderOrganizations, recipient.organizations).length) {
        setTargetUser(recipient);
      } else {
        message.warn(
          t("There is no eligible user associated with this email.")
        );
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
      await startNewDMByEmail(targetUser);
      onClose();
    } catch (error) {
      recordError(error);
    } finally {
      onCreatingChange(false);
    }
  };

  return (
    <div>
      <Form layout="vertical" autoComplete="off">
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
                if (value && value === Auth.currentUser.email) {
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
            onSearch={searchUser}
            placeholder={t("Type an email")}
          />
        </Form.Item>
      </Form>

      {targetUser && (
        <React.Fragment>
          <Typography>{t("Eligible User:")}</Typography>
          <List.Item
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={createChat}
              />
            }
            css={{ backgroundColor: "#F7F7F7", padding: 10 }}
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={<UserOutlined />} src={targetUser.avatar} />
              }
              title={`${targetUser.name} ${targetUser.lastName}`}
              description={targetUser.email}
            />
          </List.Item>
        </React.Fragment>
      )}
    </div>
  );
}

export default NewDMByEmail;
