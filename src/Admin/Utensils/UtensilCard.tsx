import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard/cuttinboard-library/models";
import { useLocation } from "@cuttinboard/cuttinboard-library/services";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { deleteDoc } from "@firebase/firestore";
import { Button, List, Progress, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { isGeneralManager, isOwner } = useLocation();
  const [reportChangeDialogOpen, setReportChangeDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const utencilPercent = Number.parseInt(
    ((utensil.currentQuantity / utensil.optimalQuantity) * 100).toFixed()
  );

  const getScaleColor = useMemo(() => {
    if (utencilPercent <= 20) {
      return "#ff0000";
    }
    if (utencilPercent <= 40) {
      return "#ffa700";
    }
    if (utencilPercent <= 60) {
      return "#fff400";
    }
    if (utencilPercent <= 80) {
      return "#68AEA0";
    }
    if (utencilPercent <= 80) {
      return "#2cba00";
    }
  }, [utencilPercent]);

  const handleReportChangeDialogOpen = () => {
    setReportChangeDialogOpen(true);
  };

  const handleReportChangeDialogClose = () => {
    setReportChangeDialogOpen(false);
  };

  const handleDelete = () => {
    deleteDoc(utensil.docRef);
  };

  const menuItems = [
    { label: t("Edit"), key: "edit", icon: <EditOutlined /> },
    {
      label: t("Delete"),
      key: "delete",
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

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
              style={{
                display: isOwner || isGeneralManager ? "initial" : "none",
              }}
              icon={<EditOutlined />}
              onClick={() => onClick(utensil)}
            />
          </Tooltip>,
          <Tooltip title={t("Delete")} key="delete">
            <Button
              type="text"
              style={{
                display: isOwner || isGeneralManager ? "initial" : "none",
              }}
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
        percent={utencilPercent}
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
