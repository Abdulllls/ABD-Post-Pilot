import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AccountsManager from "./pages/AccountsManager";
import CreateBatch from "./pages/CreateBatch";
import SchedulerCalendar from "./pages/SchedulerCalendar";
import QueueManagement from "./pages/QueueManagement";
import PostHistory from "./pages/PostHistory";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<AccountsManager />} />
          <Route path="/create-batch" element={<CreateBatch />} />
          <Route path="/calendar" element={<SchedulerCalendar />} />
          <Route path="/queue" element={<QueueManagement />} />
          <Route path="/history" element={<PostHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
