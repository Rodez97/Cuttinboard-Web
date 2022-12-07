import React, { useLayoutEffect, useMemo } from "react";
import DMMain from "./DMMain";
import { useParams } from "react-router-dom";
import { Result } from "antd";
import { useTranslation } from "react-i18next";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { NotFound } from "../../components/NotFound";
import { PageLoading } from "../../components";
import { useDirectMessageChat } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/account";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";

export default () => {
  const { t } = useTranslation();
  const { boardId, locationId } = useParams();
  const { setSelectedDirectMessageChatId, selectedDirectMessageChat } =
    useDirectMessageChat();
  // If the chat is within the same location, we can get the recipient from list of employees
  const empContext = locationId != null && useEmployeesList();
  // If the chat is not within the same location, we need to get the recipient from the database
  const [user, loading, error] = useDocumentData(
    !locationId &&
      selectedDirectMessageChat &&
      selectedDirectMessageChat.recipient
      ? doc(
          FIRESTORE,
          "Users",
          selectedDirectMessageChat.recipient.id
        ).withConverter(CuttinboardUser.firestoreConverter)
      : null
  );

  useLayoutEffect(() => {
    if (boardId) {
      setSelectedDirectMessageChatId(boardId);
    }
    return () => {
      setSelectedDirectMessageChatId("");
    };
  }, [boardId, setSelectedDirectMessageChatId]);

  const recipient = useMemo(() => {
    if (
      !selectedDirectMessageChat ||
      loading ||
      error ||
      !selectedDirectMessageChat.recipient
    ) {
      return;
    }
    return empContext
      ? empContext.getEmployeeById(selectedDirectMessageChat.recipient.id)
      : user;
  }, [selectedDirectMessageChat, loading, error, empContext, user]);

  if (error) {
    return (
      <Result
        status="error"
        title={t("Error")}
        subTitle={t("There was an error loading the chat")}
      />
    );
  }

  if (loading) {
    return <PageLoading />;
  }

  if (!selectedDirectMessageChat) {
    return <NotFound />;
  }

  return <DMMain employee={recipient} />;
};
