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
import { Calendar } from './routes/user/Calendar';
import { Case } from './routes/Case';
import { NotFound } from './routes/NotFound';

function App() {

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
            </Route>

            {/* Admin Routes */}
            <Route  element={<AdminLayout />}>
              <Route path='Admin/' element={<Dashboard />} />
              <Route path="Admin/File-Case" element={<FileCase />} />
              <Route path="Admin/File-Case/Case-Form" element={<CaseForm />} />
              <Route path="Admin/Case/:case_number" element={<Case />} />
              <Route path="Admin/Hearings"  element={<Hearings />} />
              <Route path="Admin/CaseRecords" element={<CaseRecords />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </Router>
    </>
  )
}

export default App
