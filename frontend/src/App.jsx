import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './routes/admin/AdminLayout';
import { UserLayout } from './routes/user/UserLayout';
import { Dashboard } from './routes/admin/Dashboard';
import { Authentication } from './routes/Authentication';
import { HomePage } from './routes/public/HomePage';
import { UserDashboard } from './routes/user/UserDashboard';
import { PublicLayout } from './routes/public/PublicLayout';
import { Toaster } from "react-hot-toast";
import { FileCase } from './components/FileCase';
import { CaseForm } from './components/CaseForm';
import { Hearings } from './routes/Hearings';
import { CaseRecords } from './routes/CaseRecords';
import { Calendar } from './routes/Calendar';
import { Case } from './routes/Case';
import { GenerateDocument } from './routes/admin/pages/GenerateDocu';
import { LuponManagement } from './routes/admin/pages/LuponManagement';
import { NotFound } from './routes/NotFound';
import { useEffect } from "react";
import  useAuthenticationStore  from "./store/useAuthenticationStore";
import { SignUp } from './routes/SignUp';
import { CasePersonManagement } from './routes/admin/pages/CasePersonManagement';
import { Settings } from './routes/Settings';
import Hearing from './routes/Hearing';
import { Lupon } from './routes/admin/pages/Lupon';
import { Reports } from './routes/admin/pages/Reports';
import { HearingScheduler } from './routes/admin/pages/Hearing-Scheduler';
import { CasePerson } from './routes/admin/pages/CasePerson';
import { Draft } from './routes/Draft';
import { Support } from './routes/Support';
import { TemplateEditor } from './routes/admin/pages/TemplateEditor';
import { GenerateDocx } from './routes/admin/pages/GenerateDocx';

function App() {
  const { initializeAuth } = useAuthenticationStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);


  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<PublicLayout />}>
              <Route index  element={<HomePage />} />
              <Route path="/Login" element={<Authentication />} />
              <Route path="/SignUp" element={<SignUp />} />
            </Route>
            
            {/* User Routes */}
            <Route   element={<UserLayout />}>
              <Route path="u/:user/"  element={<UserDashboard />} />
              <Route path="u/:user/Drafts"  element={<Draft />} />
              <Route path="u/:user/Hearings"  element={<Hearings />} />
              <Route path="u/:user/CaseRecords" element={<CaseRecords />} />
              <Route path="u/:user/Calendar" element={<Calendar />} />
              <Route path="u/:user/File-Case/:caseNum" element={<FileCase />} />
              <Route path="u/:user/File-Case" element={<FileCase />} />
              <Route path="u/:user/File-Case/Case-Form" element={<CaseForm />} />
              <Route path="u/:user/Case/:case_number" element={<Case />} />
              <Route path="u/:user/Settings" element={<Settings />} />
              <Route path="u/:user/Support" element={<Support />} />
              <Route path="u/:user/Hearing/:hearing_id" element={<Hearing />} />
            </Route>

            {/* Admin Routes */}
            <Route  element={<AdminLayout />}>
              <Route path='Admin/' element={<Dashboard />} />
              <Route path="Admin/File-Case" element={<FileCase />} />
              <Route path="Admin/File-Case/:caseNum" element={<FileCase />} />
              <Route path="Admin/Calendar" element={<Calendar />} />
              <Route path="Admin/File-Case/Case-Form" element={<CaseForm />} />
              <Route path="Admin/Case/:case_number" element={<Case />} />
              <Route path="Admin/Hearings"  element={<Hearings />} />
              <Route path="Admin/Drafts"  element={<Draft />} />
              <Route path="Admin/CaseRecords" element={<CaseRecords />} />
              <Route path="Admin/Generate-Documents" element={<GenerateDocument />} />
              <Route path="Admin/Generate-Docx" element={<GenerateDocx />} />
              <Route path="Admin/Generate-Docx/:case_id" element={<GenerateDocx />} />
              <Route path="Admin/Template-Editor/:templateId" element={<TemplateEditor />} />
              <Route path="Admin/Template-Editor/" element={<TemplateEditor />} />
              <Route path="Admin/Lupon-Management" element={<LuponManagement />} />
              <Route path="Admin/Case-Person-Management" element={<CasePersonManagement />} />
              <Route path="Admin/Case-Person/:id" element={<CasePerson />} />
              <Route path="Admin/Lupon/:id" element={<Lupon />} />
              <Route path="Admin/Reports" element={<Reports />} />
              <Route path="Admin/Settings" element={<Settings />} />
              <Route path="Admin/Hearing/:hearing_id" element={<Hearing />} />
              <Route path="Admin/Case/Hearing-Scheduler/:case_id" element={<HearingScheduler />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </Router>
    </>
  )
}

export default App
