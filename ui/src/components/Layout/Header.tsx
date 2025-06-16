import React, { useContext } from 'react';
import { ThemeModeContext } from '../../context/ThemeContext';
import CustomIconButton from '../UI/IconButton/CustomIconButton';

interface HeaderProps {
    collapsed: boolean;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggleSidebar }) => {
    const { toggle, mode } = useContext(ThemeModeContext);
    return (
        <header style={{ backgroundColor: 'green', color: 'white', width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CustomIconButton className="text-white" icon={collapsed ? 'menu' : 'chevronleft'} onClick={toggleSidebar} />
            <CustomIconButton icon={mode === 'light' ? 'darkmode' : 'lightmode'} onClick={toggle} />
        </header>
    );
};

export default Header;
