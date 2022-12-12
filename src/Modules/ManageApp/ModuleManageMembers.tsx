import { useBoard } from "@cuttinboard-solutions/cuttinboard-library/boards";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { ModalProps } from "antd";
import React from "react";
import ManageBoardMembers from "../../shared/organisms/ManageBoardMembers";
import { recordError } from "../../utils/utils";

function ModuleManageMembers(props: ModalProps) {
  const { selectedBoard, canManageBoard } = useBoard();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedBoard) {
      return;
    }
    try {
      await selectedBoard.removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedBoard) {
      return;
    }
    try {
      await selectedBoard.addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedBoard) {
      return;
    }
    try {
      await selectedBoard.addHost(newHostUser);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (admin: Employee) => {
    if (!selectedBoard) {
      return;
    }
    try {
      await selectedBoard.removeHost(admin.id);
    } catch (error) {
      recordError(error);
    }
  };

  if (!selectedBoard) {
    return null;
  }

  return (
    <ManageBoardMembers
      readonly={!canManageBoard}
      members={selectedBoard.accessTags ?? []}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedBoard.privacyLevel}
      positions={selectedBoard.accessTags}
      admins={selectedBoard.hosts}
      {...props}
    />
  );
}

export default ModuleManageMembers;
