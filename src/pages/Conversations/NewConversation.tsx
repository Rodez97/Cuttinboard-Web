import { Conversation } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import React from "react";
import ManageBase from "../../components/ManageApp/ManageBase";
import { recordError } from "../../utils/utils";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";

function NewConversation() {
  const { createConversation, editConversation, setChatId } =
    useConversations();
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();

  const create = async (newConvData: Conversation) => {
    try {
      const newId = await createConversation(newConvData);
      navigate(pathname.replace("new", newId));
    } catch (error) {
      recordError(error);
    }
  };

  const edit = async (convData: Conversation) => {
    try {
      await editConversation(convData);
    } catch (error) {
      recordError(error);
    }
  };
  return (
    <ManageBase title="Start a conversation" create={create} edit={edit} />
  );
}

export default NewConversation;
