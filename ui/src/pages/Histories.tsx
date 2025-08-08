import React from 'react';
import StatusHistory from '../components/StatusHistory';
import AssignmentHistory from '../components/AssignmentHistory';
import CustomTabsComponent from '../components/UI/CustomTabsComponent';
import { useTranslation } from 'react-i18next';

interface HistoriesProps {
    ticketId: string;
    currentTab?: string;
    onTabChange?: (key: string) => void;
}

const Histories: React.FC<HistoriesProps> = ({ ticketId, currentTab, onTabChange }) => {
    const { t } = useTranslation();

    const tabs = [
        { key: 'status', tabTitle: t('Status History'), tabComponent: <StatusHistory ticketId={ticketId} /> },
        { key: 'assignment', tabTitle: t('Assignment History'), tabComponent: <AssignmentHistory ticketId={ticketId} /> },
    ];

    return (
        <CustomTabsComponent tabs={tabs} currentTab={currentTab} onTabChange={onTabChange} />
    );
};

export default Histories;
