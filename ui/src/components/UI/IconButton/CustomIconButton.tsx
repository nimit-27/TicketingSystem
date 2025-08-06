import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import TimelineIcon from '@mui/icons-material/Timeline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CodeIcon from '@mui/icons-material/Code';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { PauseCircleOutline, NorthEast, Moving, PersonAddAlt } from '@mui/icons-material';

// Define the icon map
const iconMap = {
    delete: DeleteIcon,
    edit: EditIcon,
    send: SendIcon,
    grid: ViewModuleIcon,
    table: TableRowsIcon,
    menu: MenuIcon,
    chevronleft: ChevronLeftIcon,
    darkmode: DarkModeIcon,
    lightmode: LightModeIcon,
    translate: TranslateIcon,
    timeline: TimelineIcon,
    arrowdown: KeyboardArrowDownIcon,
    arrowup: KeyboardArrowUpIcon,
    code: CodeIcon,
    close: CloseIcon,
    add: AddIcon,
    check: CheckIcon,
    moreVert: MoreVertIcon,
    replay: ReplayIcon,
    play: PlayArrowIcon,
    done: DoneIcon,
    arrowUpward: ArrowUpwardIcon,
    doneAll: DoneAllIcon,
    pause: PauseCircleOutline,
    northEast: NorthEast,
    moving: Moving,
    personAddAlt: PersonAddAlt
};

// Valid keys for the icon map
type IconKey = keyof typeof iconMap;

interface CustomIconButtonProps extends IconButtonProps {
    icon: string; // passed in as string, handled internally
}

// Helper component to render icon
export const IconComponent: React.FC<{ icon: string; fontSize?: 'small' | 'medium' | 'large'; className?: string }> = ({
    icon,
    fontSize = 'small',
    className,
}) => {
    const key = icon as IconKey;
    const Icon = iconMap[key];

    return Icon ? <Icon fontSize={fontSize} className={className} /> : null;
};

interface CustomIconButtonProps extends IconButtonProps {
    icon: string;
    className?: string;
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ icon, className, ...props }) => {
    return (
        <IconButton {...props} className={className}>
            <IconComponent icon={icon} className={className} />
        </IconButton>
    );
};

export default CustomIconButton;
