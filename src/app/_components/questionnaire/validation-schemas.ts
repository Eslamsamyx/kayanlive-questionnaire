import { z } from "zod";
import type { Question } from "./types";

/**
 * Validation schemas for different question types
 */
export const questionValidationSchemas = {
  text: (question: Question) =>
    z
      .string()
      .min(question.minLength || 1, `Minimum ${question.minLength || 1} characters required`)
      .max(question.maxLength || 500, `Maximum ${question.maxLength || 500} characters allowed`)
      .refine((val) => !question.required || val.trim().length > 0, {
        message: "This field is required",
      }),

  textarea: (question: Question) =>
    z
      .string()
      .min(question.minLength || 1, `Minimum ${question.minLength || 1} characters required`)
      .max(question.maxLength || 2000, `Maximum ${question.maxLength || 2000} characters allowed`)
      .refine((val) => !question.required || val.trim().length > 0, {
        message: "This field is required",
      }),

  email: (question: Question) =>
    z
      .string()
      .email("Please enter a valid email address")
      .refine((val) => !question.required || val.length > 0, {
        message: "Email is required",
      }),

  phone: (question: Question) =>
    z
      .string()
      .regex(/^[+]?[\d\s()-]+$/, "Please enter a valid phone number")
      .min(question.minLength || 7, "Phone number is too short")
      .max(question.maxLength || 20, "Phone number is too long")
      .refine((val) => !question.required || val.length > 0, {
        message: "Phone number is required",
      }),

  url: (question: Question) =>
    z
      .string()
      .url("Please enter a valid URL")
      .refine((val) => !question.required || val.length > 0, {
        message: "URL is required",
      }),

  number: (question: Question) =>
    z
      .string()
      .refine((val) => !isNaN(Number(val)), "Please enter a valid number")
      .refine((val) => {
        const num = Number(val);
        if (question.min !== undefined && num < question.min) {
          return false;
        }
        if (question.max !== undefined && num > question.max) {
          return false;
        }
        return true;
      }, {
        message: question.min !== undefined && question.max !== undefined
          ? `Number must be between ${question.min} and ${question.max}`
          : question.min !== undefined
          ? `Number must be at least ${question.min}`
          : `Number must be at most ${question.max}`,
      })
      .refine((val) => !question.required || val.length > 0, {
        message: "This field is required",
      }),

  currency: (question: Question) =>
    z
      .string()
      .refine((val) => !isNaN(Number(val)), "Please enter a valid amount")
      .refine((val) => Number(val) >= 0, "Amount cannot be negative")
      .refine((val) => !question.required || val.length > 0, {
        message: "Amount is required",
      }),

  percentage: (question: Question) =>
    z
      .string()
      .refine((val) => !isNaN(Number(val)), "Please enter a valid percentage")
      .refine((val) => {
        const num = Number(val);
        return num >= 0 && num <= 100;
      }, "Percentage must be between 0 and 100")
      .refine((val) => !question.required || val.length > 0, {
        message: "Percentage is required",
      }),

  select: (question: Question) =>
    z
      .string()
      .refine((val) => !question.required || val.length > 0, {
        message: "Please select an option",
      }),

  "multiple-choice": (question: Question) =>
    z
      .string()
      .refine((val) => !question.required || val.length > 0, {
        message: "Please select an option",
      }),

  checkbox: (question: Question) =>
    z
      .array(z.string())
      .refine(
        (val) => !question.required || val.length > 0,
        {
          message: "Please select at least one option",
        }
      )
      .refine(
        (val) => {
          if (question.minSelections && val.length < question.minSelections) {
            return false;
          }
          if (question.maxSelections && val.length > question.maxSelections) {
            return false;
          }
          return true;
        },
        {
          message: question.minSelections && question.maxSelections
            ? `Select between ${question.minSelections} and ${question.maxSelections} options`
            : question.minSelections
            ? `Select at least ${question.minSelections} options`
            : `Select at most ${question.maxSelections} options`,
        }
      ),

  date: (question: Question) =>
    z
      .string()
      .refine((val) => {
        if (!val && !question.required) return true;
        if (!val && question.required) return false;
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, {
        message: "Please select a valid date",
      })
      .refine((val) => {
        if (!val) return !question.required;
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // For event dates, they should be in the future
        if (question.id === 8 || question.id === 39 || question.id === 40) {
          return date >= today;
        }
        return true;
      }, {
        message: "Date must be in the future",
      }),

  "date-range": (question: Question) =>
    z
      .object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .refine(
        (val) => {
          if (!question.required) return true;
          return val.startDate && val.endDate;
        },
        {
          message: "Both start and end dates are required",
        }
      )
      .refine(
        (val) => {
          if (!val.startDate || !val.endDate) return true;
          const start = new Date(val.startDate);
          const end = new Date(val.endDate);
          return end >= start;
        },
        {
          message: "End date must be after start date",
        }
      ),

  "multi-field": (question: Question) =>
    z.object(
      question.fields?.reduce((acc, field) => {
        if (field.type === "text") {
          acc[field.id] = z
            .string()
            .refine(
              (val) => !field.required || val.trim().length > 0,
              { message: `${field.label} is required` }
            );
        } else if (field.type === "email") {
          acc[field.id] = field.required
            ? z.string().email(`${field.label} must be a valid email`)
            : z.string().email().optional();
        } else if (field.type === "date") {
          acc[field.id] = z
            .string()
            .refine(
              (val) => {
                if (!val && !field.required) return true;
                if (!val && field.required) return false;
                const date = new Date(val);
                return !isNaN(date.getTime());
              },
              { message: `${field.label} must be a valid date` }
            );
        } else {
          acc[field.id] = z
            .string()
            .refine(
              (val) => !field.required || val.length > 0,
              { message: `${field.label} is required` }
            );
        }
        return acc;
      }, {} as Record<string, z.ZodType>) || {}
    ),

  matrix: (question: Question) =>
    z
      .record(z.string())
      .refine(
        (val) => {
          if (!question.required) return true;
          // Check that all rows have been answered
          const answeredRows = Object.keys(val).filter(
            key => !key.endsWith("_quantity")
          );
          return answeredRows.length === (question.rows?.length || 0);
        },
        {
          message: "Please answer all rows",
        }
      )
      .refine(
        (val) => {
          // Validate quantity fields when "Yes" is selected
          for (const [key, value] of Object.entries(val)) {
            if (!key.endsWith("_quantity") && value.toLowerCase() === "yes") {
              const quantityKey = `${key}_quantity`;
              const quantity = val[quantityKey];
              if (!quantity || quantity === "0" || quantity === "") {
                return false;
              }
            }
          }
          return true;
        },
        {
          message: "Please specify quantity for all items marked as 'Yes'",
        }
      ),

  signature: (question: Question) =>
    z
      .string()
      .refine(
        (val) => !question.required || (val && val.startsWith("data:image/")),
        {
          message: "Signature is required",
        }
      ),

  "file-upload": (question: Question) =>
    z
      .array(z.instanceof(File))
      .refine(
        (files) => !question.required || files.length > 0,
        {
          message: "Please upload at least one file",
        }
      )
      .refine(
        (files) => {
          if (!question.maxSize) return true;
          const maxSizeBytes = parseFloat(question.maxSize.replace(/[^0-9.]/g, "")) * 1024 * 1024;
          return files.every(file => file.size <= maxSizeBytes);
        },
        {
          message: `File size must be less than ${question.maxSize}`,
        }
      )
      .refine(
        (files) => {
          if (!question.accept) return true;
          const acceptedExtensions = question.accept
            .split(",")
            .map(ext => ext.trim().toLowerCase());
          return files.every(file => {
            const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
            return acceptedExtensions.includes(fileExt);
          });
        },
        {
          message: `Only ${question.accept} files are allowed`,
        }
      ),

  boolean: (question: Question) =>
    z
      .string()
      .refine(
        (val) => !question.required || (val === "true" || val === "false"),
        {
          message: "Please make a selection",
        }
      ),

  rating: (question: Question) =>
    z
      .string()
      .refine(
        (val) => !question.required || val.length > 0,
        {
          message: "Please select a rating",
        }
      ),

  "star-rating": (question: Question) =>
    z
      .string()
      .refine(
        (val) => !question.required || val.length > 0,
        {
          message: "Please select a rating",
        }
      ),

  slider: (question: Question) =>
    z
      .string()
      .refine(
        (val) => !question.required || val.length > 0,
        {
          message: "Please select a value",
        }
      ),

  // Default validation for unknown types
  default: (question: Question) =>
    question.required
      ? z.any().refine((val) => val !== null && val !== undefined && val !== "", {
          message: "This field is required",
        })
      : z.any().optional(),
};

/**
 * Get validation schema for a specific question
 */
export function getValidationSchema(question: Question): z.ZodType {
  const schemaFactory =
    questionValidationSchemas[question.type as keyof typeof questionValidationSchemas] ||
    questionValidationSchemas.default;

  return schemaFactory(question);
}

/**
 * Validate a single question's answer
 */
export function validateQuestionAnswer(
  question: Question,
  answer: any
): { isValid: boolean; error?: string } {
  try {
    const schema = getValidationSchema(question);
    schema.parse(answer);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || "Invalid input",
      };
    }
    return {
      isValid: false,
      error: "Validation failed",
    };
  }
}

