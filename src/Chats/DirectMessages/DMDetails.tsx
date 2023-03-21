/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Divider, List, Modal, ModalProps, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { MailOutlined, MobileOutlined, UserOutlined } from "@ant-design/icons";
import { useDirectMessageChat } from "@cuttinboard-solutions/cuttinboard-library";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import {
  ICuttinboardUser,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";

type DMDetailsProps = {
  employee: IEmployee | ICuttinboardUser | undefined;
} & ModalProps;

export default ({ employee, ...props }: DMDetailsProps) => {
  const { t } = useTranslation();
  const { selectedDirectMessage } = useDirectMessageChat();

  if (!selectedDirectMessage) {
    return null;
  }

  if (!employee) {
    return (
      <Modal {...props} title={t("Details")} footer={null}>
        <Alert message={t("This employee has been removed")} type="warning" />
      </Modal>
    );
  }

  return (
    <Modal {...props} title={t("Details")} footer={null}>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <CuttinboardAvatar
          userId={employee.id}
          size={70}
          src={employee.avatar}
        />
        <Typography.Text type="secondary">{employee.name}</Typography.Text>
      </div>
      <Divider orientation="left">{t("About")}</Divider>

      <List>
        <List.Item>
          <List.Item.Meta
            avatar={<UserOutlined />}
            title={t("Full Name")}
            description={`${employee.name} ${employee.lastName}`}
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<MailOutlined />}
            title={t("Email")}
            description={employee.email}
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<MobileOutlined />}
            title={t("Phone Number")}
            description={employee.phoneNumber ?? "---"}
          />
        </List.Item>
      </List>
    </Modal>
  );
};
