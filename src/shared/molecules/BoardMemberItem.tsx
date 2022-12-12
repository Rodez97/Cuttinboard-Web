/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteFilled } from "@ant-design/icons";
import { Button, List } from "antd";
import { useMemo } from "react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  Colors,
  PrivacyLevel,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import UserInfoAvatar from "../organisms/UserInfoAvatar";

type BoardMemberItemProps = {
  employee: Employee;
  onRemove: (employee: Employee) => void;
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
  const { isGeneralManager, isOwner, isAdmin } = useCuttinboardLocation();

  const canRemoveBoardMember = useMemo(() => {
    // If the board member is read-only, the user cannot remove them
    if (readonly) {
      return false;
    }

    // If the user is a general manager, owner, or admin, they can remove the board member
    if (isGeneralManager || isOwner || isAdmin) {
      return true;
    }

    // If the board member is an admin and is the current user, they cannot remove themselves
    if (admins?.includes(employee.id) && employee.id === user.uid) {
      return false;
    }

    // If the privacy level is private and the current user is an admin, they can remove the board member
    return privacyLevel === PrivacyLevel.PRIVATE && admins?.includes(user.uid);
  }, [
    readonly, // The board member's read-only status
    isGeneralManager, // Whether the user is a general manager
    isOwner, // Whether the user is the owner
    employee.id, // The board member's ID
    admins, // The list of admins
    privacyLevel, // The privacy level of the item
    user.uid, // The current user's ID
    isAdmin, // Whether the user is an admin
  ]);

  return (
    <List.Item
      css={{
        backgroundColor: Colors.MainOnWhite,
        padding: 10,
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
        title={employee.fullName}
        description={employee.email}
      />
    </List.Item>
  );
}

export default BoardMemberItem;
