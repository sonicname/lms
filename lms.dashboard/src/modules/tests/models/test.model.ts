export type TestModel = {
  id: string;
  name: string;
  classId: string;
  userCreatedId: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTestModel = {
  name: string;
  // ISO8601 string or empty
  startDate?: string | null;
  endDate?: string | null;
};

export type UpdateTestModel = Partial<CreateTestModel>;
