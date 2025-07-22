import React, { useState } from 'react';
import { Modal, Box, Button } from '@mui/material';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';

interface JsonEditModalProps {
  open: boolean;
  data: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const JsonEditModal: React.FC<JsonEditModalProps> = ({ open, data, onSubmit, onCancel }) => {
  const [json, setJson] = useState<any>(data);

  const handleChange = (value: any) => {
    setJson(value);
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <Box sx={{ bgcolor: 'background.paper', p: 2, maxHeight: '80vh', overflow: 'auto', maxWidth: '80vw', margin: '5% auto' }}>
        <Editor value={json} onChange={handleChange} mode="tree" modes={["tree", "code"]} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" onClick={() => onSubmit(json)}>Submit</Button>
          <Button variant="outlined" onClick={onCancel} sx={{ ml: 1 }}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default JsonEditModal;
