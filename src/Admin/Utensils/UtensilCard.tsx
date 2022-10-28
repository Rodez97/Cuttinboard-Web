import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Button, List, Modal, Progress, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import ChangesDialog from "./ChangesDialog";
import ReportChangeDialog from "./ReportChangeDialog";

interface IUtensilCard {
  utensil: Utensil;
  onClick: (utensil: Utensil) => void;
}

const CardContainer = styled.div`
  background-color: ${Colors.MainOnWhite};
  padding: 5px 20px 0px 20px;
  margin: 0px 10px 10px 10px;
`;

function UtensilCard({ utensil, onClick }: IUtensilCard) {
  const { t } = useTranslation();
  const { isGeneralManager, isOwner, isAdmin } = useLocation();
  const [reportChangeDialogOpen, setReportChangeDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);

  const getScaleColor = useMemo(() => {
    if (utensil.percent <= 20) {
      return "#ff0000";
    }
    if (utensil.percent <= 40) {
      return "#ffa700";
    }
    if (utensil.percent <= 60) {
      return "#fff400";
    }
    if (utensil.percent <= 80) {
      return "#68AEA0";
    }
    if (utensil.percent <= 80) {
      return "#2cba00";
    }
  }, [utensil.percent]);

  const handleReportChangeDialogOpen = () => {
    setReportChangeDialogOpen(true);
  };

  const handleReportChangeDialogClose = () => {
    setReportChangeDialogOpen(false);
  };

  const handleDelete = () => {
    try {
      Modal.confirm({
        title: t("utensils.deleteUtensil"),
        content: t("utensils.deleteUtensilDescription"),
        onOk: async () => {
          await utensil.delete();
        },
      });
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <CardContainer>
      <List.Item
        actions={[
          <Tooltip title={t("Report change")} key="reportChange">
            <Button
              type="text"
              onClick={handleReportChangeDialogOpen}
              color="warning"
              icon={<FileTextOutlined />}
            />
          </Tooltip>,
          <Tooltip title={t("Changes")} key="changes">
            <Button
              type="text"
              onClick={() => setChangesDialogOpen(true)}
              color="primary"
              icon={<HistoryOutlined />}
            />
          </Tooltip>,
          <Tooltip title={t("Edit")} key="edit">
            <Button
              type="text"
              hidden={!(isOwner || isGeneralManager || isAdmin)}
              icon={<EditOutlined />}
              onClick={() => onClick(utensil)}
            />
          </Tooltip>,
          <Tooltip title={t("Delete")} key="delete">
            <Button
              type="text"
              hidden={!(isOwner || isGeneralManager || isAdmin)}
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              danger
            />
          </Tooltip>,
        ]}
      >
        <List.Item.Meta
          title={utensil.name}
          description={
            <>
              {`${t("Amount")}: `}
              <b>
                {utensil.currentQuantity}/{utensil.optimalQuantity}
              </b>
            </>
          }
        />
      </List.Item>
      <Progress
        strokeColor={getScaleColor}
        percent={utensil.percent}
        showInfo={false}
      />

      <ReportChangeDialog
        open={reportChangeDialogOpen}
        onClose={handleReportChangeDialogClose}
        utensil={utensil}
      />
      <ChangesDialog
        open={changesDialogOpen}
        onClose={() => setChangesDialogOpen(false)}
        utensil={utensil}
      />
    </CardContainer>
  );
}

export default UtensilCard;
