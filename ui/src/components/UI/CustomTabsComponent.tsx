import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface TabItem {
    key: string;
    tabTitle: string;
    tabComponent: React.ReactNode;
}

interface CustomTabsComponentProps {
    tabs: TabItem[];
    currentTab?: string;
    onTabChange?: (key: string) => void;
}

const CustomTabsComponent: React.FC<CustomTabsComponentProps> = ({ tabs, currentTab, onTabChange }) => {
    const [value, setValue] = useState<string>(currentTab || tabs[0]?.key);

    useEffect(() => {
        if (currentTab) setValue(currentTab);
    }, [currentTab]);

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
        onTabChange?.(newValue);
    };

    const activeTab = currentTab ?? value;
    const activeComponent = tabs.find(t => t.key === activeTab)?.tabComponent;

    return (
        <>
            <Tabs value={activeTab} onChange={handleChange}>
                {tabs.map(t => (
                    <Tab key={t.key} label={t.tabTitle} value={t.key} />
                ))}
            </Tabs>
            <Box sx={{ mt: 2 }}>
                {activeComponent}
            </Box>
        </>
    );
};

export default CustomTabsComponent;
export type { TabItem };
