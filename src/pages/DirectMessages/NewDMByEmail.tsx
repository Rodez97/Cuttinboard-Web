/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  List,
  message,
  Spin,
  Typography,
} from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { recordError } from "utils/utils";
import { GrayPageHeader } from "components/PageHeaders";
import {
  CuttinboardUser,
  CuttinboardUserConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useDashboard } from "Dashboard/DashboardProvider";
import { intersection } from "lodash";

function NewDMByEmail() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { startNewDMByEmail, chats } = useDMs();
  const [loading, setLoading] = useState(false);
  const { userDocument } = useDashboard();
  const [targetUser, setTargetUser] = useState<CuttinboardUser>(null);

  const searchUser = async (email: string) => {
    setLoading(true);
    try {
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
        return setLoading(false);
      }
      const recipient = recipientSnap.docs[0].data();
      if (
        intersection(userDocument.organizations, recipient.organizations).length
      ) {
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
    setLoading(false);
  };

  const createChat = async () => {
    if (!targetUser) {
      return;
    }
    setLoading(true);
    try {
      const newId = await startNewDMByEmail(targetUser);
      navigate(pathname.replace("new", newId));
    } catch (error) {
      recordError(error);
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <GrayPageHeader title={t("Start a Chat")} onBack={() => navigate(-1)} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{ minWidth: 270, maxWidth: 500, margin: "auto", width: "100%" }}
        >
          <Form layout="vertical">
            <Form.Item
              name="email"
              label={t("Start a chat with someone in your organizations")}
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
          <Typography>{t("Eligible Users:")}</Typography>
          {targetUser ? (
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
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </Spin>
  );
}

export default NewDMByEmail;
