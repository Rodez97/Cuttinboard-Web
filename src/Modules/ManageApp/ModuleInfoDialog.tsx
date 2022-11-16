/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  useCuttinboardModule,
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Divider, List, Modal, ModalProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { getPrivacyLevelTextByNumber, recordError } from "../../utils/utils";

function ModuleInfoDialog({
  onEdit,
  ...props
}: ModalProps & { onEdit: () => void }) {
  const { selectedApp, canManage } = useCuttinboardModule();
  const { locationAccessKey } = useLocation();
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();

  const admins = useMemo(() => {
    if (!Boolean(selectedApp.hosts?.length)) {
      return [];
    }
    return getEmployees.filter((e) => selectedApp.hosts?.indexOf(e.id) > -1);
  }, [getEmployees, selectedApp]);

  const handleDelete = async () => {
    if (!canManage) {
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
          await selectedApp.delete();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

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
          description={selectedApp.name}
        />
      </List.Item>
      <List.Item>
        <List.Item.Meta
          avatar={
            selectedApp.privacyLevel === PrivacyLevel.PRIVATE ? (
              <LockOutlined />
            ) : selectedApp.privacyLevel === PrivacyLevel.POSITIONS ? (
              <TagsOutlined />
            ) : (
              <GlobalOutlined />
            )
          }
          title={t("Privacy Level")}
          description={t(getPrivacyLevelTextByNumber(selectedApp.privacyLevel))}
        />
      </List.Item>
      {Boolean(admins.length) && (
        <List.Item>
          <List.Item.Meta
            avatar={<CrownOutlined />}
            title={t("Admins")}
            description={admins.map((admin) => (
              <p>{admin.fullName}</p>
            ))}
          />
        </List.Item>
      )}
      <List.Item>
        <List.Item.Meta
          avatar={<InfoCircleOutlined />}
          title={t("Description")}
          description={
            Boolean(selectedApp.description) ? selectedApp.description : "---"
          }
        />
      </List.Item>
      {selectedApp.privacyLevel === PrivacyLevel.POSITIONS &&
        Boolean(selectedApp.position) && (
          <List.Item>
            <List.Item.Meta
              avatar={<TagOutlined />}
              title={t("Position")}
              description={selectedApp.position}
            />
          </List.Item>
        )}
    </Modal>
  );
}

export default ModuleInfoDialog;
