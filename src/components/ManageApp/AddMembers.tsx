/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Checkbox, List, Modal, ModalProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/services";
import { UsergroupAddOutlined } from "@ant-design/icons";

type AddMembersProps = {
  onSelectedEmployees: (employees: Employee[]) => void;
  initialSelected?: Employee[];
  admins?: string[];
  onClose: () => void;
} & ModalProps;

function AddMembers({
  onSelectedEmployees,
  initialSelected,
  admins,
  onClose,
  ...props
}: AddMembersProps) {
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const handleToggle = (value: Employee) => () => {
    const currentIndex = selectedEmployees.indexOf(value);
    const newChecked = [...selectedEmployees];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedEmployees(newChecked);
  };

  const handleAccept = () => {
    if (selectedEmployees.length > 0) {
      onSelectedEmployees(selectedEmployees);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedEmployees(initialSelected);
    onClose();
  };

  return (
    <Modal
      {...props}
      title={t("Add Members")}
      footer={[
        <Button type="dashed" onClick={handleClose} key="cancel">
          {t("Cancel")}
        </Button>,
        <Button
          icon={<UsergroupAddOutlined />}
          type="primary"
          onClick={handleAccept}
          key="add"
        >
          {t("Add Member(s)")}
        </Button>,
      ]}
    >
      <List
        dataSource={getEmployees.filter(
          (emp) =>
            !admins?.includes(emp.id) &&
            !initialSelected?.some((e) => e.id === emp.id)
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
                <Checkbox
                  onChange={handleToggle(emp)}
                  checked={selectedEmployees?.includes(emp)}
                />
              }
            >
              <List.Item.Meta
                avatar={<QuickUserDialogAvatar employee={emp} />}
                title={emp.fullName}
                description={emp.email}
              />
            </List.Item>
          );
        }}
      />
    </Modal>
  );
}

export default AddMembers;
