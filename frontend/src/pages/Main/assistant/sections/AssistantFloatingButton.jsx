import React from "react";
import Draggable from "react-draggable";
import { Fab } from "@mui/material";
import { Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";

const AssistantFloatingButton = ({ open, setOpen, dragRef }) => {
  return (
    <Draggable
      nodeRef={dragRef}
      bounds="body"
      defaultPosition={{
        x: window.innerWidth - 100,
        y: window.innerHeight - 200,
      }}
    >
      <div ref={dragRef} style={{ position: "fixed", zIndex: 1300 }}>
        <Fab
          color="default"
          onClick={() => setOpen(!open)}
          sx={{
            width: 58,
            height: 58,
            bgcolor: "#111827",
            color: "white",
            boxShadow: "0 14px 28px rgba(17,24,39,0.28)",
            "&:hover": { bgcolor: "#030712" },
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </div>
    </Draggable>
  );
};

export default AssistantFloatingButton;
