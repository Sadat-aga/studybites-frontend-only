import { ProtectedRoute } from "@/components/protected-route";
import { StudybitesLibraryPage } from "@/components/studybites-library-page";

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <StudybitesLibraryPage />
    </ProtectedRoute>
  );
}
