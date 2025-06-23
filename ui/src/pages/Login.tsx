import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmployee } from "../services/AuthService";

const Login: React.FC = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginEmployee({ userId, password })
            .then(() => {
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
