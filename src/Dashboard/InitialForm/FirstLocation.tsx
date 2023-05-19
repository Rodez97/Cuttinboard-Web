/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Form, Input, Typography } from "antd/es";
import { useTranslation } from "react-i18next";
import { useWizard } from "react-use-wizard";
import { TrimRule } from "../../utils/utils";
import {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionWrapper,
} from "./SectionWrapper";

function FirstLocation({ onChanged }: { onChanged: (name: string) => void }) {
  const [form] = Form.useForm<{ name: string }>();
  const { t } = useTranslation();
  const { nextStep, previousStep } = useWizard();

  const handleNext = ({ name }: { name: string }) => {
    onChanged(name);
    nextStep();
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <Typography.Title
          level={2}
          css={{
            marginBottom: "0 !important",
          }}
        >
          {t("Let's create your first location. You can add more later")}
        </Typography.Title>
      </SectionHeader>

      <SectionContent>
        <Form
          layout="vertical"
          autoComplete="off"
          autoCorrect="off"
          onFinish={handleNext}
          form={form}
          css={{
            maxWidth: 400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Form.Item
            required
            name="name"
            rules={[
              {
                required: true,
                message: t("You must enter a name for your location"),
              },
              {
                max: 40,
                message: t("Name must be 20 characters or less"),
              },
              {
                whitespace: true,
                message: t("Name cannot be empty"),
              },
              TrimRule,
            ]}
            label={t("What is the name of your location?")}
            extra={t("You can edit or add more details later")}
          >
            <Input
              placeholder={t('e.g. "The Garden Cafe"')}
              maxLength={40}
              showCount
            />
          </Form.Item>
        </Form>
      </SectionContent>

      <SectionFooter>
        <Button onClick={previousStep} type="dashed" size="large">
          {t("Back")}
        </Button>
        <Button onClick={form.submit} type="primary" size="large">
          {t("Next")}
        </Button>
      </SectionFooter>
    </SectionWrapper>
  );
}

export default FirstLocation;
