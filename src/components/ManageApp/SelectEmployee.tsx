import { COLORS, Employee } from "@cuttinboard-solutions/cuttinboard-library";
import { Button, Checkbox, Col, List, Row } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TitleBoxBlue, TitleBoxGreen } from "../../theme/styledComponents";
import { QuickUserDialogAvatar } from "../QuickUserDialog";

interface AddMembersProps {
  initialSelected?: Employee;
  onSelectedEmployee: (employee: Employee) => void;
  employees: Employee[];
  orgEmployees: Employee[];
}

function SelectEmployee({
  onSelectedEmployee,
  initialSelected,
  employees,
  orgEmployees,
}: AddMembersProps) {
  const { t } = useTranslation();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    initialSelected
  );

  const handleToggle = (emp: Employee) => () => {
    const isSelected = Boolean(selectedEmployee === emp);

    if (isSelected) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(emp);
    }
  };

  const handleAccept = () => {
    if (selectedEmployee) {
      onSelectedEmployee(selectedEmployee);
    }
  };

  const handleClose = () => {
    setSelectedEmployee(initialSelected);
  };

  const getUniqEmployees = useMemo(
    () =>
      employees.filter((emp) => !orgEmployees?.some((oe) => oe.id === emp.id)),
    [employees, orgEmployees]
  );

  return (
    <Row justify="center" style={{ paddingBottom: "50px" }}>
      <Col xs={24} md={20} lg={16} xl={12}>
        {Boolean(orgEmployees?.length) && (
          <>
            <TitleBoxBlue>{t("Organization")}</TitleBoxBlue>
            <List
              dataSource={orgEmployees}
              renderItem={(emp) => {
                return (
                  <List.Item
                    key={emp.id}
                    style={{
                      backgroundColor: COLORS.MainOnWhite,
                      padding: 5,
                      margin: 5,
                    }}
                    actions={[
                      <Checkbox
                        onChange={handleToggle(emp)}
                        checked={Boolean(selectedEmployee === emp)}
                      />,
                    ]}
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
          </>
        )}

        <TitleBoxGreen>{t("Location")}</TitleBoxGreen>
        <List
          dataSource={getUniqEmployees}
          renderItem={(emp) => {
            return (
              <List.Item
                key={emp.id}
                style={{
                  backgroundColor: COLORS.MainOnWhite,
                  padding: 5,
                  margin: 5,
                }}
                actions={[
                  <Checkbox
                    onChange={handleToggle(emp)}
                    checked={Boolean(selectedEmployee === emp)}
                  />,
                ]}
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
        <Button
          onClick={handleAccept}
          block
          type="primary"
          style={{ margin: "20px 0px" }}
        >
          {t("Accept")}
        </Button>
        <Button onClick={handleClose} danger block type="dashed">
          {t("Cancel")}
        </Button>
      </Col>
    </Row>
  );
}

export default SelectEmployee;
