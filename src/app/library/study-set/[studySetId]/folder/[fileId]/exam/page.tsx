import { ProtectedRoute } from "@/components/protected-route";
import { StudybitesExamPage } from "@/components/studybites-exam-page";

export default function StudybitesExamRoute() {
  return (
    <ProtectedRoute>
      <StudybitesExamPage />
    </ProtectedRoute>
  );
}
