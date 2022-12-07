/** @jsx jsx */
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { jsx } from "@emotion/react";
import { Divider, List, Modal, ModalProps, Typography } from "antd";
import { useTranslation } from "react-i18next";

export default ({
  employee,
  ...props
}: { employee: Employee } & ModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal title={t("Contact Information")} {...props}>
      <List size="small" split={false}>
        <List.Item>
          <List.Item.Meta title={t("Email")} description={employee.email} />
        </List.Item>

        <List.Item>
          <List.Item.Meta
            title={t("Phone Number")}
            description={employee.phoneNumber ?? "---"}
          />
        </List.Item>

        <List.Item>
          <List.Item.Meta
            title={t("Preferred Name")}
            description={employee.preferredName ?? "---"}
          />
        </List.Item>

        <List.Item>
          <List.Item.Meta
            title={t("Comments")}
            description={employee.contactComments ?? "---"}
          />
        </List.Item>

        <Divider>
          <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
            {t("Emergency Contact")}
          </Typography.Text>
        </Divider>

        <div
          css={{
            border: "1px solid #d9d9d9",
          }}
        >
          <List.Item>
            <List.Item.Meta
              title={t("Name")}
              description={employee.emergencyContact?.name ?? "---"}
            />
          </List.Item>

          <List.Item>
            <List.Item.Meta
              title={t("Phone Number")}
              description={employee.emergencyContact?.phoneNumber ?? "---"}
            />
          </List.Item>
        </div>
      </List>
    </Modal>
  );
};
