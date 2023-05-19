/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, List, Modal, ModalProps } from "antd/es";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LockOutlined,
  TagOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  useBoard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useNavigate } from "react-router-dom";
import {
  getEmployeeFullName,
  PrivacyLevel,
  privacyLevelToString,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

function ModuleInfoDialog({
  onEdit,
  ...props
}: ModalProps & { onEdit: () => void }) {
  const { selectedBoard, canManageBoard, deleteBoard } = useBoard();
  const { role, employees } = useCuttinboardLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const admins = useMemo(() => {
    if (
      !selectedBoard ||
      !selectedBoard.details.admins ||
      !selectedBoard.details.admins.length
    ) {
      return [];
    }
    const admins = selectedBoard.details.admins;
    return employees.filter((e) => admins.includes(e.id));
  }, [employees, selectedBoard]);

  const handleDelete = () => {
    if (!canManageBoard || !selectedBoard) {
      return;
    }
    // Confirm delete
    Modal.confirm({
      title: t("Delete Board"),
      content: t("Are you sure you want to delete this board?"),
      okText: t("Delete"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: () => {
        navigate("../");
        deleteBoard(selectedBoard);
      },
    });
  };

  const canEditOrDelete = useMemo(() => {
    if (!selectedBoard || selectedBoard.global) {
      return false;
    }
    if (selectedBoard.global) {
      return role === RoleAccessLevels.OWNER;
    } else {
      return role <= RoleAccessLevels.GENERAL_MANAGER;
    }
  }, [role, selectedBoard]);

  if (!selectedBoard) {
    return null;
  }

  return (
    <Modal
      {...props}
      title={t("Details")}
      footer={
        canEditOrDelete && [
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
        ]
      }
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
            avatar={
              selectedBoard.details.privacyLevel === PrivacyLevel.PRIVATE ? (
                <LockOutlined />
              ) : selectedBoard.details.privacyLevel ===
                PrivacyLevel.POSITIONS ? (
                <TagsOutlined />
              ) : (
                <GlobalOutlined />
              )
            }
            title={t("Membership Type")}
            description={
              selectedBoard.global
                ? t("Available across all locations")
                : t(privacyLevelToString(selectedBoard.details.privacyLevel))
            }
          />
        </List.Item>
        {Boolean(admins.length) && (
          <List.Item>
            <List.Item.Meta
              avatar={<CrownOutlined />}
              title={t("Admins")}
              description={admins.map((admin) => (
                <p key={admin.id}>{getEmployeeFullName(admin)}</p>
              ))}
            />
          </List.Item>
        )}
        <List.Item>
          <List.Item.Meta
            avatar={<InfoCircleOutlined />}
            title={t("Description")}
            description={
              selectedBoard.description ? selectedBoard.description : "---"
            }
          />
        </List.Item>
        {selectedBoard.details.privacyLevel === PrivacyLevel.POSITIONS &&
          selectedBoard.details.position && (
            <List.Item>
              <List.Item.Meta
                avatar={<TagOutlined />}
                title={t("Position")}
                description={selectedBoard.details.position}
              />
            </List.Item>
          )}
      </List>
    </Modal>
  );
}

export default ModuleInfoDialog;
