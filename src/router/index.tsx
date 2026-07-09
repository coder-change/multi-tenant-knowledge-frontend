import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { BasicLayout } from '@/layout/BasicLayout';
import { AuthLayout } from '@/layout/AuthLayout';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { DocumentsPage } from '@/pages/Documents';
import { ChatPage } from '@/pages/Chat';
import { BillingPage } from '@/pages/Billing';

/**
 * 受保护路由：未登录重定向到 /login
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * 已登录用户访问 /login → 跳到 /dashboard
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return isAuth ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export const AppRouter = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </PublicRoute>
      }
    />
    <Route
      element={
        <ProtectedRoute>
          <BasicLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:conversationId" element={<ChatPage />} />
      <Route path="/billing" element={<BillingPage />} />
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
