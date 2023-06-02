/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Button, Modal, Tag, Typography } from "antd/es";
import Icon from "@ant-design/icons";
import { NoteIcon } from "../Notes/notesIcons";
import { GrayPageHeader } from "../../shared";
import { useMemo } from "react";
import { IShift, getShiftBaseData } from "@cuttinboard-solutions/types-helpers";

interface ShiftCardProps {
  shift: IShift;
}

export default ({ shift }: ShiftCardProps) => {
  const { t } = useTranslation();

  const originalData = useMemo(() => getShiftBaseData(shift), [shift]);

  const showNotes = () => {
    Modal.info({
      title: t("Shift Notes"),
      content: originalData.notes,
    });
  };

  return (
    <GrayPageHeader
      css={{
        marginBottom: 5,
      }}
      subTitle={`${originalData.start.format(
        "h:mm A"
      )} - ${originalData.end.format("h:mm A")}`}
      extra={
        originalData.notes && (
          <Button
            key="notes"
            onClick={showNotes}
            icon={<Icon component={NoteIcon} />}
            type="link"
            shape="circle"
          />
        )
      }
      tags={
        originalData.position
          ? [
              <Tag color="processing" key="pos">
                {originalData.position}
              </Tag>,
            ]
          : []
      }
    >
      <Typography.Text>{shift.locationName}</Typography.Text>
    </GrayPageHeader>
  );
};
