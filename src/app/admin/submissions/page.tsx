"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function SubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  // Get submissions
  const { data: submissionsData, isLoading, fetchNextPage, hasNextPage } =
    api.questionnaire.getAllSubmissions.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "ADMIN") {
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

  const allSubmissions = submissionsData?.pages.flatMap(page => page.submissions) ?? [];

  return (
    <div className="min-h-screen bg-[#2c2c2b]">
      {/* Header */}
      <header className="bg-[#2c2c2b] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-4">
                <div className="relative w-20 h-10">
                  <Image
                    src="/kayan-logo-official.png"
                    alt="Kayan Live Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Submissions</h1>
                  <p className="text-gray-400">All questionnaire submissions</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
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
        {/* Stats Header */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Questionnaire Submissions</h2>
              <p className="text-gray-400">
                Total: {allSubmissions.length} submissions
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-[#7afdd6] text-[#2c2c2b] px-4 py-2 rounded-lg font-medium hover:bg-[#6ee8c5] transition-colors">
                Export CSV
              </button>
              <button className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              Loading submissions...
            </div>
          ) : allSubmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
              <p className="text-gray-400">Submissions will appear here once users complete the questionnaire.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Company / Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {allSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {submission.companyName || "Unknown Company"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {submission.contactPerson}
                            </div>
                            <div className="text-xs text-gray-500">
                              {submission.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.industry || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(submission.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              submission.isComplete
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {submission.isComplete ? "Complete" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/submissions/${submission.id}`}
                            className="text-[#7afdd6] hover:text-[#6ee8c5] mr-4"
                          >
                            View Details
                          </Link>
                          <button className="text-gray-400 hover:text-gray-300">
                            Export
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="px-6 py-4 border-t border-white/10">
                  <button
                    onClick={() => fetchNextPage()}
                    className="w-full bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Load More Submissions
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}