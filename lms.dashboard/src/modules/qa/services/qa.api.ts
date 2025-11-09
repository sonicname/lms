import api from '../../../core/api';
import type {
  AnswerModel,
  CreateAnswerModel,
  CreateQuestionModel,
  QuestionDetailModel,
  QuestionModel,
} from '../models/question.model';

export const qaApi = {
  listQuestions: (classId: string, chapterId: string, lessonId: string) =>
    api.get<QuestionModel[]>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions`,
    ),
  getQuestion: (
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) =>
    api.get<QuestionDetailModel>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions/${questionId}`,
    ),
  createQuestion: (
    classId: string,
    chapterId: string,
    lessonId: string,
    payload: CreateQuestionModel,
  ) =>
    api.post<unknown, CreateQuestionModel>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions`,
      payload,
    ),
  listAnswers: (
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) =>
    api.get<AnswerModel[]>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions/${questionId}/answers`,
    ),
  createAnswer: (
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
    payload: CreateAnswerModel,
  ) =>
    api.post<unknown, CreateAnswerModel>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions/${questionId}/answers`,
      payload,
    ),
};
