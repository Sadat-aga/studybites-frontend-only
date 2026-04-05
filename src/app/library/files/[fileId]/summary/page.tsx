import { ProtectedRoute } from "@/components/protected-route";
import { StudybitesSummaryPage } from "@/components/studybites-summary-page";

export default function StudybitesSummaryRoute() {
  return (
    <ProtectedRoute>
      <StudybitesSummaryPage />
    </ProtectedRoute>
  );
}
