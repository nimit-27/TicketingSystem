import React, { useState, useEffect } from 'react';
import { Modal, Box, Button } from '@mui/material';
import Editor from '@monaco-editor/react';

interface JsonEditModalProps {
  open: boolean;
  data: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const JsonEditModal: React.FC<JsonEditModalProps> = ({ open, data, onSubmit, onCancel }) => {
  const [jsonString, setJsonString] = useState<string>(JSON.stringify(data, null, 2));

  useEffect(() => {
    setJsonString(JSON.stringify(data, null, 2));
  }, [data]);

  const handleChange = (value?: string) => {
    if (value !== undefined) {
      setJsonString(value);
    }
  };

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(jsonString);
      onSubmit(parsed);
    } catch (e) {
      alert('Invalid JSON');
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <Box sx={{ bgcolor: 'background.paper', p: 2, maxHeight: '80vh', overflow: 'auto', maxWidth: '80vw', margin: '5% auto' }}>
        <Editor
          height="60vh"
          language="json"
          value={jsonString}
          onChange={handleChange}
          options={{ minimap: { enabled: false } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          <Button variant="outlined" onClick={onCancel} sx={{ ml: 1 }}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default JsonEditModal;
