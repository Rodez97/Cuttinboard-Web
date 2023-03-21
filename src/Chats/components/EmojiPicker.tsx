/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { Button, Popover } from "antd";
import { SmileFilled } from "@ant-design/icons";
import data from "@emoji-mart/data";
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

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      content={
        <Picker
          locale={i18n.language}
          theme="light"
          data={data}
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
