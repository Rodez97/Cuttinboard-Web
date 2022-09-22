import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Checkbox, Col, List, Row } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TitleBoxBlue, TitleBoxGreen } from "../../theme/styledComponents";
import { QuickUserDialogAvatar } from "../QuickUserDialog";

interface AddMembersProps {
  onSelectedEmployees: (employees: Employee[]) => void;
  employees: Employee[];
  orgEmployees: Employee[];
  initialSelected?: Employee[];
}

function AddMembers({
  onSelectedEmployees,
  employees,
  orgEmployees,
  initialSelected,
}: AddMembersProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[] | null>(
    initialSelected
  );

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
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedEmployees(initialSelected);
    navigate(-1);
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
                      backgroundColor: Colors.MainOnWhite,
                      padding: 5,
                      margin: 5,
                    }}
                    actions={[
                      <Checkbox
                        onChange={handleToggle(emp)}
                        checked={selectedEmployees.includes(emp)}
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
                  backgroundColor: Colors.MainOnWhite,
                  padding: 5,
                  margin: 5,
                }}
                actions={[
                  <Checkbox
                    onChange={handleToggle(emp)}
                    checked={selectedEmployees.includes(emp)}
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
          onClick={handleClose}
          danger
          block
          type="dashed"
          style={{ margin: "20px 0px" }}
        >
          {t("Cancel")}
        </Button>
        <Button onClick={handleAccept} block type="primary">
          {t("Accept")}
        </Button>
      </Col>
    </Row>
  );
}

export default AddMembers;
