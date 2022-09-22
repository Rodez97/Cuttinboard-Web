import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboardModule,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import React from "react";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ModuleManageMembers() {
  const { getEmployees, getOrgEmployees } = useEmployeesList();

  const {
    selectedApp,
    canManage,
    removeMember,
    addMembers,
    setAppHost,
    removeHost,
  } = useCuttinboardModule();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedApp) {
      return;
    }
    try {
      await removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedApp) {
      return;
    }
    try {
      await addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedApp) {
      return;
    }
    try {
      await setAppHost(newHostUser);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async () => {
    if (!selectedApp) {
      return;
    }
    try {
      await removeHost();
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageMembers
      readonly={!canManage}
      members={selectedApp.accessTags}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedApp.privacyLevel}
      positions={selectedApp.accessTags}
      hostId={selectedApp?.hostId}
      employees={getEmployees}
      orgEmployees={getOrgEmployees}
    />
  );
}

export default ModuleManageMembers;
