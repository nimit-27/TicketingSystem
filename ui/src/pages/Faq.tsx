import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const Faq: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme()

    return (<>FAQ</>)
}

export default Faq;