/**
 * Validate all questions in a section
 */
export function validateSection(
  questions: Question[],
  answers: Record<number, any>,
  uploadedFiles: Record<number, File[]>
): { isValid: boolean; errors: Record<number, string> } {
  const errors: Record<number, string> = {};
  let isValid = true;

  for (const question of questions) {
    const answer = question.type === "file-upload"
      ? uploadedFiles[question.id] || []
      : answers[question.id];

    const validation = validateQuestionAnswer(question, answer);
    if (!validation.isValid && validation.error) {
      errors[question.id] = validation.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Business rule validations
 */
export const businessRuleValidations = {
  // Validate that build-up days don't exceed event duration
  validateBuildUpDays: (buildUpDays: string | undefined, eventDuration: string | undefined): boolean => {
    if (!buildUpDays || !eventDuration) return true;
    const buildUp = parseInt(buildUpDays);
    const duration = parseInt(eventDuration.match(/\d+/)?.[0] || "0");
    return buildUp <= duration + 2; // Allow 2 extra days for setup
  },

  // Validate budget allocations
  validateBudget: (fabrication: string, technologies: string): boolean => {
    const fabBudget = parseFloat(fabrication) || 0;
    const techBudget = parseFloat(technologies) || 0;
    // Tech budget shouldn't exceed 40% of total
    return techBudget <= fabBudget * 0.4;
  },

  // Validate stand dimensions
  validateStandDimensions: (dimensions: string): boolean => {
    const match = dimensions.match(/(\d+)\s*[xX]\s*(\d+)/);
    if (!match) return false;
    const width = parseInt(match[1] || "0");
    const height = parseInt(match[2] || "0");
    // Reasonable dimensions: 2x2m to 50x50m
    return width >= 2 && width <= 50 && height >= 2 && height <= 50;
  },

  // Validate maximum height restrictions
  validateHeightRestrictions: (height: string, levels: string): boolean => {
    const maxHeight = parseFloat(height.match(/\d+/)?.[0] || "0");
    const isDoubleLevel = levels?.toLowerCase().includes("double");
    // Double level needs at least 6m height
    return !isDoubleLevel || maxHeight >= 6;
  },
};