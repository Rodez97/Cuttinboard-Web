/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteFilled } from "@ant-design/icons";
import { Button, List } from "antd";
import { useMemo } from "react";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  Colors,
  PrivacyLevel,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";

interface IMemberItem {
  employee: Employee;
  onRemove: (employeeId: string) => void;
  readonly?: boolean;
  admins?: string[];
  privacyLevel: PrivacyLevel;
}

function MemberItem({
  employee,
  onRemove,
  admins,
  readonly,
  privacyLevel,
}: IMemberItem) {
  const { user } = useCuttinboard();
  const { isGeneralManager, isOwner, isAdmin } = useCuttinboardLocation();

  const haveSecondaryAction = useMemo(() => {
    if (readonly) {
      return false;
    }
    if (isGeneralManager || isOwner || isAdmin) {
      return true;
    }
    if (admins?.includes(employee.id) && employee.id === user.uid) {
      return false;
    }

    return privacyLevel === PrivacyLevel.PRIVATE && admins?.includes(user.uid);
  }, [
    readonly,
    isGeneralManager,
    isOwner,
    employee.id,
    admins,
    privacyLevel,
    user.uid,
    isAdmin,
  ]);

  return (
    <List.Item
      css={{
        backgroundColor: Colors.MainOnWhite,
        padding: 10,
        margin: 5,
      }}
      actions={
        haveSecondaryAction
          ? [
              <Button
                key="remove"
                onClick={() => onRemove(employee.id)}
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
        avatar={<QuickUserDialogAvatar employee={employee} />}
        title={`${employee.fullName}`}
        description={employee.email}
      />
    </List.Item>
  );
}

export default MemberItem;
