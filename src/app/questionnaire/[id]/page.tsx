import { QuestionnaireFlow } from "~/app/_components/questionnaire/QuestionnaireFlow";

interface QuestionnairePageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-[#2c2c2b]">
      <QuestionnaireFlow questionnaireId={id} />
    </div>
  );
} 