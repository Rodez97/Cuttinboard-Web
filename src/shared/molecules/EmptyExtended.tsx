/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Empty, EmptyProps, Timeline, Typography } from "antd/es";
import { useTranslation } from "react-i18next";

export default function EmptyExtended({
  descriptions,
  ...props
}: EmptyProps & {
  descriptions: string[];
}) {
  const { t } = useTranslation();
  return (
    <div
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flex: 1,
        paddingTop: 50,
      }}
    >
      <Empty
        {...props}
        css={{
          maxWidth: 350,
          marginBottom: 75,
        }}
      />
      <Timeline
        css={{
          maxWidth: 450,
        }}
        items={descriptions.map((des) => ({
          children: (
            <Typography.Text
              css={{
                fontFamily: "Roboto",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "22px",
                color: "#00000073",
              }}
            >
              {t(des)}
            </Typography.Text>
          ),
          color: "#00000040",
          dot: (
            <div
              css={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#00000040",
              }}
            />
          ),
        }))}
      />
    </div>
  );
}
