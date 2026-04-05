import { ProtectedRoute } from "@/components/protected-route";
import { StudybitesMcqContentPage } from "@/components/studybites-mcq-content-page";

export default function McqContentPage() {
  return (
    <ProtectedRoute>
      <StudybitesMcqContentPage />
    </ProtectedRoute>
  );
}
