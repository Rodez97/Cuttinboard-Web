/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Form, Input, message, Typography } from "antd/es";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { useParams } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { GrayPageHeader } from "../../shared";
import {
  useCuttinboard,
  useDirectMessageChat,
  useFindDMRecipient,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  ICuttinboardUser,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";
import imgAvatar from "../../assets/images/avatar.webp";

export interface NewDMByEmailRef {
  reset: () => void;
}

type Props = {
  onCreatingChange: (status: boolean) => void;
  onClose: () => void;
};

const NewDMByEmail = forwardRef<NewDMByEmailRef, Props>(
  ({ onCreatingChange, onClose }: Props, ref) => {
    const [form] = Form.useForm<{ email: string }>();
    const { locationId } = useParams();
    const { t } = useTranslation();
    const { user } = useCuttinboard();
    const [targetUser, setTargetUser] = useState<
      ICuttinboardUser | IEmployee | null
    >(null);
    const { startNewDirectMessageChat } = useDirectMessageChat();
    const [messageApi, contextHolder] = message.useMessage();
    const findRecipient = useFindDMRecipient();

    useImperativeHandle(ref, () => ({
      reset,
    }));

    const reset = () => {
      setTargetUser(null);
      form.resetFields();
    };

    const searchUser = async ({ email }: { email: string }) => {
      try {
        onCreatingChange(true);
        const employee = await findRecipient(email, locationId);
        if (employee) {
          setTargetUser(employee);
        }
      } catch (error) {
        messageApi.open({
          type: "error",
          content: t(error.message),
        });
        setTargetUser(null);
        recordError(error);
      } finally {
        onCreatingChange(false);
      }
    };

    const createChat = () => {
      if (!targetUser) {
        return;
      }

      try {
        onCreatingChange(true);
        startNewDirectMessageChat(targetUser);
        onClose();
      } catch (error) {
        recordError(error);
      } finally {
        onCreatingChange(false);
      }
    };

    return (
      <div>
        {contextHolder}
        <Form
          layout="vertical"
          autoComplete="off"
          form={form}
          onFinish={searchUser}
        >
          <Form.Item
            name="email"
            normalize={(value: string) => value?.toLowerCase()}
            label={
              <Typography.Text type="secondary" css={{ fontSize: 18 }}>
                {t("With someone in your organizations")}
              </Typography.Text>
            }
            rules={[
              { type: "email", message: t("Must be a valid email") },
              {
                validator(_, value) {
                  if (value && value === user.email?.toLowerCase()) {
                    return Promise.reject(
                      new Error(t("You cannot enter your own email"))
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Search
              onSearch={() => form.submit()}
              placeholder={t("Type an email")}
              type="email"
            />
          </Form.Item>
        </Form>

        {targetUser && (
          <React.Fragment>
            <Typography>{t("Eligible User:")}</Typography>
            <GrayPageHeader
              avatar={{
                src: targetUser.avatar ? targetUser.avatar : imgAvatar,
              }}
              title={`${targetUser.name} ${targetUser.lastName}`}
              extra={
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  onClick={createChat}
                />
              }
              footer={targetUser.email}
            />
          </React.Fragment>
        )}
      </div>
    );
  }
);

export default NewDMByEmail;
