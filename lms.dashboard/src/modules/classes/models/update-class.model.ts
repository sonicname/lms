export type UpdateClassModel = Partial<{
  name: string;
  description: string | null;
  code: string;
  teacherId: string; // only admin can set
  tags: string[];
}>;
