/** @jsx jsx */
import { IEmployee } from "@cuttinboard-solutions/types-helpers";
import { jsx } from "@emotion/react";
import { Divider, List, Modal, ModalProps, Typography } from "antd/es";
import { useTranslation } from "react-i18next";

export default ({
  employee,
  ...props
}: { employee: IEmployee } & ModalProps) => {
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
            description={employee.phoneNumber ? employee.phoneNumber : "---"}
          />
        </List.Item>

        <List.Item>
          <List.Item.Meta
            title={t("Preferred Name")}
            description={
              employee.preferredName ? employee.preferredName : "---"
            }
          />
        </List.Item>

        <List.Item>
          <List.Item.Meta
            title={t("Comments")}
            description={
              employee.contactComments ? employee.contactComments : "---"
            }
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
              description={
                employee.emergencyContact?.name
                  ? employee.emergencyContact.name
                  : "---"
              }
            />
          </List.Item>

          <List.Item>
            <List.Item.Meta
              title={t("Phone Number")}
              description={
                employee.emergencyContact?.phoneNumber
                  ? employee.emergencyContact.phoneNumber
                  : "---"
              }
            />
          </List.Item>
        </div>
      </List>
    </Modal>
  );
};
