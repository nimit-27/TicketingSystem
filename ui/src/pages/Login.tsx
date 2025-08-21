import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/AuthService";
import { getCurrentUserDetails } from "../config/config";
import { RolePermission, setPermissions } from "../utils/permissions";
import { setUserDetails, UserDetails } from "../utils/Utils";
import { useApi } from "../hooks/useApi";

type LoginResponse = {
    permissions?: RolePermission;
    userId?: string;
    username?: string;
    roles?: string[];
    levels?: string[];
    name?: string;
    [key: string]: any;
};

const Login: React.FC = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { data: loginData, apiHandler: loginApiHandler } = useApi()

    useEffect(() => {
        if (loginData) {
            const res: LoginResponse = loginData
            if (res) {
                if (res.permissions) {
                    setPermissions(res.permissions);
                }
                const details: UserDetails = {
                    userId: res.userId || userId,
                    username: res.username,
                    role: res.roles,
                    levels: res.levels,
                    name: res.name
                };
                setUserDetails(details);
            }
            navigate("/");
        }
    }, [loginData, userId, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roles = getCurrentUserDetails()?.role as string[];

        loginApiHandler(() => loginUser({ username: userId, password, roles }))

        // loginUser({ username: userId, password, roles })
        //     .then(response => {
        //         let res = response.data.body
        //         if (res.data) {
        //             if (res.data.permissions) {
        //                 setPermissions(res.data.permissions);
        //             }
        //             const details = {
        //                 userId: res.data.userId || userId,
        //                 role: roles,
        //                 name: res.data.name
        //             };
        //             setUserDetails(details);
        //         }
        //         navigate("/");
        //     });
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <h3 className="mb-3">Login</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input className="form-control" value={userId} onChange={e => setUserId(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button className="btn btn-primary" type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
