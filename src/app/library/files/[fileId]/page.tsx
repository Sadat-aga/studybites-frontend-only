import { ProtectedRoute } from "@/components/protected-route";
import { StudybitesFilePage } from "@/components/studybites-file-page";

export default function StudybitesFileDetailPage() {
  return (
    <ProtectedRoute>
      <StudybitesFilePage />
    </ProtectedRoute>
  );
}
