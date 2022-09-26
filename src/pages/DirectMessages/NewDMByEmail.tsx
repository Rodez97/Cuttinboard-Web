/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
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
import {
  collection,
  DocumentData,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { recordError } from "utils/utils";
import { GrayPageHeader } from "components/PageHeaders";

function NewDMByEmail() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { startNewDMByEmail, chats } = useDMs();
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] =
    useState<QueryDocumentSnapshot<DocumentData>>(null);

  const searchUser = async (email: string) => {
    setLoading(true);
    try {
      const userSnap = await getDocs(
        query(collection(Firestore, "Users"), where("email", "==", email))
      );
      if (userSnap.size !== 1) {
        message.warn(
          t("There is no eligible user associated with this email.")
        );
        setTargetUser(null);
      } else {
        setTargetUser(userSnap.docs[0]);
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
              rules={[{ type: "email", message: t("Must be a valid email") }]}
            >
              <Input.Search onSearch={searchUser} />
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
                  <Avatar
                    icon={<UserOutlined />}
                    src={targetUser.get("avatar")}
                  />
                }
                title={`${targetUser.get("name")} ${targetUser.get(
                  "lastName"
                )}`}
                description={targetUser.get("email")}
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
