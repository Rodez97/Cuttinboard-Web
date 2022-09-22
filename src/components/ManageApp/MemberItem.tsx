import { DeleteFilled } from "@ant-design/icons";
import {
  useCuttinboard,
  Employee,
  PrivacyLevel,
  COLORS,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, List } from "antd";
import React, { useMemo } from "react";
import { QuickUserDialogAvatar } from "../QuickUserDialog";

interface IMemberItem {
  employee: Employee;
  onRemove: (employeeId: string) => void;
  readonly?: boolean;
  hostId?: string;
  privacyLevel: PrivacyLevel;
}

function MemberItem({
  employee,
  onRemove,
  hostId,
  readonly,
  privacyLevel,
}: IMemberItem) {
  const { user } = useCuttinboard();
  const { isGeneralManager, isOwner } = useLocation();

  const haveSecondaryAction = useMemo(() => {
    if (readonly) {
      return false;
    }
    if (isGeneralManager || isOwner) {
      return true;
    }
    if (employee.id === hostId && employee.id === user.uid) {
      return false;
    }

    return privacyLevel === PrivacyLevel.PRIVATE && user.uid === hostId;
  }, [
    readonly,
    isGeneralManager,
    isOwner,
    employee.id,
    hostId,
    privacyLevel,
    user.uid,
  ]);

  return (
    <List.Item
      style={{
        backgroundColor: COLORS.MainOnWhite,
        padding: 5,
        margin: 5,
      }}
      actions={
        haveSecondaryAction && [
          <Button
            onClick={() => onRemove(employee.id)}
            danger
            icon={<DeleteFilled />}
            type="link"
            shape="circle"
          />,
        ]
      }
    >
      <List.Item.Meta
        avatar={<QuickUserDialogAvatar employee={employee} />}
        title={`${employee.name} ${employee.lastName}`}
        description={employee.email}
      />
    </List.Item>
  );
}

export default MemberItem;
