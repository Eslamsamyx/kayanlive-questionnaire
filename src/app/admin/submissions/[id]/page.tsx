"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";

interface SubmissionDetailPageProps {
  params: {
    id: string;
  };
}

export default function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get submission details
  const { data: submission, isLoading, error } = api.questionnaire.getSubmission.useQuery({
    id: params.id
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2c2c2b] flex items-center justify-center">
        <div className="text-white">Loading submission...</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-[#2c2c2b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Submission Not Found</h1>
          <p className="text-gray-400 mb-6">The submission you're looking for doesn't exist.</p>
          <Link
            href="/admin/submissions"
            className="bg-[#7afdd6] text-[#2c2c2b] px-6 py-3 rounded-lg font-medium hover:bg-[#6ee8c5] transition-colors"
          >
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  // Group answers by section
  const answersBySection = submission.answers.reduce((acc, answer) => {
    const section = answer.section || "General";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(answer);
    return acc;
  }, {} as Record<string, typeof submission.answers>);

  const formatAnswerValue = (answer: typeof submission.answers[0]) => {
    if (answer.jsonValue) {
      if (typeof answer.jsonValue === 'object' && answer.jsonValue !== null) {
        // Handle multi-field answers
        if (answer.questionType === 'multi-field') {
          return Object.entries(answer.jsonValue as Record<string, string>)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ');
        }
        // Handle checkbox arrays
        if (Array.isArray(answer.jsonValue)) {
          return (answer.jsonValue as string[]).join(', ');
        }
        // Handle matrix answers
        return JSON.stringify(answer.jsonValue, null, 2);
      }
      return String(answer.jsonValue);
    }
    return answer.textValue || "No answer";
  };

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
                    src="/823c27de600ccd2f92af3e073c8e10df3a192e5c.png"
                    alt="Kayan Live Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Submission Details</h1>
                <p className="text-gray-400">{submission.companyName || "Unknown Company"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/submissions"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Submissions
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
        {/* Submission Info */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Company</h3>
              <p className="text-white font-medium">{submission.companyName || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Contact Person</h3>
              <p className="text-white font-medium">{submission.contactPerson || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Email</h3>
              <p className="text-white font-medium">{submission.email || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Industry</h3>
              <p className="text-white font-medium">{submission.industry || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Submitted</h3>
              <p className="text-white font-medium">
                {new Date(submission.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  submission.isComplete
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {submission.isComplete ? "Complete" : "Draft"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Total Answers</h3>
              <p className="text-white font-medium">{submission.answers.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Files Uploaded</h3>
              <p className="text-white font-medium">{submission.uploadedFiles.length}</p>
            </div>
          </div>
        </div>

        {/* Answers by Section */}
        <div className="space-y-6">
          {Object.entries(answersBySection).map(([sectionName, answers]) => (
            <div key={sectionName} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
                {sectionName}
              </h2>
              <div className="grid gap-6">
                {answers.map((answer) => (
                  <div key={answer.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-white">
                        Question {answer.questionId}
                      </h3>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                        {answer.questionType}
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm mb-3">
                      {formatAnswerValue(answer)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Uploaded Files */}
        {submission.uploadedFiles.length > 0 && (
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
              Uploaded Files
            </h2>
            <div className="grid gap-4">
              {submission.uploadedFiles.map((file) => (
                <div key={file.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{file.originalName}</h4>
                      <p className="text-sm text-gray-400">
                        Question {file.questionId} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.mimeType}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="bg-[#7afdd6] text-[#2c2c2b] px-4 py-2 rounded-lg font-medium hover:bg-[#6ee8c5] transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/admin/submissions"
            className="bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
          >
            ← Back to Submissions
          </Link>
          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Export PDF
            </button>
            <button className="bg-[#7afdd6] text-[#2c2c2b] px-6 py-3 rounded-lg font-medium hover:bg-[#6ee8c5] transition-colors">
              Email Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}