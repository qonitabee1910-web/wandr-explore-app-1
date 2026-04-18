import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { ShuttleBookingProvider } from "@/context/ShuttleBookingContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Shuttle from "./pages/Shuttle";
import SeatLayoutEditor from "./pages/SeatLayoutEditor";
import Ride from "./pages/Ride";
import Promos from "./pages/Promos";
import Account from "./pages/Account";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/admin/Dashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPromos from "./pages/admin/AdminPromos";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminRoutes from "./pages/admin/AdminRoutes";
import ShuttleBooking from "./pages/ShuttleBooking";
import ShuttleBookingHistory from "./pages/ShuttleBookingHistory";
import AdminShuttleUsers from "./pages/admin/AdminShuttleUsers";
import AdminRayonManagement from "./pages/admin/AdminRayonManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserAuthProvider>
        <ShuttleBookingProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/shuttle-booking" element={<ShuttleBooking />} />

            {/* Protected user */}
            <Route path="/shuttle" element={<ProtectedRoute><Shuttle /></ProtectedRoute>} />
            <Route path="/shuttle-booking-history" element={<ProtectedRoute><ShuttleBookingHistory /></ProtectedRoute>} />
            <Route path="/ride" element={<ProtectedRoute><Ride /></ProtectedRoute>} />
            <Route path="/promos" element={<ProtectedRoute><Promos /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="promos" element={<AdminPromos />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="schedules" element={<AdminSchedules />} />
              <Route path="routes" element={<AdminRoutes />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="shuttle-users" element={<AdminShuttleUsers />} />
              <Route path="rayon-management" element={<AdminRayonManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route
              path="/admin/seat-editor"
              element={<AdminRoute><SeatLayoutEditor /></AdminRoute>}
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ShuttleBookingProvider>
      </UserAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
