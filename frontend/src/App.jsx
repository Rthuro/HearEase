import {HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './routes/admin/AdminLayout';
import { UserLayout } from './routes/user/UserLayout';
import { Dashboard } from './routes/admin/Dashboard';
import { Authentication } from './routes/Authentication';
import { HomePage } from './routes/public/HomePage';
import { UserDashboard } from './routes/user/UserDashboard';
import { PublicLayout } from './routes/public/PublicLayout';
import { About } from './routes/public/About';
import { Services } from './routes/public/Services';
import { CaseStatus } from './routes/public/CaseStatus';
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
import { useCaseStore } from './store/useCaseStore';
import useHearingStore from './store/useHearingStore';
import { Profile } from './routes/Profile';

function App() {
  const { initializeAuth } = useAuthenticationStore();
  const { fetchCases, cases} = useCaseStore();
  const { fetchHearings, hearings } = useHearingStore();

  useEffect(() => {
    fetchCases();
    fetchHearings();
  }, [fetchCases, fetchHearings]);

  console.log("Hearings:", hearings)
  console.log("Cases:", cases)

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
              <Route path="/About" element={<About />} />
              <Route path="/Services" element={<Services />} />
              <Route path="/Case" element={<CaseStatus />} />
              <Route path="/Login" element={<Authentication />} />
              <Route path="/SignUp" element={<SignUp />} />
            </Route>
            
            {/* User Routes */}
            <Route   element={<UserLayout />}>
              <Route path="u/:user/"  element={<UserDashboard />} />
              <Route path="u/:user/Hearings"  element={<Hearings />} />
              <Route path="u/:user/CaseRecords" element={<CaseRecords />} />
              <Route path="u/:user/Calendar" element={<Calendar />} />
              <Route path="u/:user/File-Case" element={<FileCase />} />
              <Route path="u/:user/File-Case/Case-Form" element={<CaseForm />} />
              <Route path="u/:user/Case/:case_number" element={<Case />} />
              <Route path="u/:user/Profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route  element={<AdminLayout />}>
              <Route path='Admin/' element={<Dashboard />} />
              <Route path="Admin/File-Case" element={<FileCase />} />
              <Route path="Admin/Calendar" element={<Calendar />} />
              <Route path="Admin/File-Case/Case-Form" element={<CaseForm />} />
              <Route path="Admin/Case/:case_number" element={<Case />} />
              <Route path="Admin/Hearings"  element={<Hearings />} />
              <Route path="Admin/CaseRecords" element={<CaseRecords />} />
              <Route path="Admin/Generate-Documents" element={<GenerateDocument />} />
              <Route path="Admin/Lupon-Management" element={<LuponManagement />} />
              <Route path="Admin/Profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </Router>
    </>
  )
}

export default App
