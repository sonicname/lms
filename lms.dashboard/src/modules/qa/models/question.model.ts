export type AnswerModel = {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type QuestionModel = {
  id: string;
  title: string;
  content: string;
  userId: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
};

export type QuestionDetailModel = QuestionModel & {
  Answer: AnswerModel[];
};

export type CreateQuestionModel = {
  title: string;
  content: string;
};

export type CreateAnswerModel = {
  content: string;
};
