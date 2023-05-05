/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteFilled } from "@ant-design/icons";
import { Button, List } from "antd";
import { useMemo } from "react";
import {
  useCuttinboard,
  useCuttinboardLocation,
  Colors,
} from "@cuttinboard-solutions/cuttinboard-library";
import UserInfoAvatar from "../organisms/UserInfoAvatar";
import {
  getEmployeeFullName,
  IEmployee,
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

type BoardMemberItemProps = {
  employee: IEmployee;
  onRemove: (employee: IEmployee) => void;
  readonly?: boolean;
  admins?: string[];
  privacyLevel: PrivacyLevel;
};

function BoardMemberItem({
  employee,
  onRemove,
  admins,
  readonly,
  privacyLevel,
}: BoardMemberItemProps) {
  const { user } = useCuttinboard();
  const { role } = useCuttinboardLocation();

  const canRemoveBoardMember = useMemo(() => {
    // If the board member is read-only, the user cannot remove them
    if (readonly) {
      return false;
    }

    // If the user is a general manager, owner, or admin, they can remove the board member
    if (role <= RoleAccessLevels.GENERAL_MANAGER) {
      return true;
    }

    // If the board member is an admin and is the current user, they cannot remove themselves
    if (admins?.includes(employee.id) && employee.id === user.uid) {
      return false;
    }

    if (privacyLevel === PrivacyLevel.PRIVATE && admins?.includes(user.uid)) {
      return true;
    }

    // If the privacy level is private and the current user is an admin, they can remove the board member
    return false;
  }, [readonly, role, admins, employee.id, user.uid, privacyLevel]);

  return (
    <List.Item
      css={{
        backgroundColor: Colors.MainOnWhite,
        padding: "10px !important",
        margin: 5,
      }}
      actions={
        canRemoveBoardMember
          ? [
              <Button
                key="remove"
                onClick={() => onRemove(employee)}
                danger
                icon={<DeleteFilled />}
                type="link"
                shape="circle"
              />,
            ]
          : undefined
      }
    >
      <List.Item.Meta
        avatar={<UserInfoAvatar employee={employee} />}
        title={getEmployeeFullName(employee)}
        description={employee.email}
      />
    </List.Item>
  );
}

export default BoardMemberItem;
