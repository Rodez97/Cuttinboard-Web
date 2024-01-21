/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, List, Modal, ModalProps } from "antd/es";
import { useTranslation } from "react-i18next";
import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGBoard } from "@rodez97/cuttinboard-library";

function BoardInfo({ onEdit, ...props }: ModalProps & { onEdit: () => void }) {
  const { selectedBoard, deleteBoard } = useGBoard();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!selectedBoard) {
      return;
    }
    // Confirm delete
    Modal.confirm({
      title: t("Delete Board"),
      content: t("Are you sure you want to delete this board?"),
      okText: t("Delete"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: async () => {
        navigate("../");
        deleteBoard(selectedBoard);
      },
    });
  };

  if (!selectedBoard) {
    return null;
  }

  return (
    <Modal
      {...props}
      title={t("Details")}
      footer={[
        <Button
          icon={<EditOutlined />}
          type="dashed"
          onClick={onEdit}
          key="edit"
        >
          {t("Edit")}
        </Button>,
        <Button
          icon={<DeleteOutlined />}
          type="dashed"
          danger
          onClick={handleDelete}
          key="delete"
        >
          {t("Delete")}
        </Button>,
      ]}
    >
      <List>
        <List.Item>
          <List.Item.Meta
            avatar={<FormOutlined />}
            title={t("Name")}
            description={selectedBoard.name}
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<InfoCircleOutlined />}
            title={t("Description")}
            description={
              selectedBoard.description ? selectedBoard.description : "---"
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<GlobalOutlined />}
            title={t("Membership Type")}
            description={t("Available across all locations")}
          />
        </List.Item>
      </List>
    </Modal>
  );
}

export default BoardInfo;
