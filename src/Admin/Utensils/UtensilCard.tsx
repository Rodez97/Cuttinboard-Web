/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Colors,
  useUtensils,
} from "@cuttinboard-solutions/cuttinboard-library";
import styled from "@emotion/styled";
import { Button, Dropdown, Modal, Progress, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ChangesDialog from "./ChangesDialog";
import ReportChangeDialog from "./ReportChangeDialog";
import { IUtensil } from "@cuttinboard-solutions/types-helpers";

interface IUtensilCard {
  utensil: IUtensil;
  onClick: (utensil: IUtensil) => void;
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
  const { deleteUtensil } = useUtensils();

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

  const handleDelete = () =>
    Modal.confirm({
      title: t("utensils.deleteUtensil"),
      content: t("utensils.deleteUtensilDescription"),
      onOk: () => deleteUtensil(utensil),
    });

  return (
    <CardContainer>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography.Text>{utensil.name}</Typography.Text>

        <div
          css={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Typography.Text strong type="secondary">
            {utensil.currentQuantity}/{utensil.optimalQuantity}
          </Typography.Text>

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
            <Button type="dashed" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>

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
