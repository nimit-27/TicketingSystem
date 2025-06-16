import React from 'react';
import Title from '../components/Title';
import CustomFieldset from '../components/CustomFieldset';
import GenericInput from '../components/UI/Input/GenericInput';
import GenericButton from '../components/UI/Button';
import { Table } from 'antd';
import DeleteIcon from '@mui/icons-material/Delete';

const EscalationMaster: React.FC = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    {
      title: 'Action',
      key: 'action',
      render: () => <DeleteIcon fontSize="small" style={{ color: 'red', cursor: 'pointer' }} />,
    },
  ];

  return (
    <div className="container">
      <Title text="User to be added for Escalation" />
      <CustomFieldset title="Add new User for Escalation">
        <div className="row g-3">
          <div className="col-md-4">
            <GenericInput label="Name" fullWidth />
          </div>
          <div className="col-md-4">
            <GenericInput label="Email ID" fullWidth />
          </div>
          <div className="col-md-4">
            <GenericInput label="Phone Number" fullWidth />
          </div>
        </div>
        <div className="mt-3">
          <GenericButton variant="contained" color="success" className="me-2">
            Submit
          </GenericButton>
          <GenericButton variant="contained" color="error">
            Cancel
          </GenericButton>
        </div>
      </CustomFieldset>
      <Table columns={columns as any} dataSource={[]} rowKey="name" className="mt-4" pagination={false} />
    </div>
  );
};

export default EscalationMaster;
