export type QuizModel = {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  correctChoiceId: string | null;
  tags?: QuizTagModel[];
  createdAt: string;
  updatedAt: string;
};

export type ChoiceModel = {
  id: string;
  content: string;
  quizId: string;
  createdAt: string;
  updatedAt: string;
};

export type Paged<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type CreateQuizModel = {
  title: string;
  content?: string | null;
};

export type UpdateQuizModel = Partial<CreateQuizModel>;

export type CreateChoiceModel = {
  content: string;
  isCorrect?: boolean;
};

export type UpdateChoiceModel = Partial<CreateChoiceModel>;

export type QuizTagModel = {
  id: string;
  name: string;
};
