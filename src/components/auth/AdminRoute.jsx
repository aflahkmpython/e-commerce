import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
    const { isAuthenticated, role, loading } = useSelector((state) => state.auth);

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" />;

    return (role === 'admin' || role === 'superadmin') ? <Outlet /> : <Navigate to="/403" />;
};

export default AdminRoute;
