"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuestionCard } from "./QuestionCard";
import { ThankYouScreen } from "./ThankYouScreen";
import { ProgressBar } from "./ProgressBar";
import { NavigationButtons } from "./NavigationButtons";
import type { Question, QuestionnaireData } from "./types";

const QUESTIONNAIRE_DATA: Record<string, QuestionnaireData> = {
  "project-brief": {
    title: "Project Brief Questionnaire",
    description: "We appreciate your consideration of Serotonin Technologies for your upcoming event. To enable us to provide a comprehensive and precise proposal with competitive pricing, we kindly request the following information:",
    questions: [
      // Section 1: CLIENT DETAILS
      {
        id: 1,
        type: "text",
        question: "Company Name",
        placeholder: "Enter your company name",
        required: true,
        section: "Client Details",
        helpText: "Full legal name of your company"
      },
      {
        id: 2,
        type: "select",
        question: "Country",
        options: [
          "United Arab Emirates",
          "Saudi Arabia",
          "Qatar",
          "Kuwait",
          "Bahrain",
          "Oman",
          "Egypt",
          "Jordan",
          "Lebanon",
          "Other"
        ],
        required: true,
        section: "Client Details"
      },
      {
        id: 3,
        type: "select",
        question: "Industry",
        options: [
          "Technology",
          "Healthcare",
          "Finance & Banking",
          "Oil & Gas",
          "Construction",
          "Real Estate",
          "Automotive",
          "Education",
          "Government",
          "Retail",
          "Manufacturing",
          "Telecommunications",
          "Other"
        ],
        required: true,
        section: "Client Details"
      },
      {
        id: 4,
        type: "text",
        question: "Contact Person",
        placeholder: "Full name of primary contact",
        required: true,
        section: "Client Details"
      },
      {
        id: 5,
        type: "phone",
        question: "Mobile Number",
        placeholder: "+971 50 123 4567",
        required: true,
        section: "Client Details"
      },
      {
        id: 6,
        type: "email",
        question: "Email Address",
        placeholder: "contact@company.com",
        required: true,
        section: "Client Details"
      },

      // Section 2: EVENT DETAILS
      {
        id: 7,
        type: "text",
        question: "Event Name",
        placeholder: "Name of the exhibition or event",
        required: true,
        section: "Event Details"
      },
      {
        id: 8,
        type: "date",
        question: "Event Date",
        placeholder: "Select event start date",
        required: true,
        section: "Event Details"
      },
      {
        id: 9,
        type: "text",
        question: "Event Duration",
        placeholder: "e.g., 3 days, 1 week",
        required: true,
        section: "Event Details"
      },
      {
        id: 10,
        type: "select",
        question: "Indoor or Outdoor",
        options: ["Indoor", "Outdoor", "Mixed (Indoor & Outdoor)"],
        required: true,
        section: "Event Details"
      },
      {
        id: 11,
        type: "text",
        question: "Build-up Days",
        placeholder: "Number of days required for setup",
        required: false,
        section: "Event Details"
      },
      {
        id: 12,
        type: "file-upload",
        question: "Floor Plan",
        accept: ".pdf,.jpg,.jpeg,.png,.dwg",
        multiple: false,
        maxSize: "10MB",
        required: false,
        section: "Event Details",
        helpText: "Upload venue floor plan if available"
      },

      // Section 3: STAND DETAILS
      {
        id: 13,
        type: "text",
        question: "Hall & Stand Number",
        placeholder: "e.g., Hall 3, Stand 3A-15",
        required: false,
        section: "Stand Details"
      },
      {
        id: 14,
        type: "text",
        question: "Stand Dimension",
        placeholder: "e.g., 6m x 4m, 100 sqm",
        required: true,
        section: "Stand Details"
      },
      {
        id: 15,
        type: "text",
        question: "Levels",
        placeholder: "e.g., Single level, Double level",
        required: false,
        section: "Stand Details"
      },
      {
        id: 16,
        type: "number",
        question: "Number of Open Sides",
        placeholder: "1-4",
        min: 1,
        max: 4,
        required: true,
        section: "Stand Details"
      },
      {
        id: 17,
        type: "text",
        question: "Stand Orientation",
        placeholder: "North, South, East, West facing",
        required: false,
        section: "Stand Details"
      },
      {
        id: 18,
        type: "text",
        question: "Maximum Height Restrictions",
        placeholder: "e.g., 4m, 6m, No restrictions",
        required: false,
        section: "Stand Details"
      },
      {
        id: 19,
        type: "text",
        question: "Hanging Structure",
        placeholder: "Describe any hanging elements needed",
        required: false,
        section: "Stand Details"
      },
      {
        id: 20,
        type: "text",
        question: "Rigging Points",
        placeholder: "Ceiling mounting points available",
        required: false,
        section: "Stand Details"
      },
      {
        id: 21,
        type: "textarea",
        question: "Any Venue Restrictions",
        placeholder: "Describe any specific venue limitations or requirements",
        required: false,
        section: "Stand Details"
      },
      {
        id: 22,
        type: "textarea",
        question: "Branding Guidelines",
        placeholder: "Specific branding requirements or restrictions",
        required: false,
        section: "Stand Details"
      },
      {
        id: 23,
        type: "select",
        question: "Reuse Existing Stand",
        options: ["Yes", "No", "Partial"],
        required: false,
        section: "Stand Details"
      },

      // Section 4: ACTIVATIONS
      {
        id: 24,
        type: "number",
        question: "How many activations are planned for the event?",
        placeholder: "Number of activations",
        min: 0,
        max: 20,
        required: false,
        section: "Activations"
      },
      {
        id: 25,
        type: "textarea",
        question: "Please provide the specific activations you plan to implement in your project",
        placeholder: "Describe your planned activations in detail...",
        maxLength: 1000,
        required: false,
        section: "Activations"
      },
      {
        id: 26,
        type: "textarea",
        question: "Please provide the specific content to be applied in the activation",
        placeholder: "Detail the content, messaging, and materials for your activations...",
        maxLength: 1000,
        required: false,
        section: "Activations"
      },

      // Section 5: DESIGN REQUIREMENTS - Design Intent/Concept Design
      {
        id: 27,
        type: "checkbox",
        question: "Design Intent/Concept Design - What do you require?",
        options: [
          "Concept/Vibe Page Only",
          "Furniture Page Only",
          "3D Sketch",
          "3D Rendered Visuals"
        ],
        required: false,
        section: "Design Requirements - Concept",
        helpText: "Select all design deliverables you need"
      },

      // Section 6: DESIGN REQUIREMENTS - Developed/Schematic Design
      {
        id: 28,
        type: "checkbox",
        question: "Developed/Schematic Design - What do you require?",
        options: [
          "Concept Vibe Amends",
          "Furniture Page Amends",
          "3D Sketch",
          "3D Rendered Visual Amends",
          "Full tender presentation Amends"
        ],
        required: false,
        section: "Design Requirements - Development",
        helpText: "Select all development deliverables you need"
      },

      // Section 7: DESIGN REQUIREMENTS - Technical Design
      {
        id: 29,
        type: "checkbox",
        question: "Technical Design - What do you require?",
        options: [
          "Plans",
          "Elevations",
          "Structural Calculation",
          "Detailed Drawings",
          "Graphics Package"
        ],
        required: false,
        section: "Design Requirements - Technical",
        helpText: "Select all technical deliverables you need"
      },

      // Section 8: STAND ZONING & SPACE MANAGEMENT
      {
        id: 30,
        type: "matrix",
        question: "Stand Zoning & Space Management - Select required areas and specify quantities",
        rows: [
          "Mezzanine",
          "Reception",
          "Meeting Rooms",
          "Majlis",
          "Lounge",
          "Product Display",
          "Open seating area",
          "Service Pantry",
          "Media-Interview Room",
          "Offices",
          "Dining",
          "Food Presentation/Buffet",
          "Storage",
          "Bar"
        ],
        columns: ["Yes", "No", "Quantity"],
        required: false,
        section: "Space Management",
        helpText: "Indicate which areas you need and specify quantities where applicable"
      },

      // Section 9: SPACE MANAGEMENT DETAILS
      {
        id: 31,
        type: "textarea",
        question: "Space Management Details",
        placeholder: "Please add all questions, and client answers regarding space requirements...",
        maxLength: 2000,
        required: false,
        section: "Space Management",
        helpText: "Additional space planning requirements and specifications"
      },

      // Section 10: OTHER DESIGN REQUIREMENTS
      {
        id: 32,
        type: "textarea",
        question: "Other Design Requirements",
        placeholder: "Please specify any additional design requirements not covered above...",
        maxLength: 1000,
        required: false,
        section: "Design Requirements - Other",
        helpText: "Any special design considerations or requirements"
      },

      // Section 11: BRANDING REQUIREMENTS
      {
        id: 33,
        type: "file-upload",
        question: "Branding Guidelines",
        accept: ".pdf,.jpg,.jpeg,.png,.ai,.eps",
        multiple: true,
        maxSize: "25MB",
        required: false,
        section: "Branding Requirements",
        helpText: "Please share the PDF file with your branding guidelines"
      },
      {
        id: 34,
        type: "textarea",
        question: "Logo Placement Requirements",
        placeholder: "Please note the level at each corner of the structure where logos should be placed...",
        required: false,
        section: "Branding Requirements"
      },
      {
        id: 35,
        type: "textarea",
        question: "Company Profile",
        placeholder: "Please note down the company overview...",
        maxLength: 1500,
        required: false,
        section: "Branding Requirements",
        helpText: "Provide a comprehensive company overview for better understanding"
      },
      {
        id: 36,
        type: "percentage",
        question: "Stand Objectives Percentage",
        placeholder: "What percentage of objectives should the stand achieve?",
        min: 0,
        max: 100,
        step: 5,
        required: false,
        section: "Branding Requirements"
      },

      // Section 12: LOOK & FEEL
      {
        id: 37,
        type: "textarea",
        question: "Color Palette & Design Direction",
        placeholder: "Please specify the desired look and feel, color palette, and corporate identity that should be considered...",
        maxLength: 1000,
        required: false,
        section: "Look & Feel",
        helpText: "Describe your visual preferences and brand identity"
      },
      {
        id: 38,
        type: "select",
        question: "Style Preference",
        options: [
          "Modern & Contemporary",
          "Traditional & Classic",
          "Minimalist",
          "Industrial",
          "Luxury & Premium",
          "Tech & Futuristic",
          "Cultural & Heritage",
          "Eco-friendly & Sustainable",
          "Other"
        ],
        required: false,
        section: "Look & Feel"
      },

      // Section 13: PROPOSAL AND BUDGET
      {
        id: 39,
        type: "date",
        question: "Technical Proposal Deadline",
        placeholder: "When do you need the technical proposal?",
        required: false,
        section: "Proposal and Budget"
      },
      {
        id: 40,
        type: "date",
        question: "Commercial Proposal Deadline",
        placeholder: "When do you need the commercial proposal?",
        required: false,
        section: "Proposal and Budget"
      },
      {
        id: 41,
        type: "currency",
        question: "Budget Allocation - Stand Fabrication",
        currency: "AED",
        placeholder: "Budget allocated for stand fabrication",
        required: false,
        section: "Proposal and Budget"
      },
      {
        id: 42,
        type: "currency",
        question: "Budget Allocation - Technologies",
        currency: "AED",
        placeholder: "Budget allocated for technology integration",
        required: false,
        section: "Proposal and Budget"
      },

      // Section 14: OTHER STAND REQUIREMENTS
      {
        id: 43,
        type: "matrix",
        question: "Other Stand Requirements",
        rows: [
          "Giveaways",
          "Catering",
          "Professional coffee machine with barista",
          "Arabic coffee and dates",
          "Branded chocolates",
          "Host/Hostesses"
        ],
        columns: ["Yes", "No", "Details"],
        required: false,
        section: "Other Requirements",
        helpText: "Select additional services you require and provide details"
      },

      // Section 15: NOTES
      {
        id: 44,
        type: "textarea",
        question: "Additional Notes",
        placeholder: "Any additional notes, requirements, or special considerations...",
        maxLength: 2000,
        required: false,
        section: "Notes",
        helpText: "Include any other important information not covered above"
      },

      // Section 16: SUBMISSION DETAILS
      {
        id: 45,
        type: "multi-field",
        question: "Submission Details",
        section: "Submission",
        fields: [
          {
            id: "submitterName",
            label: "Submitted By - Name",
            type: "text",
            placeholder: "Full name",
            required: true
          },
          {
            id: "submitterDesignation",
            label: "Designation",
            type: "text",
            placeholder: "Job title",
            required: true
          },
          {
            id: "submissionDate",
            label: "Submission Date",
            type: "date",
            required: true
          }
        ],
        required: true,
        helpText: "Please provide submission details for record keeping"
      },

      // Section 17: DIGITAL SIGNATURE
      {
        id: 46,
        type: "signature",
        question: "Digital Signature",
        required: true,
        section: "Submission",
        helpText: "Please provide your digital signature to authorize this submission"
      },

      // Section 18: REVIEW SECTION (for account manager)
      {
        id: 47,
        type: "multi-field",
        question: "Account Manager Review (Internal Use)",
        section: "Review",
        fields: [
          {
            id: "reviewerName",
            label: "Reviewed By - Name",
            type: "text",
            placeholder: "Account manager name",
            required: false
          },
          {
            id: "reviewDate",
            label: "Review Date",
            type: "date",
            required: false
          }
        ],
        required: false,
        helpText: "To be completed by account manager during review"
      }
    ]
  }
};

