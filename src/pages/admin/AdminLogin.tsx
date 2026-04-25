import { Navigate } from "react-router-dom";

// TEMPORARY: Auth disabled. Login page redirects straight to dashboard.
const AdminLogin = () => <Navigate to="/admin" replace />;

export default AdminLogin;
