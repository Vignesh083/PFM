import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import PrivateRoute from './PrivateRoute';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import AddExpensePage from './pages/AddExpensePage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage';
import ReportPage from './pages/ReportPage';
import RecurringPage from './pages/RecurringPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/expenses"   element={<ExpensesPage />} />
            <Route path="/expenses/add" element={<AddExpensePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/budget"     element={<BudgetPage />} />
            <Route path="/reports"    element={<ReportPage />} />
            <Route path="/recurring"  element={<RecurringPage />} />
            <Route path="/settings"   element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
