import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { ModalProps } from "antd";
import React from "react";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ModuleManageMembers(props: ModalProps) {
  const { selectedApp, canManage } = useCuttinboardModule();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.addHost(newHostUser);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (admin: Employee) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.removeHost(admin.id);
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
      admins={selectedApp?.hosts}
      {...props}
    />
  );
}

export default ModuleManageMembers;
