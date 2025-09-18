import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";

// Schema for submission data
const SubmissionAnswerSchema = z.object({
  questionId: z.number(),
  questionType: z.string(),
  section: z.string(),
  textValue: z.string().optional(),
  jsonValue: z.any().optional(),
});

const FileUploadSchema = z.object({
  questionId: z.number(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  filePath: z.string(),
});

const QuestionnaireSubmissionSchema = z.object({
  questionnaireId: z.string(),
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  industry: z.string().optional(),
  answers: z.array(SubmissionAnswerSchema),
  uploadedFiles: z.array(FileUploadSchema).optional().default([]),
  isComplete: z.boolean().default(true),
});

export const questionnaireRouter = createTRPCRouter({
  // Submit questionnaire - public procedure
  submit: publicProcedure
    .input(QuestionnaireSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const submission = await ctx.db.questionnaireSubmission.create({
          data: {
            questionnaireId: input.questionnaireId,
            companyName: input.companyName,
            contactPerson: input.contactPerson,
            email: input.email,
            industry: input.industry,
            isComplete: input.isComplete,
            submittedAt: input.isComplete ? new Date() : null,
            answers: {
              create: input.answers.map((answer) => ({
                questionId: answer.questionId,
                questionType: answer.questionType,
                section: answer.section,
                textValue: answer.textValue,
                jsonValue: answer.jsonValue,
              })),
            },
            uploadedFiles: {
              create: input.uploadedFiles?.map((file) => ({
                questionId: file.questionId,
                fileName: file.fileName,
                originalName: file.originalName,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                filePath: file.filePath,
              })) || [],
            },
          },
          include: {
            answers: true,
            uploadedFiles: true,
          },
        });

        return {
          success: true,
          submissionId: submission.id,
          message: "Questionnaire submitted successfully",
        };
      } catch (error) {
        console.error("Error submitting questionnaire:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit questionnaire",
        });
      }
    }),

  // Get all submissions - admin only
  getAllSubmissions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        questionnaireId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const submissions = await ctx.db.questionnaireSubmission.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.questionnaireId
          ? { questionnaireId: input.questionnaireId }
          : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          answers: true,
          uploadedFiles: true,
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (submissions.length > input.limit) {
        const nextItem = submissions.pop();
        nextCursor = nextItem!.id;
      }

      return {
        submissions,
        nextCursor,
      };
    }),

  // Get specific submission - admin only
  getSubmission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const submission = await ctx.db.questionnaireSubmission.findUnique({
        where: { id: input.id },
        include: {
          answers: {
            orderBy: { questionId: "asc" },
          },
          uploadedFiles: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      return submission;
    }),

  // Get submission statistics - admin only
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.session.user.role !== UserRole.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const [totalSubmissions, completedSubmissions, recentSubmissions] = await Promise.all([
      ctx.db.questionnaireSubmission.count(),
      ctx.db.questionnaireSubmission.count({
        where: { isComplete: true },
      }),
      ctx.db.questionnaireSubmission.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalSubmissions,
      completedSubmissions,
      recentSubmissions,
      completionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0,
    };
  }),
});