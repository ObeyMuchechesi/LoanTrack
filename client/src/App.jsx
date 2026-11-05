import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Spinner from './components/Spinner.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Products from './pages/Products.jsx';
import Loans from './pages/Loans.jsx';
import NewLoan from './pages/NewLoan.jsx';
import LoanDetail from './pages/LoanDetail.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/clients" element={<Protected><Clients /></Protected>} />
      <Route path="/products" element={<Protected><Products /></Protected>} />
      <Route path="/loans" element={<Protected><Loans /></Protected>} />
      <Route path="/loans/new" element={<Protected><NewLoan /></Protected>} />
      <Route path="/loans/:id" element={<Protected><LoanDetail /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="/users" element={<Protected><Users /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
