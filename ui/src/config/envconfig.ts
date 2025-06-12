export const envConfig = {
    Roles: ["L1", "L2", "L3", "ADMIN", "FCI_USER", "USER", "RNO"],
    CurrentUserDetails: {
        userId: localStorage.getItem('userId') || 'nimit.jain',
        role: localStorage.getItem('role') || 'L1',
        name: localStorage.getItem('name') || 'Nimit Jain',
        email: localStorage.getItem('email') || 'jain.nimit@gmail.com',
        phone: localStorage.getItem('phone') || '9876543210',
    }
};

