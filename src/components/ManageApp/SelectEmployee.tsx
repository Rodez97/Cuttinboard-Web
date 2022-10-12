/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Colors,
  Employee,
  RoleAccessLevels,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, List } from "antd";
import { useTranslation } from "react-i18next";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { ArrowRightOutlined } from "@ant-design/icons";

interface AddMembersProps {
  onSelectedEmployee: (employee: Employee) => void;
}

function SelectEmployee({ onSelectedEmployee }: AddMembersProps) {
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();

  return (
    <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
      <div
        css={{
          minWidth: 300,
          maxWidth: 600,
          margin: "auto",
          width: "100%",
        }}
      >
        <List
          dataSource={getEmployees.filter(
            (emp) => emp.locationRole <= RoleAccessLevels.MANAGER
          )}
          renderItem={(emp) => {
            return (
              <List.Item
                key={emp.id}
                css={{
                  backgroundColor: Colors.MainOnWhite,
                  padding: 10,
                  margin: 5,
                }}
                extra={
                  <Button
                    type="link"
                    icon={<ArrowRightOutlined />}
                    onClick={() => onSelectedEmployee(emp)}
                  />
                }
              >
                <List.Item.Meta
                  avatar={<QuickUserDialogAvatar employee={emp} />}
                  title={`${emp.name} ${emp.lastName}`}
                  description={emp.email}
                />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default SelectEmployee;
