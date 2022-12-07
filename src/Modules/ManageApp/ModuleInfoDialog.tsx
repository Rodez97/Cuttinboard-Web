/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, List, Modal, ModalProps } from "antd";
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
  PrivacyLevel,
  privacyLevelToString,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";
import { useBoard } from "@cuttinboard-solutions/cuttinboard-library/boards";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";

function ModuleInfoDialog({
  onEdit,
  ...props
}: ModalProps & { onEdit: () => void }) {
  const { selectedBoard, canManageBoard } = useBoard();
  const { locationAccessKey } = useCuttinboardLocation();
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();

  const admins = useMemo(() => {
    if (!selectedBoard || !selectedBoard.hosts || !selectedBoard.hosts.length) {
      return [];
    }
    const admins = selectedBoard.hosts;
    return getEmployees.filter((e) => admins.includes(e.id));
  }, [getEmployees, selectedBoard]);

  const handleDelete = async () => {
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
      onOk: async () => {
        try {
          await selectedBoard.delete();
        } catch (error) {
          recordError(error);
        }
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
      footer={
        locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && [
          <Button
            icon={<EditOutlined />}
            type="dashed"
            onClick={onEdit}
            key="edit"
          >
            {t("Edit Board")}
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
            selectedBoard.privacyLevel === PrivacyLevel.PRIVATE ? (
              <LockOutlined />
            ) : selectedBoard.privacyLevel === PrivacyLevel.POSITIONS ? (
              <TagsOutlined />
            ) : (
              <GlobalOutlined />
            )
          }
          title={t("Privacy Level")}
          description={t(privacyLevelToString(selectedBoard.privacyLevel))}
        />
      </List.Item>
      {Boolean(admins.length) && (
        <List.Item>
          <List.Item.Meta
            avatar={<CrownOutlined />}
            title={t("Admins")}
            description={admins.map((admin) => (
              <p key={admin.id}>{admin.fullName}</p>
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
      {selectedBoard.privacyLevel === PrivacyLevel.POSITIONS &&
        Boolean(selectedBoard.position) && (
          <List.Item>
            <List.Item.Meta
              avatar={<TagOutlined />}
              title={t("Position")}
              description={selectedBoard.position}
            />
          </List.Item>
        )}
    </Modal>
  );
}

export default ModuleInfoDialog;
