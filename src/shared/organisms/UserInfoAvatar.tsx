/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import UserInfoElement from "./UserInfoElement";
import CuttinboardAvatar from "../atoms/Avatar";
import { ICuttinboardUser } from "@cuttinboard-solutions/types-helpers";

function UserInfoAvatar({
  employee,
  size,
}: {
  employee: ICuttinboardUser;
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
    <CuttinboardAvatar
      size={size}
      src={employee?.avatar}
      onClick={handleOpen}
      css={{ cursor: "pointer" }}
      userId={employee.id}
    />
  );
}

export default UserInfoAvatar;
