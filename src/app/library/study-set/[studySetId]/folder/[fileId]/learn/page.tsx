import { ProtectedRoute } from "@/components/protected-route";
import { StudybitesFlashcardsPage } from "@/components/studybites-flashcards-page";

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <StudybitesFlashcardsPage />
    </ProtectedRoute>
  );
}
