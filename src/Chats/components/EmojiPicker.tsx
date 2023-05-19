/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { Button, Popover } from "antd/es";
import { SmileFilled } from "@ant-design/icons";
import Picker from "@emoji-mart/react";
import i18n from "../../i18n";
import "./EmojiPicker.scss";

function EmojiPicker({
  onSelect,
  disabled,
}: {
  onSelect: (txt: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const getData = async () => {
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@emoji-mart/data"
    );

    return response.json();
  };

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      content={
        <Picker
          locale={i18n.language}
          theme="light"
          data={getData}
          onEmojiSelect={({ native }) => {
            onSelect(native);
            hide();
          }}
        />
      }
    >
      <Button
        icon={
          <SmileFilled
            css={{
              color: "#ffcc33bf",
              fontSize: 20,
            }}
          />
        }
        disabled={disabled}
        type="text"
      />
    </Popover>
  );
}

// Export Memoized Component
export default React.memo(EmojiPicker);
