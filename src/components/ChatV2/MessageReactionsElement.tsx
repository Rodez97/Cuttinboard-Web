import { groupBy } from "lodash";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function MessageReactionsElement({
  reactions,
}: {
  reactions?: Record<string, string>;
}) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const closeDialog = () => {
    setDetailsDialogOpen(false);
  };

  const openDialog = (key: string) => {
    setSortKey(key);
    setDetailsDialogOpen(true);
  };

  const getReactions = useMemo(() => {
    if (Object.keys(reactions ?? {}).length === 0) {
      return [];
    }
    return Object.entries(reactions).map(([id, emoji]) => {
      return { emoji, id };
    });
  }, [reactions]);

  if (!Boolean(getReactions)) {
    return null;
  }

  return (
    <>
      <div></div>
      {/* <Dialog
        onClose={closeDialog}
        open={detailsDialogOpen}
        PaperProps={{ sx: { width: "300px" } }}
      >
        <DialogTitle>{t("Message Reactions")}</DialogTitle>
        <DialogContent>
          <List>
            {getReactions
              .filter(({ emoji }) => emoji === sortKey)
              ?.map(({ emoji, by }, index) => (
                <ListItem
                  key={index}
                  dense
                  divider
                  secondaryAction={<Typography>{emoji}</Typography>}
                >
                  <ListItemText primary={by} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>OK</Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
}

export default MessageReactionsElement;
