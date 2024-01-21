/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Input, List, Modal, ModalProps } from "antd/es";
import { ArrowRightOutlined } from "@ant-design/icons";
import UserInfoAvatar from "../organisms/UserInfoAvatar";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchSorter } from "match-sorter";
import { getEmployeeFullName, IEmployee } from "@rodez97/types-helpers";
import { Colors } from "@rodez97/cuttinboard-library";

type EmployeeSelectProps = {
  onSelectedEmployee: (employee: IEmployee) => void;
  employees?: IEmployee[];
} & ModalProps;

function EmployeeSelect({
  onSelectedEmployee,
  employees,
  ...props
}: EmployeeSelectProps) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

  // Calculate a list of employees based on certain conditions
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return searchText
      ? matchSorter(employees, searchText, {
          keys: [(e) => getEmployeeFullName(e)],
        })
      : employees;
  }, [employees, searchText]);

  return (
    <Modal {...props}>
      <Input.Search
        placeholder={t("Search")}
        allowClear
        onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
        value={searchText}
        css={{ width: 200, marginBottom: 10 }}
      />
      <List
        css={{ maxHeight: "80vh", overflowY: "auto" }}
        dataSource={filteredEmployees}
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
                avatar={<UserInfoAvatar employee={emp} />}
                title={`${emp.name} ${emp.lastName}`}
                description={emp.email}
              />
            </List.Item>
          );
        }}
      />
    </Modal>
  );
}

export default EmployeeSelect;
