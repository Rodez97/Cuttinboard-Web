/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Colors,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, Checkbox, Input, List, Modal, ModalProps } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UsergroupAddOutlined } from "@ant-design/icons";
import UserInfoAvatar from "./UserInfoAvatar";
import {
  getEmployeeFullName,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";
import { matchSorter } from "match-sorter";

type EmployeeMultiSelectProps = {
  onSelectedEmployees: (employees: IEmployee[]) => void;
  initialSelected?: IEmployee[];
  admins?: string[];
  onClose: () => void;
} & ModalProps;

function EmployeeMultiSelect({
  onSelectedEmployees,
  initialSelected,
  admins,
  onClose,
  ...props
}: EmployeeMultiSelectProps) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const { employees: getEmployees } = useCuttinboardLocation();
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>([]);

  const handleToggle = (value: IEmployee) => () => {
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

  // Calculate a list of employees based on certain conditions
  const employees = useMemo(() => {
    // Filter the list of employees based on the search text and other conditions
    const filtered = getEmployees.filter(
      (emp) =>
        !admins?.includes(emp.id) &&
        !initialSelected?.some((e) => e.id === emp.id)
    );
    return searchText
      ? matchSorter(filtered, searchText, {
          keys: ["name", "lastName", "email"],
        })
      : filtered;
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
          {t("Add Members")}
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
                padding: "5px !important",
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
                avatar={<UserInfoAvatar employee={emp} />}
                title={getEmployeeFullName(emp)}
                description={emp.email}
              />
            </List.Item>
          );
        }}
      />
    </Modal>
  );
}

export default EmployeeMultiSelect;
