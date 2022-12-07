import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/utensils";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Button, Dropdown, List, Modal, Progress } from "antd";
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
  const [reportChangeDialogOpen, setReportChangeDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);

  const getScaleColor = useMemo(() => {
    if (utensil.percent <= 33.33) {
      return "#FF4D4F";
    }
    if (utensil.percent <= 66.66) {
      return "#FAAD14";
    }
    if (utensil.percent <= 100) {
      return "#52C41A";
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
        extra={
          <Dropdown
            menu={{
              items: [
                {
                  key: "reportChange",
                  label: t("Report change"),
                  icon: <FileTextOutlined />,
                  onClick: handleReportChangeDialogOpen,
                },
                {
                  key: "changes",
                  label: t("Changes"),
                  icon: <HistoryOutlined />,
                  onClick: () => setChangesDialogOpen(true),
                },
                {
                  key: "edit",
                  label: t("Edit"),
                  icon: <EditOutlined />,
                  onClick: () => onClick(utensil),
                },
                {
                  key: "delete",
                  label: t("Delete"),
                  icon: <DeleteOutlined />,
                  onClick: handleDelete,
                  danger: true,
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        }
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
