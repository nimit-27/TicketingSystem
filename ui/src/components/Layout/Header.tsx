import React, { useContext } from 'react';
import { ThemeModeContext } from '../../context/ThemeContext';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import Avatar from '@mui/material/Avatar';
import { currentUserDetails } from '../../config/config';

interface HeaderProps {
    collapsed: boolean;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggleSidebar }) => {
    const { toggle, mode } = useContext(ThemeModeContext);
    const initials = currentUserDetails.name
        ? currentUserDetails.name
              .split(' ')
              .map(n => n.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : '';

    return (
        <header
            style={{
                backgroundColor: 'green',
                color: 'white',
                width: '100%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <CustomIconButton
                className="text-white"
                icon={collapsed ? 'menu' : 'chevronleft'}
                onClick={toggleSidebar}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CustomIconButton
                    style={{ color: 'white' }}
                    icon={mode === 'light' ? 'darkmode' : 'lightmode'}
                    onClick={toggle}
                />
                <Avatar sx={{ bgcolor: '#757575', width: 32, height: 32, fontSize: 14 }}>
                    {initials}
                </Avatar>
            </div>
        </header>
    );
};

export default Header;
