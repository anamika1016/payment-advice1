import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import Profile from "./pages/admin/Profile";
import Setting from "./pages/admin/Setting";
import SignInPage from "./pages/SignInPage";
import SetUpPage from "./pages/SetupPage";
import Registeration from "./pages/admin/Registeration";
import Payment from "./pages/admin/Payment";
import PaymentForm from "./components/incidents/PaymentForm"; // Import the PaymentForm

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SignInPage />} />
      <Route path="/signup" element={<SetUpPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registeration" element={<Registeration />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/add_payment" element={<PaymentForm />} />{" "}
        <Route path="/payment/edit_payment" element={<PaymentForm />} />{" "}
        {/* Add this new route */}
        <Route path="/settings" element={<Setting />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<SignInPage />} />
    </Routes>
  );
}
