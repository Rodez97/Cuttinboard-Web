/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Avatar,
  Divider,
  List,
  Modal,
  ModalProps,
  Switch,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  MailOutlined,
  MobileOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  CuttinboardUser,
  Employee,
} from "@cuttinboard-solutions/cuttinboard-library/models";

type DMDetailsProps = {
  employee: Employee | CuttinboardUser;
} & ModalProps;

function DMDetails({ employee, ...props }: DMDetailsProps) {
  const { t } = useTranslation();
  const { selectedChat } = useDMs();

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
            checked={selectedChat.isMuted}
            onChange={() => {
              selectedChat.toggleMuteChat();
            }}
          />
        }
      >
        <List.Item.Meta
          avatar={<NotificationOutlined />}
          title={t("Mute push notifications")}
        />
      </List.Item>
    </Modal>
  );
}

export default DMDetails;
