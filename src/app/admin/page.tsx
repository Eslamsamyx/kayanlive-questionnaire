"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get statistics
  const { data: stats, isLoading: statsLoading } = api.questionnaire.getStats.useQuery();
  const { data: submissionsData, isLoading: submissionsLoading } = api.questionnaire.getAllSubmissions.useQuery({
    limit: 5 // Only get latest 5 for dashboard
  });

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/admin/login");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#2c2c2b] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#2c2c2b]">
      {/* Header */}
      <header className="bg-[#2c2c2b] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-10">
                <Image
                  src="/kayan-logo-official.png"
                  alt="Kayan Live Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Questionnaire Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {session.user.name}</span>
              <button
                onClick={() => {
                  import("next-auth/react").then(({ signOut }) => signOut());
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100">Total Submissions</dt>
                  <dd className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.totalSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100">Completed</dt>
                  <dd className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.completedSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-100">Completion Rate</dt>
                  <dd className="text-2xl font-bold">
                    {statsLoading ? "..." : `${stats?.completionRate || 0}%`}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100">This Week</dt>
                  <dd className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.recentSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Submissions</h2>
              <Link
                href="/admin/submissions"
                className="bg-[#7afdd6] text-[#2c2c2b] px-4 py-2 rounded-lg font-medium hover:bg-[#6ee8c5] transition-colors"
              >
                View All
              </Link>
            </div>

            {submissionsLoading ? (
              <div className="text-gray-400">Loading submissions...</div>
            ) : submissionsData?.submissions && submissionsData.submissions.length > 0 ? (
              <div className="space-y-4">
                {submissionsData.submissions.map((submission) => (
                  <div key={submission.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">
                          {submission.companyName || "Unknown Company"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {submission.contactPerson} • {submission.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.isComplete
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {submission.isComplete ? "Complete" : "Draft"}
                        </span>
                        <Link
                          href={`/admin/submissions/${submission.id}`}
                          className="text-[#7afdd6] hover:text-[#6ee8c5] text-sm font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No submissions yet
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                href="/admin/submissions"
                className="block w-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] p-4 rounded-lg font-medium hover:from-[#6ee8c5] hover:to-[#a694ff] transition-all"
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Submissions
                </div>
              </Link>

              <Link
                href="/questionnaire/project-brief"
                className="block w-full bg-white/10 text-white p-4 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Preview Questionnaire
                </div>
              </Link>

              <button className="block w-full bg-white/10 text-white p-4 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}