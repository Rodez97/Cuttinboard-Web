/** @jsx jsx */
import { jsx } from "@emotion/react";
import { UserOutlined } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library";
import { Avatar, Descriptions, Modal } from "antd";
import { useTranslation } from "react-i18next";

interface QuickUserDialogProps {
  employee: Employee;
}

function UserInfoElement({ employee }: QuickUserDialogProps) {
  const { t } = useTranslation();

  return (
    <Descriptions
      bordered
      layout="vertical"
      column={1}
      size="small"
      labelStyle={{ fontWeight: "bold" }}
    >
      <Descriptions.Item
        css={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Avatar src={employee.avatar} size="large" alt={employee.name} />
      </Descriptions.Item>

      <Descriptions.Item label={t("Name")}>{employee.name}</Descriptions.Item>
      <Descriptions.Item label={t("Last Name")}>
        {employee.lastName}
      </Descriptions.Item>
      <Descriptions.Item label={t("Email")}>
        <a href={`mailto:${employee.email}`}>{employee.email}</a>
      </Descriptions.Item>
      {employee.phoneNumber && (
        <Descriptions.Item label={t("Phone Number")}>
          <a href={`tel:${employee.phoneNumber}`}>{employee.phoneNumber}</a>
        </Descriptions.Item>
      )}
    </Descriptions>
  );
}

export function QuickUserDialogAvatar({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  const handleOpen = () => {
    Modal.info({
      title: t("User Info"),
      content: <UserInfoElement employee={employee} />,
    });
  };
  return (
    <Avatar
      src={employee.avatar}
      onClick={handleOpen}
      css={{ cursor: "pointer" }}
      icon={<UserOutlined />}
    />
  );
}

export default UserInfoElement;
