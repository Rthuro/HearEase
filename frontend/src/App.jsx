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

function App() {

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/About" element={<About />} />
              <Route path="/Services" element={<Services />} />
              <Route path="/Case" element={<CaseStatus />} />
              <Route path="/Login" element={<Authentication />} />
            </Route>
            
            {/* User Routes */}
            <Route path="/User" element={<UserLayout />}>
              <Route index  element={<UserDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/Admin"  element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
            </Route>

          </Routes>
        </Router>
    </>
  )
}

export default App
