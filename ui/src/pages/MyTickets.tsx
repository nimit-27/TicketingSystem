import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const MyTickets: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme()

    return (<>MY TICKETS</>)
}

export default MyTickets;