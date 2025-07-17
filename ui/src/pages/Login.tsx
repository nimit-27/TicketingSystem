import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/AuthService";
import { getCurrentUserDetails } from "../config/config";
import { setPermissions } from "../utils/permissions";
import { setUserDetails } from "../utils/Utils";

const Login: React.FC = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roles = getCurrentUserDetails().role as string[];
        loginUser({ username: userId, password, roles })
            .then(res => {
                if (res.data) {
                    if (res.data.permissions) {
                        setPermissions(res.data.permissions);
                    }
                    const details = {
                        userId: res.data.userId || userId,
                        role: roles,
                        name: res.data.name
                    };
                    setUserDetails(details);
                }
                navigate("/");
            });
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
