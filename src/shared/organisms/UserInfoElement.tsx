/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  InfoCircleOutlined,
  MailOutlined,
  MobileOutlined,
  PhoneOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, List } from "antd";
import { useTranslation } from "react-i18next";
import CuttinboardAvatar from "../atoms/Avatar";
import {
  ICuttinboardUser,
  getEmployeeFullName,
} from "@cuttinboard-solutions/types-helpers";

function UserInfoElement({ employee }: { employee: ICuttinboardUser }) {
  const { t } = useTranslation();

  return (
    <List css={{ width: "100%" }}>
      <List.Item css={{ justifyContent: "center !important" }}>
        <CuttinboardAvatar
          src={employee.avatar}
          size={60}
          alt={getEmployeeFullName(employee)}
        />
      </List.Item>

      <List.Item>
        <List.Item.Meta
          title={t("Name")}
          description={`${employee.name} ${employee.lastName}`}
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
