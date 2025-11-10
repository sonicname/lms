import api from '../../../core/api';

// Backend actual endpoints (short versions):
// GET /lessons/:lessonId/questions
// POST /lessons/:lessonId/questions
// GET /questions/:questionId
// GET /questions/:questionId/answers
// POST /questions/:questionId/answers
// PATCH /answers/:answerId
// DELETE /answers/:answerId

export interface QuestionItem {
  id: string;
  title: string;
  content: string;
  userId: string;
  lessonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerItem {
  id: string;
  content: string;
  userId: string;
  questionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPayload {
  title: string;
  content: string;
}
export interface CreateAnswerPayload {
  content: string;
}
export interface UpdateAnswerPayload {
  content?: string;
}
export interface UpdateQuestionPayload {
  title?: string;
  content?: string;
}

export const qnaApi = {
  async listQuestionsByLesson(lessonId: string): Promise<QuestionItem[]> {
    return api.get<QuestionItem[]>(`/lessons/${lessonId}/questions`);
  },
  async createQuestion(
    lessonId: string,
    payload: CreateQuestionPayload,
  ): Promise<QuestionItem> {
    return api.post<QuestionItem, CreateQuestionPayload>(
      `/lessons/${lessonId}/questions`,
      payload,
    );
  },
  async getQuestion(
    questionId: string,
  ): Promise<QuestionItem & { Answer?: AnswerItem[] }> {
    return api.get<QuestionItem & { Answer?: AnswerItem[] }>(
      `/questions/${questionId}`,
    );
  },
  async listAnswers(questionId: string): Promise<AnswerItem[]> {
    return api.get<AnswerItem[]>(`/questions/${questionId}/answers`);
  },
  async createAnswer(
    questionId: string,
    payload: CreateAnswerPayload,
  ): Promise<AnswerItem> {
    return api.post<AnswerItem, CreateAnswerPayload>(
      `/questions/${questionId}/answers`,
      payload,
    );
  },
  async updateAnswer(
    answerId: string,
    payload: UpdateAnswerPayload,
  ): Promise<AnswerItem> {
    return api.patch<AnswerItem, UpdateAnswerPayload>(
      `/answers/${answerId}`,
      payload,
    );
  },
  async deleteAnswer(answerId: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/answers/${answerId}`);
  },
  async updateQuestion(
    questionId: string,
    payload: UpdateQuestionPayload,
  ): Promise<QuestionItem> {
    return api.patch<QuestionItem, UpdateQuestionPayload>(
      `/questions/${questionId}`,
      payload,
    );
  },
  async deleteQuestion(questionId: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/questions/${questionId}`);
  },
};
