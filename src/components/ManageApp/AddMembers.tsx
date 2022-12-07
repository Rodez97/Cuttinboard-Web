/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Checkbox, Input, List, Modal, ModalProps } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { UsergroupAddOutlined } from "@ant-design/icons";
import {
  Employee,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/employee";

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
  const [searchText, setSearchText] = useState("");
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
    setSelectedEmployees(initialSelected ?? []);
    onClose();
  };

  const employees = useMemo(() => {
    const filtered = getEmployees.filter((emp) => {
      if (
        admins?.includes(emp.id) ||
        initialSelected?.some((e) => e.id === emp.id)
      ) {
        return false;
      }
      return emp.name.toLowerCase().includes(searchText.toLowerCase());
    });
    return filtered;
  }, [getEmployees, searchText, admins, initialSelected]);

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
      <Input.Search
        placeholder={t("Search")}
        allowClear
        onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
        value={searchText}
        css={{ width: 200, marginBottom: 10 }}
      />
      <List
        css={{ maxHeight: "50vh", overflowY: "auto" }}
        dataSource={employees}
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
