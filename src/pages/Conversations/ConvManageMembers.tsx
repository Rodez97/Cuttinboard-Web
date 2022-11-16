import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import { ModalProps } from "antd";
import React from "react";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ConvManageMembers(props: ModalProps) {
  const { canManage, selectedConversation } = useConversations();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.addHost(newHostUser);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (admin: Employee) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.removeHost(admin);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageMembers
      readonly={!canManage}
      members={selectedConversation.members}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedConversation.privacyLevel}
      positions={[selectedConversation.position]}
      admins={selectedConversation?.hosts}
      {...props}
    />
  );
}

export default ConvManageMembers;
