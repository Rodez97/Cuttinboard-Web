/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, List, Modal, ModalProps } from "antd";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";

type AddMembersProps = {
  onSelectedEmployee: (employee: Employee) => void;
  employees?: Employee[];
} & ModalProps;

function SelectEmployee({
  onSelectedEmployee,
  employees,
  ...props
}: AddMembersProps) {
  return (
    <Modal {...props}>
      <List
        css={{ maxHeight: "80vh", overflowY: "auto" }}
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
    </Modal>
  );
}

export default SelectEmployee;
