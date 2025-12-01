import { Avatar } from "@mui/material"

const MasterIcon = () => {
    return (
        <Avatar
            sx={{ bgcolor: '#ff9800', width: 17, height: 17, ml: 0.5, fontSize: 10 }}
            aria-label="Master Ticket"
        >
            M
        </Avatar>
    )
}

export default MasterIcon;