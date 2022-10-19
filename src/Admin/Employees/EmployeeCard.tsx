import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { QuickUserDialogAvatar } from "../../components/QuickUserDialog";
import { useNavigate } from "react-router-dom";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboard,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Colors,
  CompareRoles,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, List, Modal, Space, Tag } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";

interface EmployeeCardProps {
  employee: Employee;
}

function EmployeeCard({ employee }: EmployeeCardProps) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { location, locationAccessKey } = useLocation();
  const navigate = useNavigate();

  const handleRemoveEmployee = async () => {
    Modal.confirm({
      title: t(
        "Are you sure you want to eliminate this user from the location?"
      ),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await employee.delete();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const compareRoles = useMemo(() => {
    return CompareRoles(locationAccessKey.role, employee.locationRole);
  }, [locationAccessKey, employee]);

  const openManageDialog = () => navigate(employee.id);
  return (
    <Space
      direction="vertical"
      style={{
        display: "flex",
        backgroundColor: Colors.MainOnWhite,
        margin: "10px 5px",
        padding: "10px",
      }}
    >
      <List.Item
        actions={
          employee.id !== user?.uid && compareRoles
            ? [
                <Button
                  key="manage"
                  type="text"
                  shape="circle"
                  onClick={openManageDialog}
                  icon={<InfoCircleOutlined />}
                />,
                <Button
                  key="remove"
                  type="text"
                  shape="circle"
                  onClick={handleRemoveEmployee}
                  icon={<DeleteOutlined />}
                  danger
                />,
              ]
            : []
        }
      >
        <List.Item.Meta
          title={`${employee.name} ${employee.lastName} ${
            employee?.role === RoleAccessLevels.OWNER ? "👑" : ""
          }`}
          description={employee.email}
          avatar={<QuickUserDialogAvatar employee={employee} />}
        />
      </List.Item>

      {employee.role === "employee" && employee.positions && (
        <Space wrap>
          {employee.positions.map((pos) => (
            <Tag
              key={pos}
              color="processing"
              icon={
                employee.mainPosition === pos ? (
                  <StarFilled style={{ color: Colors.Yellow.Main }} />
                ) : null
              }
            >
              {pos}
            </Tag>
          ))}
        </Space>
      )}
    </Space>
  );
}

export default EmployeeCard;
