import Link from "next/link";
import { BothwayLogo } from "@/components/brand/BothwayLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <BothwayLogo size={40} showWordmark />
      <h1 className="text-3xl font-bold text-slate-900 mt-6">Page not found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The page or agreement you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
