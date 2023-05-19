import { useBoard } from "@cuttinboard-solutions/cuttinboard-library";
import { IEmployee } from "@cuttinboard-solutions/types-helpers";
import { ModalProps } from "antd/es";
import React from "react";
import ManageBoardMembers from "../../shared/organisms/ManageBoardMembers";

function ModuleManageMembers(props: ModalProps) {
  const {
    selectedBoard,
    canManageBoard,
    removeHost,
    removeMember,
    addHost,
    addMembers,
  } = useBoard();

  if (!selectedBoard) {
    return null;
  }

  const handleRemoveMember = (employee: IEmployee) => {
    removeMember(selectedBoard, employee.id);
  };

  const handleAddMembers = (addedEmployees: IEmployee[]) => {
    addMembers(selectedBoard, addedEmployees);
  };

  const handleSetAppHost = (newHostUser: IEmployee) => {
    addHost(selectedBoard, newHostUser);
  };

  const handleRemoveHost = (admin: IEmployee) => {
    removeHost(selectedBoard, admin.id);
  };

  return (
    <ManageBoardMembers
      readonly={!canManageBoard}
      members={selectedBoard.details.members ?? []}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedBoard.details.privacyLevel}
      positions={
        selectedBoard.details.position ? [selectedBoard.details.position] : []
      }
      admins={selectedBoard.details.admins}
      {...props}
    />
  );
}

export default ModuleManageMembers;
