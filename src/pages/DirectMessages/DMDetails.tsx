/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Avatar, Divider, List, Spin, Switch, Typography } from "antd";
import { GrayPageHeader } from "components/PageHeaders";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import PageError from "components/PageError";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  MailOutlined,
  MobileOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";

function DMDetails({
  userId,
  employee,
}: {
  employee?: Employee;
  userId: string;
}) {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const { t } = useTranslation();
  const { toggleChatMute, selectedChat } = useDMs();
  const [user, loading, error] = useDocumentData(
    !employee && doc(Firestore, "Users", userId)
  );

  const data = useMemo(() => {
    if (employee) {
      return employee;
    } else {
      return user;
    }
  }, [user, locationId, userId, employee]);
  return (
    <Spin spinning={loading}>
      <GrayPageHeader title={t("Details")} onBack={() => navigate(-1)} />
      {error ? (
        <PageError error={error} />
      ) : (
        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <div
            css={{
              minWidth: 270,
              maxWidth: 400,
              margin: "auto",
              width: "100%",
            }}
          >
            <div
              css={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Avatar icon={<UserOutlined />} size={70} src={data?.avatar} />
              <Typography.Text type="secondary">{data?.name}</Typography.Text>
            </div>
            <Divider orientation="left">{t("About")}</Divider>
            <List.Item>
              <List.Item.Meta
                avatar={<UserOutlined />}
                title={t("Full Name")}
                description={`${data?.name} ${data?.lastName}`}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<MailOutlined />}
                title={t("Email")}
                description={data?.email}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<MobileOutlined />}
                title={t("Phone Number")}
                description={data?.phoneNumber ?? "---"}
              />
            </List.Item>
            <Divider />
            <List.Item
              extra={
                <Switch
                  checked={selectedChat.muted?.includes(Auth.currentUser.uid)}
                  onChange={toggleChatMute}
                />
              }
            >
              <List.Item.Meta
                avatar={<NotificationOutlined />}
                title={t("Mute push notifications")}
              />
            </List.Item>
          </div>
        </div>
      )}
    </Spin>
  );
}

export default DMDetails;
