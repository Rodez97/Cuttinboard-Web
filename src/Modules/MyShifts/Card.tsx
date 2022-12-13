/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Button, Modal, Tag } from "antd";
import Icon from "@ant-design/icons";
import { Note } from "../Notes/notesIcons";
import { GrayPageHeader } from "../../shared";
import { Shift } from "@cuttinboard-solutions/cuttinboard-library/schedule";

interface ShiftCardProps {
  shift: Shift;
}

export default ({ shift }: ShiftCardProps) => {
  const { t } = useTranslation();

  const showNotes = () => {
    Modal.info({
      title: t("Shift Notes"),
      content: shift.origData.notes,
    });
  };

  return (
    <GrayPageHeader
      css={{
        marginBottom: 5,
      }}
      subTitle={`${shift.origData.start.format(
        "h:mm A"
      )} - ${shift.origData.end.format("h:mm A")}`}
      extra={
        shift.origData.notes && (
          <Button
            key="notes"
            onClick={showNotes}
            icon={<Icon component={Note} />}
            type="link"
            shape="circle"
          />
        )
      }
      tags={
        shift.origData.position
          ? [
              <Tag color="processing" key="pos">
                {shift.origData.position}
              </Tag>,
            ]
          : []
      }
    />
  );
};
