import { MockDashboard } from "@/components/mock-dashboard";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MockDashboard />
    </ProtectedRoute>
  );
}
