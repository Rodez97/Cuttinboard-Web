/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { capitalize, orderBy } from "lodash";
import { useScheduler } from "./Scheduler";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  Button,
  Card,
  List,
  Modal,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Icon, {
  ExclamationCircleOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
import { getDurationText } from "./getDurationText";

const BaseCard = css`
  width: 100%;
  margin-bottom: 7px;
`;

const DeletingCard = css`
  border: 3px dashed #f33d61;
`;

const DraftOrEditedCard = css`
  border: 3px dashed #606060;
`;

const PublisheCard = css`
  border: 3px solid ${Colors.MainBlue};
`;

interface CellItemDialogProps {
  shifts: Shift[];
  open?: boolean;
  onClose: () => void;
  employee: Employee;
  column: Date;
}

function CellItemDialog({
  shifts,
  open,
  onClose,
  employee,
  column,
}: CellItemDialogProps) {
  const { editShift, newShift } = useScheduler();
  const { t } = useTranslation();
  const { locationAccessKey } = useLocation();

  const handleOnClose = () => {
    onClose();
  };

  const handleOnAddShift = () => {
    onClose();
    newShift(employee, column);
  };

  const handleOnEditShift = (shift: Shift) => {
    onClose();
    editShift(employee, shift);
  };

  const showPromiseConfirm = (
    shift: Shift,
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    e.stopPropagation();
    Modal.confirm({
      title: t("Are you sure to delete this shift?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          if (locationAccessKey.role <= RoleAccessLevels.MANAGER) {
            await shift.delete();
          }
        } catch {
          return console.log("Oops errors!");
        }
      },
      onCancel() {},
    });
  };

  const restoreShift = async (
    shift: Shift,
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    e.stopPropagation();
    try {
      await shift.restore();
    } catch (err) {
      recordError(err);
    }
  };

  const getShiftData = (shift: Shift) => {
    let time = "";
    let shiftPosition = "";
    if (shift.hasPendingUpdates) {
      const { start, end, position } = shift.pendingUpdate;
      time = `${Shift.toDate(start)
        .format("h:mma")
        .replace("m", "")} - ${Shift.toDate(end)
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = position;
    } else {
      time = `${shift.getStartDayjsDate
        .format("h:mma")
        .replace("m", "")} - ${shift.getEndDayjsDate
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = shift.position;
    }
    return { time, shiftPosition };
  };

  const getShiftStatusText = (shift: Shift) => {
    if (shift.deleting) {
      return t("Pending Deletion");
    }
    if (shift.hasPendingUpdates || shift.status === "draft") {
      return t("Draft");
    }
    return t("Published");
  };

  const Tags = (shift: Shift) => {
    let overtimeTime = "";
    const { wageData, hourlyWage } = shift;
    if (wageData.overtimeHours > 0) {
      overtimeTime = getDurationText(wageData.overtimeHours * 60);
    }
    return (
      <React.Fragment>
        {!Boolean(shift.position) && (
          <Tag color="error">{t("No position")}</Tag>
        )}
        {Boolean(overtimeTime) ? (
          <Tooltip
            title={
              <Space direction="vertical">
                <Typography.Text
                  css={{ color: "inherit" }}
                >{`OT: ${overtimeTime}`}</Typography.Text>
                <Typography.Text css={{ color: "inherit" }}>{`OT pay: ${Number(
                  wageData.overtimeWage
                ).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}`}</Typography.Text>
              </Space>
            }
          >
            <Tag color="warning">
              {hourlyWage.toLocaleString("EN-us", {
                style: "currency",
                currency: "USD",
              }) + "/hr"}
            </Tag>
          </Tooltip>
        ) : (
          <Tag color={hourlyWage > 0 ? "processing" : "error"}>
            {(hourlyWage ?? 0).toLocaleString("EN-us", {
              style: "currency",
              currency: "USD",
            }) + "/hr"}
          </Tag>
        )}
        {shift.wageData.overtimeHours > 0 && (
          <Tooltip title={t("Overtime")}>
            <Icon
              component={mdiClockAlert}
              css={{ color: Colors.Error.errorMain }}
            />
          </Tooltip>
        )}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Modal
        onCancel={handleOnClose}
        open={open}
        title={capitalize(dayjs(column).format("MMMM DD, YYYY"))}
        footer={[
          <Button key="ok" onClick={onClose} type="primary">
            OK
          </Button>,
        ]}
      >
        <List
          dataSource={orderBy(shifts, (e) => e.getStartDayjsDate, ["asc"])}
          split
          renderItem={(shift) => (
            <Card
              key={shift.id}
              onClick={() => handleOnEditShift(shift)}
              hoverable
              css={[
                BaseCard,
                shift.deleting
                  ? DeletingCard
                  : shift.hasPendingUpdates || shift.status === "draft"
                  ? DraftOrEditedCard
                  : PublisheCard,
              ]}
              size="small"
              title={
                <Space direction="horizontal">
                  {getShiftData(shift).time}

                  {employee.locationRole > 2 && Tags(shift)}

                  {employee.locationRole === 2 && shift.position && Tags(shift)}
                </Space>
              }
              extra={
                shift.deleting ? (
                  <Button type="link" onClick={(e) => restoreShift(shift, e)}>
                    {t("Restore")}
                  </Button>
                ) : (
                  <Button
                    type="link"
                    danger
                    onClick={(e) => showPromiseConfirm(shift, e)}
                  >
                    {t("Delete")}
                  </Button>
                )
              }
            >
              <Card.Meta
                title={getShiftData(shift).shiftPosition}
                description={getShiftStatusText(shift)}
              />
            </Card>
          )}
        />

        <Button
          css={{ marginTop: 10 }}
          type="dashed"
          icon={<PlusCircleFilled />}
          onClick={handleOnAddShift}
          block
        >
          {t("Add")}
        </Button>
      </Modal>
    </React.Fragment>
  );
}

export default CellItemDialog;
