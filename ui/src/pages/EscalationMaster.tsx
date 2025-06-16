import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import CustomFieldset from '../components/CustomFieldset';
import GenericInput from '../components/UI/Input/GenericInput';
import GenericButton from '../components/UI/Button';
import { Table } from 'antd';
import DeleteIcon from '@mui/icons-material/Delete';
import { addEmployee, deleteEmployee, getAllEmployees } from '../services/EmployeeService';
import { useApi } from '../hooks/useApi';

const EscalationMaster: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { data: employeeData, apiHandler } = useApi<any>();
  const { apiHandler: addApiHandler } = useApi<any>();
  const { apiHandler: deleteApiHandler } = useApi<any>();

  const fetchEmployees = () => {
    apiHandler(() => getAllEmployees());
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = () => {
    if (!name || !email || !phone) return;
    const payload = {
      name,
      emailId: email,
      mobileNo: phone,
    };
    addApiHandler(() => addEmployee(payload)).then(() => {
      fetchEmployees();
      setName('');
      setEmail('');
      setPhone('');
    });
  };

  const handleDelete = (id: number) => {
    deleteApiHandler(() => deleteEmployee(id)).then(() => fetchEmployees());
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setPhone('');
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Designation', dataIndex: 'office', key: 'office' },
    { title: 'Email', dataIndex: 'emailId', key: 'emailId' },
    { title: 'Contact', dataIndex: 'mobileNo', key: 'mobileNo' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <DeleteIcon
          fontSize="small"
          style={{ color: 'red', cursor: 'pointer' }}
          onClick={() => handleDelete(record.employeeId)}
        />
      ),
    },
  ];

  return (
    <div className="container">
      <Title text="User to be added for Escalation" />
      <CustomFieldset title="Add new User for Escalation">
        <div className="row g-3">
          <div className="col-md-4">
            <GenericInput label="Name" fullWidth value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="col-md-4">
            <GenericInput label="Email ID" fullWidth value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="col-md-4">
            <GenericInput label="Phone Number" fullWidth value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <GenericButton variant="contained" color="success" className="me-2" onClick={handleSubmit}>
            Submit
          </GenericButton>
          <GenericButton variant="contained" color="error" onClick={handleCancel}>
            Cancel
          </GenericButton>
        </div>
      </CustomFieldset>
      <Table columns={columns as any} dataSource={Array.isArray(employeeData) ? employeeData : []} rowKey="employeeId" className="mt-4" pagination={false} />
    </div>
  );
};

export default EscalationMaster;
