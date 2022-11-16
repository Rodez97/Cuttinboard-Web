import React, { useLayoutEffect, useMemo } from "react";
import DMMain from "./DMMain";
import { useParams } from "react-router-dom";
import {
  useDMs,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Result } from "antd";
import { useTranslation } from "react-i18next";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/models";
import { NotFound } from "../../components/NotFound";
import { PageLoading } from "../../components";

function DMRoutes() {
  const { t } = useTranslation();
  const { boardId, locationId } = useParams();
  const { setChatId, selectedChat } = useDMs();
  // If the chat is within the same location, we can get the recipient from list of employees
  const { getEmployeeById } = locationId != null && useEmployeesList();
  // If the chat is not within the same location, we need to get the recipient from the database
  const [user, loading, error] = useDocumentData(
    !locationId &&
      selectedChat &&
      doc(Firestore, "Users", selectedChat.recipient.id).withConverter(
        CuttinboardUser.Converter
      )
  );

  useLayoutEffect(() => {
    setChatId(boardId);
    return () => {
      setChatId(null);
    };
  }, [boardId]);

  const recipient = useMemo(() => {
    if (!selectedChat) {
      return null;
    }
    return locationId != null
      ? getEmployeeById(selectedChat.recipient.id)
      : user;
  }, [selectedChat, getEmployeeById, locationId, user]);

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

  if (!selectedChat || !recipient) {
    return <NotFound />;
  }

  return <DMMain employee={recipient} />;
}

export default DMRoutes;
