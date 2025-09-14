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
import { Hearings } from './routes/user/Hearings';
import { CaseRecords } from './routes/user/CaseRecords';
import { Calendar } from './routes/user/Calendar';

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
              <Route path=":user/"  element={<UserDashboard />} />
              <Route path=":user/Hearings"  element={<Hearings />} />
              <Route path=":user/CaseRecords" element={<CaseRecords />} />
              <Route path=":user/Calendar" element={<Calendar />} />
              <Route path=":user/File-Case" element={<FileCase />} />
              <Route path=":user/File-Case/Case-Form" element={<CaseForm />} />
            </Route>

            {/* Admin Routes */}
            <Route path="Admin"  element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="Admin/File-Case" element={<FileCase />} />
              <Route path="Admin/File-Case/Case-Form" element={<CaseForm />} />
            </Route>

          </Routes>
        </Router>
    </>
  )
}

export default App
