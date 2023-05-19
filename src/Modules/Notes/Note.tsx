/** @jsx jsx */
import { jsx } from "@emotion/react";
import React from "react";
import Linkify from "linkify-react";
import { Card, Tooltip, Typography } from "antd/es";
import { StickyNote } from "../../shared";
import { INote } from "@cuttinboard-solutions/types-helpers";

interface NoteCardProps {
  note: INote;
  onSelect: (note: INote) => void;
}

const LinkProps = {
  onClick: (event: MouseEvent) => {
    event.preventDefault();
  },
};

const NoteCard = ({ note, onSelect }: NoteCardProps) => {
  const handleClick = () => {
    onSelect(note);
  };

  return (
    <React.Fragment>
      <Tooltip title={note.title}>
        <StickyNote hoverable onClick={handleClick} bordered={false}>
          <Card.Meta
            title={note.title}
            description={
              <Typography.Paragraph
                ellipsis={{ rows: 8, expandable: false, symbol: "..." }}
                css={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                }}
              >
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noreferrer noopener",
                    className: "linkifyInnerStyle",
                    attributes: LinkProps,
                  }}
                >
                  {note.content}
                </Linkify>
              </Typography.Paragraph>
            }
          />
        </StickyNote>
      </Tooltip>
    </React.Fragment>
  );
};

export default NoteCard;
