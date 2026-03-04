import { AuthGuard } from "@/app/components/AuthGuard";
import { ProfileContent } from "./_components/ProfileContent";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8">My Profile</h1>
        <ProfileContent />
      </div>
    </AuthGuard>
  );
}
