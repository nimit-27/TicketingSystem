import React, { useContext } from 'react';
import { ThemeModeContext } from '../../context/ThemeContext';
import CustomIconButton from '../UI/IconButton/CustomIconButton';

const Header: React.FC = () => {
    const { toggle, mode } = useContext(ThemeModeContext);
    return (
        <header style={{ backgroundColor: 'green', color: 'white', width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <CustomIconButton icon={mode === 'light' ? 'DarkMode' : 'LightMode'} onClick={toggle} />
        </header>
    );
};

export default Header;
