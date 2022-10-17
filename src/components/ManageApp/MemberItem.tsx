/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteFilled } from "@ant-design/icons";
import {
  useCuttinboard,
  Employee,
  PrivacyLevel,
  useLocation,
  Colors,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, List } from "antd";
import { useMemo } from "react";
import { QuickUserDialogAvatar } from "../QuickUserDialog";

interface IMemberItem {
  employee: Employee;
  onRemove: (employeeId: string) => void;
  readonly?: boolean;
  hosts?: string[];
  privacyLevel: PrivacyLevel;
}

function MemberItem({
  employee,
  onRemove,
  hosts,
  readonly,
  privacyLevel,
}: IMemberItem) {
  const { user } = useCuttinboard();
  const { isGeneralManager, isOwner, isAdmin } = useLocation();

  const haveSecondaryAction = useMemo(() => {
    if (readonly) {
      return false;
    }
    if (isGeneralManager || isOwner || isAdmin) {
      return true;
    }
    if (hosts?.includes(employee.id) && employee.id === user.uid) {
      return false;
    }

    return privacyLevel === PrivacyLevel.PRIVATE && hosts?.includes(user.uid);
  }, [
    readonly,
    isGeneralManager,
    isOwner,
    employee.id,
    hosts,
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
