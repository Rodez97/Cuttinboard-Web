import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import { PrivacyLevel } from "@cuttinboard-solutions/cuttinboard-library/utils";
import React from "react";
import { useNavigate } from "react-router-dom";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ConvManageMembers() {
  const navigate = useNavigate();

  const { canManageApp, selectedChat } = useConversations();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedChat) {
      return;
    }
    try {
      await selectedChat.removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedChat) {
      return;
    }
    try {
      await selectedChat.addMember(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedChat) {
      return;
    }
    try {
      await selectedChat.setHost(newHostUser);
      navigate(-1);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (host: Employee) => {
    if (!selectedChat) {
      return;
    }
    try {
      await selectedChat.removeHost(host);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageMembers
      readonly={!canManageApp}
      members={
        selectedChat.privacyLevel === PrivacyLevel.PRIVATE &&
        (selectedChat?.members ?? [])
      }
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedChat.privacyLevel}
      positions={
        selectedChat.privacyLevel === PrivacyLevel.POSITIONS &&
        (selectedChat?.positions ?? [])
      }
      hostId={selectedChat?.hostId ?? ""}
    />
  );
}

export default ConvManageMembers;
