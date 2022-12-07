import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { ModalProps } from "antd";
import React from "react";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ConvManageMembers(props: ModalProps) {
  const { canManage, activeConversation } = useConversations();

  const handleRemoveMember = async (employeeId: string) => {
    if (!activeConversation) {
      return;
    }
    try {
      await activeConversation.removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!activeConversation) {
      return;
    }
    try {
      await activeConversation.addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!activeConversation) {
      return;
    }
    try {
      await activeConversation.addHost(newHostUser);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (admin: Employee) => {
    if (!activeConversation) {
      return;
    }
    try {
      await activeConversation.removeHost(admin);
    } catch (error) {
      recordError(error);
    }
  };

  if (!activeConversation) {
    return null;
  }

  return (
    <ManageMembers
      readonly={!canManage}
      members={activeConversation.members ?? []}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={activeConversation.privacyLevel}
      positions={
        activeConversation.position ? [activeConversation.position] : []
      }
      admins={activeConversation?.hosts}
      {...props}
    />
  );
}

export default ConvManageMembers;
