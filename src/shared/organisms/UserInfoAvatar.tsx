/** @jsx jsx */
import { jsx } from "@emotion/react";
import { UserOutlined } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library";
import { Avatar, Modal } from "antd";
import { useTranslation } from "react-i18next";
import UserInfoElement from "./UserInfoElement";

function UserInfoAvatar({
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
      src={employee?.avatar}
      onClick={handleOpen}
      css={{ cursor: "pointer" }}
      icon={<UserOutlined />}
    />
  );
}

export default UserInfoAvatar;
