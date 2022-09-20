import { Auth } from "@cuttinboard/cuttinboard-library/firebase";
import { Employee } from "@cuttinboard/cuttinboard-library/models";
import {
  useDMs,
  useEmployeesList,
} from "@cuttinboard/cuttinboard-library/services";
import { Spin } from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectEmployee from "../../components/ManageApp/SelectEmployee";
import { recordError } from "../../utils/utils";

function NewDM() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { startNewDM } = useDMs();
  const { getEmployees, getOrgEmployees } = useEmployeesList();
  const [creating, setCreating] = useState(false);

  const startNewChat = async (selectedUser: Employee) => {
    setCreating(true);
    try {
      const newId = await startNewDM(selectedUser.id);
      navigate(pathname.replace("new", newId));
    } catch (error) {
      recordError(error);
    }
    setCreating(false);
  };
  return (
    <Spin spinning={creating}>
      <SelectEmployee
        onSelectedEmployee={startNewChat}
        employees={getEmployees.filter(({ id }) => id !== Auth.currentUser.uid)}
        orgEmployees={getOrgEmployees.filter(
          ({ id }) => id !== Auth.currentUser.uid
        )}
      />
    </Spin>
  );
}

export default NewDM;
