/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Checkbox, List } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TitleBoxGreen } from "../../theme/styledComponents";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/services";

interface AddMembersProps {
  onSelectedEmployees: (employees: Employee[]) => void;
  initialSelected?: Employee[];
  hostId?: string;
}

function AddMembers({
  onSelectedEmployees,
  initialSelected,
  hostId,
}: AddMembersProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getEmployees } = useEmployeesList();
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
      navigate(-1);
    }
  };

  const handleClose = () => {
    setSelectedEmployees(initialSelected);
    navigate(-1);
  };

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
        <TitleBoxGreen>{t("Location")}</TitleBoxGreen>
        <List
          dataSource={getEmployees}
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
                    checked={selectedEmployees.includes(emp)}
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

        <Button
          onClick={handleAccept}
          block
          type="primary"
          css={{ margin: "20px 0px" }}
        >
          {t("Accept")}
        </Button>

        <Button onClick={handleClose} danger block type="dashed">
          {t("Cancel")}
        </Button>
      </div>
    </div>
  );
}

export default AddMembers;
