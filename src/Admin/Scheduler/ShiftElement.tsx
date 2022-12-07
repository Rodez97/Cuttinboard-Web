/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import Icon, {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Dropdown, Modal, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
import { useScheduler } from "./Scheduler";
import { recordError } from "../../utils/utils";
import { MouseEvent } from "react";
import ShowLegend from "./ShowLegend";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { Shift } from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
dayjs.extend(isBetween);

interface ShiftElementProps {
  employee: Employee;
  column: Date;
  shift: Shift;
}

const BaseContainerStyle = css`
  cursor: pointer;
  min-width: 130px !important;
  width: 100% !important;
  height: 50px;
  border: 3px solid ${Colors.MainBlue};
  position: relative;
`;

const DeletingStyle = css`
  border: 3px solid #f33d61;
`;

const DraftOrEditedStyle = css`
  border: 3px dotted #505050;
`;

function ShiftElement({ employee, column, shift }: ShiftElementProps) {
  const { editShift, newShift } = useScheduler();
  const { t } = useTranslation();

  const handleOnAddShift = () => {
    newShift?.(employee, column);
  };

  const handleOnEditShift = () => {
    editShift?.(employee, shift);
  };

  const handleDeleteShift = () => {
    Modal.confirm({
      title: t("Are you sure to delete this shift?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await shift.delete();
        } catch (err) {
          recordError(err);
        }
      },
    });
  };

  const restoreShift = async () => {
    try {
      await shift.restore();
    } catch (err) {
      recordError(err);
    }
  };

  const cancelPendingUpdate = async () => {
    Modal.confirm({
      title: t("Are you sure to cancel this update?"),
      content: t("The shift will be restored to the previous state"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await shift.cancelUpdate();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const handleOvertimeClick = (e: MouseEvent) => {
    e.stopPropagation();
    ShowLegend();
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            label: t("Edit"),
            key: "edit",
            icon: <EditOutlined />,
            onClick: handleOnEditShift,
          },
          {
            label: t("New Shift"),
            key: "new-shift",
            icon: <PlusOutlined />,
            onClick: handleOnAddShift,
          },
          {
            label: t("Cancel Update"),
            key: "cancel-update",
            icon: <CloseOutlined />,
            onClick: cancelPendingUpdate,
            style: { display: shift.pendingUpdate ? "block" : "none" },
          },
          shift.deleting
            ? {
                label: t("Cancel Delete"),
                key: "cancelDelete",
                icon: <CloseOutlined />,
                danger: true,
                onClick: restoreShift,
              }
            : {
                label: t("Delete"),
                key: "delete",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: handleDeleteShift,
              },
        ],
      }}
      trigger={["click"]}
    >
      <div
        css={[
          BaseContainerStyle,
          shift.deleting
            ? DeletingStyle
            : shift.status === "draft" || shift.hasPendingUpdates
            ? DraftOrEditedStyle
            : undefined,
        ]}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography.Text
            css={{
              color: "inherit",
              textAlign: "center",
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {`${shift.getStartDayjsDate
              .format("h:mma")
              .replace("m", "")} - ${shift.getEndDayjsDate
              .format("h:mma")
              .replace("m", "")}`}
          </Typography.Text>

          {shift.position && shift.hourlyWage > 0 ? (
            <Tag color="processing">{shift.position}</Tag>
          ) : shift.position ? (
            <Tag color="warning">$0.00/hr</Tag>
          ) : (
            <Tag color="error">{t("No position")}</Tag>
          )}

          {shift.wageData?.overtimeHours > 0 && (
            <Icon
              component={mdiClockAlert}
              css={{
                color: Colors.Error.errorMain,
                position: "absolute",
                bottom: 5,
                right: 5,
                cursor: "help !important",
              }}
              onClick={handleOvertimeClick}
            />
          )}
        </div>
      </div>
    </Dropdown>
  );
}

export default ShiftElement;
