export const envConfig = {
    Roles: ["L1", "L2", "L3", "ADMIN", "FCI_USER", "USER", "RNO", "HELPDESK"],
    devMode: true,
    FciTheme: true,
    Users: {
        helpdesk: {
            userId: 'helpdesk.user',
            role: ['HELPDESK', 'IT', 'ADMIN'],
            name: 'Amit Shah',
            email: 'helpdesk@example.com',
            phone: '9000000001'
        },
        fci: {
            userId: 'fci.user',
            role: ['FCI_User'],
            name: 'Narendra Modi',
            email: 'fci.User@example.com',
            phone: '9000000002',
            UserId: '201'
        },
        user: {
            userId: localStorage.getItem('userId') || 'nimit.jain',
            role: localStorage.getItem('role') || ["USER"],
            name: localStorage.getItem('name') || 'Nimit Jain',
            email: localStorage.getItem('email') || 'jain.nimit@gmail.com',
            phone: localStorage.getItem('phone') || '9876543210'
        },
        regionalNodalOfficer: {
            userId: localStorage.getItem('userId') || 'nodal.officer',
            role: localStorage.getItem('role') || ["L1", "L2", "L3", "ADMIN", "FCI_USER", "RNO"],
            name: localStorage.getItem('name') || 'Rahul Gandhi',
            email: localStorage.getItem('email') || 'gandhi.rahul@gmail.com',
            phone: localStorage.getItem('phone') || '9876543210'
        }
    }
};

