import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import CustomFieldset from '../components/CustomFieldset';
import { useTranslation } from 'react-i18next';
import GenericInput from '../components/UI/Input/GenericInput';
import GenericSubmitButton from '../components/UI/Button/GenericSubmitButton';
import GenericCancelButton from '../components/UI/Button/GenericCancelButton';
import GenericTable from '../components/UI/GenericTable';
import DeleteIcon from '@mui/icons-material/Delete';
import { addUser, deleteUser, getAllUsers } from '../services/UserService';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useSnackbar } from '../context/SnackbarContext';
import CancelAndSubmitButtons from '../components/UI/Button/CancelAndSubmitButtons';

const EscalationMaster: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 300);
  const { t } = useTranslation();

  const { showMessage } = useSnackbar();

  const { data: userData, apiHandler } = useApi<any>();
  const { apiHandler: addApiHandler } = useApi<any>();
  const { apiHandler: deleteApiHandler } = useApi<any>();

  const fetchUsers = () => {
    apiHandler(() => getAllUsers());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (Array.isArray(userData)) {
      setFiltered(userData);
    }
  }, [userData]);

  useEffect(() => {
    if (!Array.isArray(userData)) return;
    const query = debouncedSearch.toLowerCase();
    const list = userData.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.emailId.toLowerCase().includes(query) ||
      emp.mobileNo.includes(query)
    );
    setFiltered(list);
  }, [debouncedSearch, userData]);

  const handleSubmit = () => {
    if (!name || !email || !phone) return;
    const payload = {
      name,
      emailId: email,
      mobileNo: phone,
    };
    addApiHandler(() => addUser(payload)).then((res: any) => {
      fetchUsers();
      setName('');
      setEmail('');
      setPhone('');
      if (res?.message) {
        showMessage(res.message, 'success');
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteApiHandler(() => deleteUser(id)).then(() => fetchUsers());
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setPhone('');
  };

  const isSubmitDisabled = !name.trim() || !email.trim() || !phone.trim();

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
              handleDelete(record.UserId);
            }
          }}
        />
      ),
    },
  ];

  return (
    <div className="w-100">
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
        <CancelAndSubmitButtons handleCancel={handleCancel} handleSubmit={handleSubmit} isSubmitDisabled={isSubmitDisabled} />
        {/* <div className="d-flex gap-2 mt-3 justify-content-center">
          <GenericCancelButton onClick={handleCancel}>
            {t('Cancel')}
          </GenericCancelButton>
          <GenericSubmitButton className="me-2" onClick={handleSubmit} disabled={isSubmitDisabled}>
            {t('Submit')}
          </GenericSubmitButton>
        </div> */}
      </CustomFieldset>
      <div className="my-3 w-25">
        <GenericInput label="Search" fullWidth value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <GenericTable columns={columns as any} dataSource={filtered} rowKey="UserId" className="mt-4" pagination={false} />
    </div>
  );
};

export default EscalationMaster;
