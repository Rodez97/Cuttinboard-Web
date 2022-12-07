/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Alert,
  Avatar,
  Divider,
  List,
  Modal,
  ModalProps,
  Switch,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import {
  MailOutlined,
  MobileOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React from "react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/account";
import { useDirectMessageChat } from "@cuttinboard-solutions/cuttinboard-library/chats";

type DMDetailsProps = {
  employee: Employee | CuttinboardUser | undefined;
} & ModalProps;

export default ({ employee, ...props }: DMDetailsProps) => {
  const { t } = useTranslation();
  const { selectedDirectMessageChat } = useDirectMessageChat();

  if (!selectedDirectMessageChat) {
    return null;
  }

  return (
    <Modal {...props} title={t("Details")} footer={null}>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Avatar icon={<UserOutlined />} size={70} src={employee?.avatar} />
        <Typography.Text type="secondary">{employee?.name}</Typography.Text>
      </div>
      <Divider orientation="left">{t("About")}</Divider>

      {employee ? (
        <React.Fragment>
          <List.Item>
            <List.Item.Meta
              avatar={<UserOutlined />}
              title={t("Full Name")}
              description={`${employee.name} ${employee.lastName}`}
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={<MailOutlined />}
              title={t("Email")}
              description={employee.email}
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={<MobileOutlined />}
              title={t("Phone Number")}
              description={employee.phoneNumber ?? "---"}
            />
          </List.Item>
          <Divider />
          <List.Item
            extra={
              <Switch
                checked={selectedDirectMessageChat.isMuted}
                onChange={() => {
                  selectedDirectMessageChat.toggleMuteChat();
                }}
              />
            }
          >
            <List.Item.Meta
              avatar={<NotificationOutlined />}
              title={t("Mute push notifications")}
            />
          </List.Item>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Alert message={t("This employee has been removed")} type="warning" />
        </React.Fragment>
      )}
    </Modal>
  );
};
