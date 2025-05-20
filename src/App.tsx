
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BinTallyForm from "./pages/BinTallyForm";
import AdminDashboard from "./components/AdminDashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Companies from "./pages/Companies";
import Users from "./pages/Users";
import SiteAdminLayout from "./components/SiteAdminLayout";
import SiteAdminDashboard from "./pages/SiteAdminDashboard";
import BinTallyForms from "./pages/BinTallyForms";
import BinTallyFormEdit from "./pages/BinTallyFormEdit";
import FormInvitations from "./pages/FormInvitations";
import ContaminationTypes from "./pages/ContaminationTypes";
import AdminBinTypes from "./pages/AdminBinTypes";
import AdminContaminationTypes from "./pages/AdminContaminationTypes";
import SubmissionReportsPage from "./pages/SubmissionReportsPage";
import { useState } from "react";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/bin-tally-form" element={<BinTallyForm />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="companies" element={<Companies />} />
                <Route path="users" element={<Users />} />
                <Route path="bin-types" element={<AdminBinTypes />} />
                <Route path="contamination-types" element={<AdminContaminationTypes />} />
                <Route path="submissions" element={<SubmissionReportsPage />} />
              </Route>
              
              {/* Protected Site Admin Routes */}
              <Route path="/site-admin" element={
                <ProtectedRoute>
                  <SiteAdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<SiteAdminDashboard />} />
                <Route path="bin-tally-forms" element={<BinTallyForms />} />
                <Route path="bin-tally-forms/new" element={<BinTallyFormEdit />} />
                <Route path="bin-tally-forms/:id" element={<BinTallyFormEdit />} />
                <Route path="bin-tally-forms/:id/invite" element={<FormInvitations />} />
                <Route path="submissions" element={<SubmissionReportsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
