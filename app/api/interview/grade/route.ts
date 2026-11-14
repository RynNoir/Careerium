import { aiRoute } from "@/lib/ai-route";
import { demoGrade } from "@/lib/demo";
import { gradeAnswer } from "@/lib/prompts/grade";
import { GradeRequest } from "@/lib/schemas";

// Demo: hanya contoh jawaban Rani yang persis sama yang mendapat nilai cache (nilai asli dari AI saat build).
// Jawaban lain tidak pernah diberi nilai karangan.
export const POST = aiRoute(
  GradeRequest,
  (body) => gradeAnswer(body.question, body.answer),
  (body) => demoGrade(body.question.pertanyaan, body.answer),
  (body) => demoGrade(body.question.pertanyaan, body.answer), // contoh jawaban Rani: nilai tersimpan, selalu sama
);
