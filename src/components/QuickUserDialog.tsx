/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  InfoCircleOutlined,
  MailOutlined,
  MobileOutlined,
  PhoneOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library";
import { Avatar, Button, List, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { getAvatarByUID } from "utils/utils";

interface QuickUserDialogProps {
  employee: Employee;
}

function UserInfoElement({ employee }: QuickUserDialogProps) {
  const { t } = useTranslation();

  return (
    <List>
      <List.Item css={{ justifyContent: "center" }}>
        <Avatar
          src={employee.getAvatar}
          size={60}
          alt={employee.name}
          icon={<UserOutlined />}
        />
      </List.Item>

      <List.Item>
        <List.Item.Meta
          title={t("Name")}
          description={employee.fullName}
          avatar={<InfoCircleOutlined />}
        />
      </List.Item>

      <List.Item
        extra={
          <Button
            icon={<SendOutlined />}
            type="link"
            href={`mailto:${employee.email}`}
          />
        }
      >
        <List.Item.Meta
          title={t("Email")}
          description={employee.email}
          avatar={<MailOutlined />}
        />
      </List.Item>

      <List.Item
        extra={
          <Button
            icon={<PhoneOutlined />}
            type="link"
            href={employee.phoneNumber && `tel:${employee.phoneNumber}`}
          />
        }
      >
        <List.Item.Meta
          title={t("Phone Number")}
          description={employee.phoneNumber ?? "---"}
          avatar={<MobileOutlined />}
        />
      </List.Item>
    </List>
  );
}

export function QuickUserDialogAvatar({
  employee,
  size,
}: {
  employee: Employee;
  size?: number;
}) {
  const { t } = useTranslation();
  const handleOpen = () => {
    Modal.info({
      title: t("User Info"),
      content: <UserInfoElement employee={employee} />,
    });
  };
  return (
    <Avatar
      size={size}
      src={employee.getAvatar}
      onClick={handleOpen}
      css={{ cursor: "pointer" }}
      icon={<UserOutlined />}
    />
  );
}

export default UserInfoElement;
