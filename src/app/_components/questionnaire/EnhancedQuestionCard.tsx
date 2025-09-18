"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Controller, useFormContext } from "react-hook-form";
import type { Question } from "./types";
import { DateInput } from "./DateInput";
import { RangeSlider } from "./RangeSlider";
import { ValidationError, FieldValidationWrapper } from "./ValidationError";
import { validateQuestionAnswer } from "./validation-schemas";

interface EnhancedQuestionCardProps {
  question: Question;
  onFileUpload: (questionId: number, files: File[]) => void;
}

export function EnhancedQuestionCard({ question, onFileUpload }: EnhancedQuestionCardProps) {
  const {
    control,
    formState: { errors, touchedFields },
    trigger,
    watch,
  } = useFormContext();

  const fieldName = `question_${question.id}`;
  const fieldError = errors[fieldName];
  const isTouched = touchedFields[fieldName];
  const [localValidationError, setLocalValidationError] = useState<string | undefined>();

  // Watch the field value for real-time validation
  const fieldValue = watch(fieldName);

  // Validate on change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fieldValue !== undefined && fieldValue !== null) {
        const validation = validateQuestionAnswer(question, fieldValue);
        setLocalValidationError(validation.error);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [fieldValue, question]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFileUpload(question.id, selectedFiles);
    // Trigger validation after file upload
    trigger(fieldName);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-[#7afdd6]", "bg-[#7afdd6]/10");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-[#7afdd6]", "bg-[#7afdd6]/10");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-[#7afdd6]", "bg-[#7afdd6]/10");
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFileUpload(question.id, droppedFiles);
    trigger(fieldName);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{
              required: question.required ? "This field is required" : false,
              pattern: question.type === "email"
                ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" }
                : question.type === "phone"
                ? { value: /^[+]?[\d\s()-]+$/, message: "Invalid phone number" }
                : question.type === "url"
                ? { value: /^https?:\/\/.+/, message: "Invalid URL" }
                : undefined,
              minLength: question.minLength
                ? { value: question.minLength, message: `Minimum ${question.minLength} characters` }
                : undefined,
              maxLength: question.maxLength
                ? { value: question.maxLength, message: `Maximum ${question.maxLength} characters` }
                : undefined,
            }}
            render={({ field, fieldState }) => (
              <FieldValidationWrapper
                error={fieldState.error?.message || localValidationError}
                touched={fieldState.isTouched}
              >
                <input
                  {...field}
                  type={
                    question.type === "email" ? "email" :
                    question.type === "phone" ? "tel" :
                    question.type === "url" ? "url" : "text"
                  }
                  placeholder={question.placeholder}
                  className={`w-full p-3 bg-white/[0.08] border rounded-lg text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${fieldState.error
                      ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/25"
                      : "border-white/[0.15] focus:border-[#7afdd6] focus:ring-[#7afdd6]/25"
                    }
                    focus:bg-white/[0.12]`}
                  onBlur={() => {
                    field.onBlur();
                    trigger(fieldName);
                  }}
                />
              </FieldValidationWrapper>
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{
              required: question.required ? "This field is required" : false,
              minLength: question.minLength
                ? { value: question.minLength, message: `Minimum ${question.minLength} characters` }
                : undefined,
              maxLength: question.maxLength
                ? { value: question.maxLength, message: `Maximum ${question.maxLength} characters` }
                : undefined,
            }}
            render={({ field, fieldState }) => (
              <FieldValidationWrapper
                error={fieldState.error?.message || localValidationError}
                touched={fieldState.isTouched}
              >
                <div className="relative">
                  <textarea
                    {...field}
                    placeholder={question.placeholder}
                    rows={4}
                    className={`w-full p-3 bg-white/[0.08] border rounded-lg text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 transition-all duration-200 resize-vertical min-h-[100px]
                      ${fieldState.error
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/25"
                        : "border-white/[0.15] focus:border-[#7afdd6] focus:ring-[#7afdd6]/25"
                      }
                      focus:bg-white/[0.12]`}
                    onBlur={() => {
                      field.onBlur();
                      trigger(fieldName);
                    }}
                  />
                  {question.maxLength && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {field.value?.length || 0}/{question.maxLength}
                    </div>
                  )}
                </div>
              </FieldValidationWrapper>
            )}
          />
        );

      case "number":
      case "currency":
      case "percentage":
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{
              required: question.required ? "This field is required" : false,
              validate: (value) => {
                if (!value && !question.required) return true;
                const num = parseFloat(value);
                if (isNaN(num)) return "Please enter a valid number";
                if (question.type === "percentage" && (num < 0 || num > 100)) {
                  return "Percentage must be between 0 and 100";
                }
                if (question.type === "currency" && num < 0) {
                  return "Amount cannot be negative";
                }
                if (question.min !== undefined && num < question.min) {
                  return `Minimum value is ${question.min}`;
                }
                if (question.max !== undefined && num > question.max) {
                  return `Maximum value is ${question.max}`;
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <FieldValidationWrapper
                error={fieldState.error?.message || localValidationError}
                touched={fieldState.isTouched}
              >
                <div className="flex items-center">
                  {question.type === "currency" && (
                    <span className="px-3 py-3 bg-white/[0.08] border border-r-0 border-white/[0.15] rounded-l-lg text-gray-300 text-sm">
                      {question.currency || "$"}
                    </span>
                  )}
                  <input
                    {...field}
                    type="number"
                    placeholder={question.type === "currency" ? "0.00" : question.placeholder}
                    min={question.min}
                    max={question.max}
                    step={question.step || (question.type === "currency" ? "0.01" : "1")}
                    className={`flex-1 p-3 bg-white/[0.08] border text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 transition-all duration-200
                      ${question.type === "currency" ? "rounded-r-lg" : "rounded-lg"}
                      ${fieldState.error
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/25"
                        : "border-white/[0.15] focus:border-[#7afdd6] focus:ring-[#7afdd6]/25"
                      }
                      focus:bg-white/[0.12]`}
                    onBlur={() => {
                      field.onBlur();
                      trigger(fieldName);
                    }}
                  />
                  {question.type === "percentage" && (
                    <span className="px-3 py-3 bg-white/[0.08] border border-l-0 border-white/[0.15] rounded-r-lg text-gray-300 text-sm">
                      %
                    </span>
                  )}
                </div>
              </FieldValidationWrapper>
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{
              required: question.required ? "Please select an option" : false,
            }}
            render={({ field, fieldState }) => (
              <FieldValidationWrapper
                error={fieldState.error?.message || localValidationError}
                touched={fieldState.isTouched}
              >
                <select
                  {...field}
                  className={`w-full p-3 bg-white/[0.08] border rounded-lg text-white
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${fieldState.error
                      ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/25"
                      : "border-white/[0.15] focus:border-[#7afdd6] focus:ring-[#7afdd6]/25"
                    }
                    focus:bg-white/[0.12]
                    ${!field.value ? "text-gray-400" : "text-white"}`}
                  onBlur={() => {
                    field.onBlur();
                    trigger(fieldName);
                  }}
                >
                  <option value="" disabled>Select an option...</option>
                  {question.options?.map((option, index) => (
                    <option
                      key={index}
                      value={typeof option === "string" ? option : option.value}
                      className="bg-[#2c2c2b] text-white"
                    >
                      {typeof option === "string" ? option : option.label}
                    </option>
                  ))}
                </select>
              </FieldValidationWrapper>
            )}
          />
        );

      case "date":
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{
              required: question.required ? "Please select a date" : false,
              validate: (value) => {
                if (!value && !question.required) return true;
                const date = new Date(value);
                if (isNaN(date.getTime())) return "Please select a valid date";

                // For future date validation
                if (question.id === 8 || question.id === 39 || question.id === 40) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return "Date must be in the future";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <FieldValidationWrapper
                error={fieldState.error?.message || localValidationError}
                touched={fieldState.isTouched}
              >
                <DateInput
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    trigger(fieldName);
                  }}
                  placeholder={question.placeholder}
                  required={question.required}
                />
              </FieldValidationWrapper>
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={[]}
            rules={{
              validate: (value) => {
                if (!question.required && (!value || value.length === 0)) return true;
                if (question.required && (!value || value.length === 0)) {
                  return "Please select at least one option";
                }
                if (question.minSelections && value.length < question.minSelections) {
                  return `Select at least ${question.minSelections} options`;
                }
                if (question.maxSelections && value.length > question.maxSelections) {
                  return `Select at most ${question.maxSelections} options`;
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <FieldValidationWrapper
                error={fieldState.error?.message || localValidationError}
                touched={fieldState.isTouched}
              >
                <div className="space-y-3">
                  {field.value?.length > 0 && (
                    <motion.div
                      className="p-2.5 bg-gradient-to-r from-[#7afdd6]/[0.1] to-[#b8a4ff]/[0.1] backdrop-blur-sm border border-[#7afdd6]/[0.25] rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="text-[#7afdd6] text-sm font-medium">
                        {field.value.length} selected
                      </span>
                    </motion.div>
                  )}

                  {question.options?.map((option, index) => {
                    const optionValue = typeof option === "string" ? option : option.value;
                    const isSelected = field.value?.includes(optionValue);

                    return (
                      <motion.label
                        key={index}
                        className={`relative flex items-center p-3 cursor-pointer rounded-lg backdrop-blur-sm border transition-all duration-200 group ${
                          isSelected
                            ? "bg-gradient-to-r from-[#7afdd6]/[0.15] to-[#b8a4ff]/[0.15] border-[#7afdd6]/[0.4] shadow-sm"
                            : "bg-white/[0.04] border-white/[0.12] hover:border-[#7afdd6]/[0.3] hover:bg-[#7afdd6]/[0.08]"
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <input
                          type="checkbox"
                          value={optionValue}
                          checked={isSelected}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...(field.value || []), optionValue]
                              : field.value?.filter((v: string) => v !== optionValue) || [];
                            field.onChange(newValue);
                            trigger(fieldName);
                          }}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center mr-4 ${
                          isSelected
                            ? "border-[#7afdd6] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] shadow-lg shadow-[#7afdd6]/30"
                            : "border-white/50 bg-white/10 group-hover:border-[#7afdd6]"
                        }`}>
                          {isSelected && (
                            <motion.svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </motion.svg>
                          )}
                        </div>
                        <span className={`font-medium transition-colors duration-200 ${
                          isSelected ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          {typeof option === "string" ? option : option.label}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              </FieldValidationWrapper>
            )}
          />
        );

      // Add more question type implementations as needed...

      default:
        return (
          <div className="text-center text-gray-400 p-8">
            Question type "{question.type}" implementation in progress
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-r from-white/[0.06] to-white/[0.1] backdrop-blur-sm rounded-xl p-6 border transition-all duration-300
        ${localValidationError && isTouched
          ? "border-red-400/30 hover:border-red-400/40"
          : "border-white/[0.12] hover:border-white/[0.18]"
        }
        hover:from-white/[0.08] hover:to-white/[0.12]`}
    >
      <div className="mb-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-white leading-tight pr-4">{question.question}</h3>
          {question.required && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/[0.15] text-red-400 border border-red-500/[0.25]">
                Required
              </span>
            </div>
          )}
        </div>
        {question.helpText && (
          <p className="text-gray-400 text-sm leading-relaxed">{question.helpText}</p>
        )}
      </div>

      <div className="space-y-3">
        {renderQuestionContent()}
      </div>
    </motion.div>
  );
}