import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";
import { sanitizationUtils } from "~/server/utils/sanitization";

// Schema for submission data
const SubmissionAnswerSchema = z.object({
  questionId: z.number(),
  questionType: z.string(),
  section: z.string(),
  textValue: z.string().nullable().optional(),
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
  email: z.string().email().optional().nullable(),
  industry: z.string().optional(),
  answers: z.array(SubmissionAnswerSchema),
  uploadedFiles: z.array(FileUploadSchema).optional().default([]),
  isComplete: z.boolean().default(true),
});

export const questionnaireRouter = createTRPCRouter({
  // Save draft - public procedure for auto-save
  saveDraft: publicProcedure
    .input(
      z.object({
        questionnaireId: z.string(),
        answers: z.array(SubmissionAnswerSchema),
        companyName: z.string().optional(),
        contactPerson: z.string().optional(),
        email: z.string().email().optional().nullable(),
        industry: z.string().optional(),
        draftId: z.string().optional(), // For updating existing draft
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Sanitize inputs
        const sanitizedData = {
          companyName: input.companyName
            ? sanitizationUtils.sanitizeCompanyName(input.companyName)
            : null,
          contactPerson: input.contactPerson
            ? sanitizationUtils.sanitizeText(input.contactPerson)
            : null,
          email: input.email
            ? sanitizationUtils.sanitizeEmail(input.email)
            : null,
          industry: input.industry
            ? sanitizationUtils.sanitizeText(input.industry)
            : null,
        };

        if (input.draftId) {
          // Update existing draft
          const draft = await ctx.db.questionnaireSubmission.update({
            where: { id: input.draftId },
            data: {
              ...sanitizedData,
              updatedAt: new Date(),
              answers: {
                deleteMany: {},
                create: input.answers.map((answer) => ({
                  questionId: answer.questionId,
                  questionType: sanitizationUtils.sanitizeText(answer.questionType) || answer.questionType,
                  section: sanitizationUtils.sanitizeText(answer.section) || answer.section,
                  textValue: answer.textValue
                    ? sanitizationUtils.sanitizeText(answer.textValue)
                    : null,
                  jsonValue: answer.jsonValue
                    ? sanitizationUtils.sanitizeJson(answer.jsonValue)
                    : null,
                })),
              },
            },
          });

          return {
            success: true,
            draftId: draft.id,
            message: "Draft saved",
          };
        } else {
          // Create new draft
          const draft = await ctx.db.questionnaireSubmission.create({
            data: {
              questionnaireId: input.questionnaireId,
              ...sanitizedData,
              isComplete: false,
              answers: {
                create: input.answers.map((answer) => ({
                  questionId: answer.questionId,
                  questionType: sanitizationUtils.sanitizeText(answer.questionType) || answer.questionType,
                  section: sanitizationUtils.sanitizeText(answer.section) || answer.section,
                  textValue: answer.textValue
                    ? sanitizationUtils.sanitizeText(answer.textValue)
                    : null,
                  jsonValue: answer.jsonValue
                    ? sanitizationUtils.sanitizeJson(answer.jsonValue)
                    : null,
                })),
              },
            },
          });

          return {
            success: true,
            draftId: draft.id,
            message: "Draft created",
          };
        }
      } catch (error) {
        console.error("Error saving draft:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save draft",
        });
      }
    }),

  // Submit questionnaire - public procedure
  submit: publicProcedure
    .input(QuestionnaireSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Sanitize all text inputs before saving
        const sanitizedCompanyName = input.companyName
          ? sanitizationUtils.sanitizeCompanyName(input.companyName)
          : null;
        const sanitizedContactPerson = input.contactPerson
          ? sanitizationUtils.sanitizeText(input.contactPerson)
          : null;
        const sanitizedEmail = input.email
          ? sanitizationUtils.sanitizeEmail(input.email)
          : null;
        const sanitizedIndustry = input.industry
          ? sanitizationUtils.sanitizeText(input.industry)
          : null;

        // Use database transaction for data integrity
        const submission = await ctx.db.$transaction(async (tx) => {
          const newSubmission = await tx.questionnaireSubmission.create({
            data: {
              questionnaireId: sanitizationUtils.sanitizeText(input.questionnaireId) || input.questionnaireId,
              companyName: sanitizedCompanyName,
              contactPerson: sanitizedContactPerson,
              email: sanitizedEmail,
              industry: sanitizedIndustry,
              isComplete: input.isComplete,
              submittedAt: input.isComplete ? new Date() : null,
              answers: {
                create: input.answers.map((answer) => ({
                  questionId: answer.questionId,
                  questionType: sanitizationUtils.sanitizeText(answer.questionType) || answer.questionType,
                  section: sanitizationUtils.sanitizeText(answer.section) || answer.section,
                  textValue: answer.textValue
                    ? sanitizationUtils.sanitizeText(answer.textValue)
                    : null,
                  jsonValue: answer.jsonValue
                    ? sanitizationUtils.sanitizeJson(answer.jsonValue)
                    : null,
                })),
              },
              uploadedFiles: {
                create: input.uploadedFiles?.map((file) => {
                  const sanitizedMetadata = sanitizationUtils.sanitizeFileMetadata({
                    fileName: file.fileName,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    filePath: file.filePath,
                  });

                  return {
                    questionId: file.questionId,
                    fileName: sanitizedMetadata.fileName || file.fileName,
                    originalName: sanitizedMetadata.originalName || file.originalName,
                    fileSize: file.fileSize,
                    mimeType: sanitizedMetadata.mimeType || file.mimeType,
                    filePath: sanitizedMetadata.filePath || file.filePath,
                  };
                }) || [],
              },
            },
            include: {
              answers: true,
              uploadedFiles: true,
            },
          });

          return newSubmission;
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
          message: "Failed to submit questionnaire. Please try again.",
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