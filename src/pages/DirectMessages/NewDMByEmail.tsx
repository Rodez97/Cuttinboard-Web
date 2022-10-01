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
import {
  CuttinboardUser,
  CuttinboardUserConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { getAvatarByUID, recordError } from "utils/utils";
import { useDashboard } from "Dashboard/DashboardProvider";
import { intersection } from "lodash";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";

function NewDMByEmail({
  onCreatingChange,
}: {
  onCreatingChange: (status: boolean) => void;
}) {
  const { locationId } = useParams();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [targetUser, setTargetUser] = useState<CuttinboardUser>(null);
  const { userDocument } = !locationId && useDashboard();
  const { startNewDMByEmail } = useDMs();
  const navigate = useNavigate();

  const searchUser = async (email: string) => {
    onCreatingChange(true);
    let senderOrganizations: string[] = [];
    try {
      if (locationId) {
        const senderSnap = await getDoc<CuttinboardUser>(
          doc(Firestore, "Users", Auth.currentUser.uid).withConverter(
            CuttinboardUserConverter
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
        ).withConverter(CuttinboardUserConverter)
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
    onCreatingChange(true);
    try {
      const newId = await startNewDMByEmail(targetUser);
      navigate(pathname.replace("new", newId));
    } catch (error) {
      recordError(error);
    }
    onCreatingChange(false);
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item
          name="email"
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
                <Avatar
                  icon={<UserOutlined />}
                  src={getAvatarByUID(targetUser.id)}
                />
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
