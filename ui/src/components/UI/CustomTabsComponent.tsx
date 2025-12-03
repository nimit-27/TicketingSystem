import React, { useEffect, useState } from 'react';
import { Tabs, Box, SxProps, Theme } from '@mui/material';
import Tab from '@mui/material/Tab';


interface TabItem {
    key: string;
    tabTitle: string;
    tabComponent: React.ReactNode;
}

interface CustomTabsComponentProps {
    tabs: TabItem[];
    currentTab?: string;
    onTabChange?: (key: string) => void;
    tabsClassName?: string;
    tabSx?: SxProps<Theme>;
    getTabSx?: (key: string, isActive: boolean) => SxProps<Theme> | undefined;
}

const CustomTabsComponent: React.FC<CustomTabsComponentProps> = ({ tabs, currentTab, onTabChange, tabsClassName, tabSx, getTabSx }) => {
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleChange} className={tabsClassName}>
                    {tabs.map(t => (
                        <Tab
                            key={t.key}
                            label={t.tabTitle}
                            value={t.key}
                            // sx={[tabSx, getTabSx?.(t.key, activeTab === t.key)]}
                        />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                {activeComponent}
            </Box>
        </>
    );
};

export default CustomTabsComponent;
export type { TabItem };
