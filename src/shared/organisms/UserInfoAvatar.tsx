/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Modal } from "antd/es";
import { useTranslation } from "react-i18next";
import UserInfoElement from "./UserInfoElement";
import CuttinboardAvatar from "../atoms/Avatar";
import { ICuttinboardUser, getEmployeeFullName } from "@rodez97/types-helpers";

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
      size={size ?? 30}
      src={employee.avatar}
      alt={getEmployeeFullName(employee)}
      onClick={handleOpen}
      css={{ cursor: "pointer" }}
    />
  );
}

export default UserInfoAvatar;
