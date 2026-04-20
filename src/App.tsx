import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppSidebar } from "./components/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOrderPage from "./pages/PublicOrderPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import HistoryPage from "./pages/HistoryPage";
import InvoiceBatchPage from "./pages/InvoiceBatchPage";
import SettingsPage from "./pages/SettingsPage";
import WorkLogIndexPage from "./pages/WorkLogIndexPage";
import WorkLogManualPage from "./pages/WorkLogManualPage";
import WorkLogChatPage from "./pages/WorkLogChatPage";
import WorkLogListPage from "./pages/WorkLogListPage";
import WorkLogDetailPage from "./pages/WorkLogDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/order/:slug" element={<PublicOrderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <main className="md:ml-16 flex-1 bg-[#f9fafb]">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/work-logs" element={<WorkLogIndexPage />} />
                      <Route path="/work-logs/manual" element={<WorkLogManualPage />} />
                      <Route path="/work-logs/chat" element={<WorkLogChatPage />} />
                      <Route path="/work-logs/list" element={<WorkLogListPage />} />
                      <Route path="/work-logs/:id" element={<WorkLogDetailPage />} />
                      <Route path="/customers" element={<CustomersPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/orders/:id" element={<OrderDetailPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/invoices/batch" element={<InvoiceBatchPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
