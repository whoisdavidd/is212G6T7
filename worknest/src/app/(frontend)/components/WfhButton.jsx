import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import WfhDialog from "./WfhDialog";

const WfhButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Stack spacing={2} direction="row">
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
        >
          Request Work From Home
        </Button>
      </Stack>

      <WfhDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default WfhButton;
