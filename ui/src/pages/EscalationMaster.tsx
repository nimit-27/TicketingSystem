import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import CustomFieldset from '../components/CustomFieldset';
import { useTranslation } from 'react-i18next';
import GenericInput from '../components/UI/Input/GenericInput';
import GenericButton from '../components/UI/Button';
import { Table } from 'antd';
import DeleteIcon from '@mui/icons-material/Delete';
import { addEmployee, deleteEmployee, getAllEmployees } from '../services/EmployeeService';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useSnackbar } from '../context/SnackbarContext';

const EscalationMaster: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 300);
  const { t } = useTranslation();

  const { showMessage } = useSnackbar();

  const { data: employeeData, apiHandler } = useApi<any>();
  const { apiHandler: addApiHandler } = useApi<any>();
  const { apiHandler: deleteApiHandler } = useApi<any>();

  const fetchEmployees = () => {
    apiHandler(() => getAllEmployees());
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (Array.isArray(employeeData)) {
      setFiltered(employeeData);
    }
  }, [employeeData]);

  useEffect(() => {
    if (!Array.isArray(employeeData)) return;
    const query = debouncedSearch.toLowerCase();
    const list = employeeData.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.emailId.toLowerCase().includes(query) ||
      emp.mobileNo.includes(query)
    );
    setFiltered(list);
  }, [debouncedSearch, employeeData]);

  const handleSubmit = () => {
    if (!name || !email || !phone) return;
    const payload = {
      name,
      emailId: email,
      mobileNo: phone,
    };
    addApiHandler(() => addEmployee(payload)).then((res: any) => {
      fetchEmployees();
      setName('');
      setEmail('');
      setPhone('');
      if (res?.message) {
        showMessage(res.message, 'success');
      }
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
          style={{ color: 'gray', cursor: 'pointer' }}
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this user?')) {
              handleDelete(record.employeeId);
            }
          }}
        />
      ),
    },
  ];

  return (
    <div className="container">
      <Title textKey="User to be added for Escalation" />
      <CustomFieldset title={t('Add new User for Escalation')}>
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
            {t('Submit')}
          </GenericButton>
          <GenericButton variant="contained" color="error" onClick={handleCancel}>
            {t('Cancel')}
          </GenericButton>
        </div>
      </CustomFieldset>
      <div className="my-3 w-25">
        <GenericInput label="Search" fullWidth value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Table columns={columns as any} dataSource={filtered} rowKey="employeeId" className="mt-4" pagination={false} />
    </div>
  );
};

export default EscalationMaster;
