/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Colors } from "@rodez97/cuttinboard-library";
import { Button, Checkbox, Input, List, Modal, ModalProps } from "antd/es";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UsergroupAddOutlined } from "@ant-design/icons";
import UserInfoAvatar from "./UserInfoAvatar";
import { getEmployeeFullName, IEmployee } from "@rodez97/types-helpers";
import { matchSorter } from "match-sorter";

type EmployeesSelectDialogProps = {
  onChange: (employees: IEmployee[]) => void;
  selected?: IEmployee[];
  source: IEmployee[];
  onClose: () => void;
} & ModalProps;

const EmployeesSelectDialog = ({
  onChange,
  selected,
  source,
  onClose,
  open,
  ...props
}: EmployeesSelectDialogProps) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

  const handleToggle = (value: IEmployee) => () => {
    const currentIndex = selected ? selected.indexOf(value) : -1;
    const newChecked = selected ? [...selected] : [];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    onChange(newChecked);
  };

  const filtered = useMemo(() => {
    if (searchText) {
      return matchSorter(source, searchText, {
        keys: ["name", "lastName", "email"],
      });
    }
    return source;
  }, [searchText, source]);

  return (
    <Modal
      {...props}
      open={open}
      title={t("Select employees")}
      footer={[
        <Button
          icon={<UsergroupAddOutlined />}
          type="primary"
          onClick={onClose}
          key="add"
        >
          OK
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
        dataSource={filtered}
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
                  checked={selected?.includes(emp)}
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
};

export default EmployeesSelectDialog;
