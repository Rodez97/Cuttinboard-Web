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
import { Avatar, Button, List } from "antd";
import { useTranslation } from "react-i18next";

function UserInfoElement({ employee }: { employee: Employee }) {
  const { t } = useTranslation();

  return (
    <List css={{ width: "100%" }}>
      <List.Item css={{ justifyContent: "center !important" }}>
        <Avatar
          src={employee.avatar}
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

export default UserInfoElement;