interface QuestionnaireFlowProps {
  questionnaireId: string;
}

export function QuestionnaireFlow({ questionnaireId }: QuestionnaireFlowProps) {
  const [currentStep, setCurrentStep] = useState<"welcome" | "questions" | "thank-you">("welcome");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[] | Record<string, string>>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File[]>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC mutation for submitting questionnaire
  const submitQuestionnaire = api.questionnaire.submit.useMutation({
    onSuccess: (data) => {
      setSubmissionId(data.submissionId);
      setIsSubmitting(false);
      setCurrentStep("thank-you");
    },
    onError: (error) => {
      console.error("Failed to submit questionnaire:", error);
      setIsSubmitting(false);
      // You could show an error toast here
    },
  });

  const questionnaireData = QUESTIONNAIRE_DATA[questionnaireId];

  // Group questions by section
  const sections = questionnaireData ? questionnaireData.questions.reduce((acc, question) => {
    const sectionName = question.section || "General";
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(question);
    return acc;
  }, {} as Record<string, Question[]>) : {};

  const sectionNames = Object.keys(sections);
  const currentSection = sectionNames[currentSectionIndex];
  const currentSectionQuestions = currentSection ? sections[currentSection] || [] : [];

  if (!questionnaireData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2c2c2b]">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Brief Not Found</h1>
          <p className="text-xl text-gray-300">The requested brief form could not be found.</p>
        </div>
      </div>
    );
  }

  const progress = ((currentSectionIndex + 1) / sectionNames.length) * 100;

  const handleAnswer = (questionId: number, answer: string | string[] | Record<string, string>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFileUpload = (questionId: number, files: File[]) => {
    setUploadedFiles(prev => ({
      ...prev,
      [questionId]: files
    }));
  };

  const handleNext = async () => {
    if (currentSectionIndex < sectionNames.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // Submit questionnaire to database
      setIsSubmitting(true);

      // Prepare submission data
      const submissionAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = questionnaireData?.questions.find(q => q.id === parseInt(questionId));
        if (!question) return null;

        return {
          questionId: parseInt(questionId),
          questionType: question.type,
          section: question.section || "General",
          textValue: typeof answer === 'string' ? answer : null,
          jsonValue: typeof answer !== 'string' ? answer : null,
        };
      }).filter(Boolean) as any[];

      // Get key client details for easy access
      const companyName = answers[1] as string; // Company Name question
      const contactPerson = answers[4] as string; // Contact Person question
      const email = answers[6] as string; // Email question
      const industry = answers[3] as string; // Industry question

      try {
        await submitQuestionnaire.mutateAsync({
          questionnaireId,
          companyName,
          contactPerson,
          email,
          industry,
          answers: submissionAnswers,
          uploadedFiles: [], // File upload will be handled separately
          isComplete: true,
        });
      } catch (error) {
        console.error("Failed to submit questionnaire:", error);
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleStart = () => {
    setCurrentStep("questions");
  };

  // Add keyboard navigation - Enter to go to next section
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && currentStep === "questions") {
        // Only proceed if current section is sufficiently answered
        if (isCurrentSectionAnswered()) {
          event.preventDefault();
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentSectionIndex, answers, uploadedFiles]);

  const isCurrentSectionAnswered = (): boolean => {
    if (!currentSectionQuestions.length) return false;

    // Check if at least required questions in current section are answered
    const requiredQuestions = currentSectionQuestions.filter(q => q.required);

    if (requiredQuestions.length === 0) return true; // No required questions in section

    return requiredQuestions.every(question => {
      const answer = answers[question.id];
      const files = uploadedFiles[question.id];

      if (question.type === "file-upload") {
        return Boolean(files && files.length > 0);
      }

      if (question.type === "multi-field") {
        const answerObj = answer as Record<string, string> || {};
        const requiredFields = question.fields?.filter(field => field.required) || [];
        return requiredFields.every(field => answerObj[field.id] && answerObj[field.id]?.trim() !== "");
      }

      if (Array.isArray(answer)) {
        return answer.length > 0;
      }

      return Boolean(answer && typeof answer === 'string' && answer.trim() !== "");
    });
  };

  if (currentStep === "welcome") {
    return (
      <WelcomeScreen
        title={questionnaireData.title}
        description={questionnaireData.description}
        onStart={handleStart}
        isBoothBrief={true}
      />
    );
  }

  if (currentStep === "thank-you") {
    return (
      <ThankYouScreen
        title="Brief Submitted Successfully!"
        message="Thank you for providing detailed information about your booth requirements. Our design team will review your brief and get back to you within 24 hours with initial concepts and next steps."
        isBoothBrief={true}
        answers={answers}
        files={uploadedFiles}
        questions={questionnaireData.questions}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#2c2c2b] py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative w-20 sm:w-24 md:w-28 lg:w-32 h-8 sm:h-9 md:h-10 lg:h-11 flex items-center justify-center">
              <Image
                src="/kayan-logo-official.png"
                alt="Kayan Live Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{questionnaireData.title}</h1>
          <p className="text-gray-400 text-sm md:text-base">Section {currentSectionIndex + 1} of {sectionNames.length}: {currentSection}</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} />

        {/* Section Questions */}
        {currentSectionQuestions.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-white/[0.08] to-white/[0.12] backdrop-blur-sm border border-white/[0.15] rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">{currentSection}</h2>
                    <p className="text-gray-400 text-sm">
                      {currentSectionQuestions.length} question{currentSectionQuestions.length !== 1 ? 's' : ''} in this section
                    </p>
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="px-3 py-1 bg-[#7afdd6]/[0.15] border border-[#7afdd6]/[0.25] rounded-full">
                      <span className="text-[#7afdd6] text-xs font-medium">
                        {Math.round(((Object.keys(answers).filter(id => currentSectionQuestions.some(q => q.id === parseInt(id))).length) / currentSectionQuestions.length) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Grid */}
              <div className="grid gap-5">
                {currentSectionQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <QuestionCard
                      question={question}
                      answer={answers[question.id]}
                      files={uploadedFiles[question.id]}
                      onAnswer={handleAnswer}
                      onFileUpload={handleFileUpload}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        <NavigationButtons
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoBack={currentSectionIndex > 0 && !isSubmitting}
          canGoForward={isCurrentSectionAnswered() && !isSubmitting}
          isLastQuestion={currentSectionIndex === sectionNames.length - 1}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}