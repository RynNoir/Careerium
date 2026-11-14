// Satu pintu fetch ke API same-origin. Tipe dari lib/schemas.ts (type-only: zod tidak ikut ke bundle klien).
import type { z } from "zod";
import type {
  AdaptiveRoadmap,
  AdaptiveRoadmapRequest,
  ExplorationRequest,
  ExplorationResult,
  AnalysisCreate,
  AnalysisDetail,
  AnalysisSummary,
  GapRequest,
  GapResult,
  Grade,
  GradeRequest,
  Intent,
  IntentRequest,
  InterviewAttemptCreate,
  Profile,
  ProfileRequest,
  QuestionsRequest,
  QuestionsResponse,
  Roadmap,
  RoadmapRequest,
} from "./schemas";
import { pesanError } from "./pesan-template";

type In<T extends z.ZodType> = z.input<T>;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, method: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(pesanError(0), 0);
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "";
    throw new ApiError(msg || pesanError(res.status), res.status);
  }
  return data as T;
}

const post = <T>(url: string, body?: unknown) => request<T>(url, "POST", body ?? {});
const get = <T>(url: string) => request<T>(url, "GET");

// ---------- Alur AI ----------
export const api = {
  intent: (b: In<typeof IntentRequest>) => post<Intent>("/api/intent", b),
  profile: (b: In<typeof ProfileRequest>) => post<Profile>("/api/profile", b),
  gap: (b: In<typeof GapRequest>) => post<GapResult>("/api/gap", b),
  roadmap: (b: In<typeof RoadmapRequest>) => post<Roadmap>("/api/roadmap", b),
  questions: (b: In<typeof QuestionsRequest>) => post<QuestionsResponse>("/api/interview/questions", b),
  grade: (b: In<typeof GradeRequest>) => post<Grade>("/api/interview/grade", b),
  roadmapAdaptif: (b: In<typeof AdaptiveRoadmapRequest>) => post<AdaptiveRoadmap>("/api/roadmap/adaptif", b),
  eksplorasi: (b: In<typeof ExplorationRequest>) => post<ExplorationResult>("/api/eksplorasi", b),

  // ---------- Akun ----------
  register: (b: { email: string; password: string }) =>
    post<{ ok: true; recoveryCode: string }>("/api/auth/register", b),
  login: (b: { email: string; password: string }) => post<{ ok: true }>("/api/auth/login", b),
  reset: (b: { email: string; recoveryCode: string; newPassword: string }) =>
    post<{ ok: true; recoveryCode: string }>("/api/auth/reset", b),
  logout: () => post<{ ok: true }>("/api/auth/logout"),
  deleteAccount: () => post<{ ok: true }>("/api/auth/delete"),
  /** null = belum login (401). Error lain tetap dilempar. */
  me: async (): Promise<{ email: string } | null> => {
    try {
      return await get<{ email: string }>("/api/auth/me");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },

  // ---------- Riwayat (perlu login) ----------
  saveAnalysis: (b: In<typeof AnalysisCreate>) => post<{ id: string }>("/api/analyses", b),
  listAnalyses: () => get<AnalysisSummary[]>("/api/analyses"),
  getAnalysis: (id: string) => get<AnalysisDetail>(`/api/analyses/${encodeURIComponent(id)}`),
  setRoadmapItem: (id: string, itemId: number, selesai: boolean) =>
    request<{ ok: true }>(`/api/analyses/${encodeURIComponent(id)}/roadmap/${itemId}`, "PATCH", { selesai }),
  saveInterview: (id: string, b: In<typeof InterviewAttemptCreate>) =>
    post<{ percobaan_ke: number; skor_total: number }>(`/api/analyses/${encodeURIComponent(id)}/interviews`, b),
};
