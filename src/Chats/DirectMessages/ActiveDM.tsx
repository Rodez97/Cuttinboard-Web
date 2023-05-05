import React, { useMemo } from "react";
import DMMain from "./DMMain";
import { NotFound } from "../../shared";
import {
  getDirectMessageRecipient,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { IDirectMessage } from "@cuttinboard-solutions/types-helpers";

export default ({
  selectedDirectMessage,
}: {
  selectedDirectMessage: IDirectMessage;
}) => {
  const { user } = useCuttinboard();

  const recipientUser = useMemo(
    () => getDirectMessageRecipient(selectedDirectMessage, user.uid),
    [selectedDirectMessage, user.uid]
  );

  if (!recipientUser) {
    return <NotFound />;
  }

  return (
    <DMMain
      recipientUser={recipientUser}
      selectedDirectMessage={selectedDirectMessage}
    />
  );
};
