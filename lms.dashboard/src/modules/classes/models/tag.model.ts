export type TagModel = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ListTagModel = Partial<{
  data: TagModel[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}>;
