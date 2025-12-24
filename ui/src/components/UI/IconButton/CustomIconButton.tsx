import React, { forwardRef } from 'react';
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
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CategoryIcon from "@mui/icons-material/Category";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PortraitIcon from '@mui/icons-material/Portrait';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import FeedbackIcon from '@mui/icons-material/Feedback';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import GradingIcon from '@mui/icons-material/Grading';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { PauseCircleOutline, NorthEast, Moving, PersonAddAlt } from '@mui/icons-material';
import UndoIcon from '@mui/icons-material/Undo';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestoreIcon from '@mui/icons-material/Restore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTheme } from '@mui/material';

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
    personAddAlt: PersonAddAlt,
    listAlt: ListAltIcon,
    lock: LockIcon,
    lockOpen: LockOpenIcon,
    verifiedUser: VerifiedUserIcon,
    addCircleOutline: AddCircleOutlineIcon,
    libraryBooks: LibraryBooksIcon,
    category: CategoryIcon,
    supervisorAccount: SupervisorAccountIcon,
    manageAccounts: ManageAccountsIcon,
    questionAnswer: QuestionAnswerIcon,
    person: PersonIcon,
    call: CallIcon,
    email: EmailIcon,
    infoOutlined: InfoOutlinedIcon,
    portrait: PortraitIcon,
    formatColorFill: FormatColorFillIcon,
    feedback: FeedbackIcon,
    keyboardDoubleArrowRight: KeyboardDoubleArrowRightIcon,
    runningWithErrors: RunningWithErrorsIcon,
    grading: GradingIcon,
    rateReview: RateReviewIcon,
    workOutline: WorkOutlineIcon,
    visibility: VisibilityIcon,
    linkOff: LinkOffIcon,
    undo: UndoIcon,
    dashboard: DashboardIcon,
    restore: RestoreIcon,
    accountCircle: AccountCircleIcon
};

// Valid keys for the icon map
type IconKey = keyof typeof iconMap;

// Helper component to render icon
export const IconComponent: React.FC<{
    icon: string;
    fontSize?: 'small' | 'medium' | 'large';
    className?: string;
    style?: React.CSSProperties;
    color?: string;
}> = ({
    icon,
    fontSize = 'small',
    className,
    style,
    color,
}) => {
        const theme = useTheme();

        const key = icon as IconKey;
        const Icon = iconMap[key];

        let finalColor = style?.color || color || theme.palette.global.icon.color;

        if (Icon) {
            return <Icon fontSize={fontSize} className={className} style={{ ...style, color: finalColor }} />;
        }

        return (
            <span className={className} style={style}>
                {icon}
            </span>
        );
    };

interface CustomIconButtonProps extends IconButtonProps {
    icon: string;
    className?: string;
}


const CustomIconButton = forwardRef<HTMLButtonElement, CustomIconButtonProps>(
    ({ icon, className, ...props }, ref) => {
        return (
            <IconButton ref={ref} {...props} className={className}>
                <IconComponent icon={icon} className={className} style={props.style} />
            </IconButton>
        );
    }
);


export default CustomIconButton;
