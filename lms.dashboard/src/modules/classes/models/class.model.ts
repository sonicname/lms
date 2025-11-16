export type ClassModel = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
};

export type ClassDetailModel = ClassModel & {
  teacher: { id: string; name: string | null; email: string };
  students: Array<{
    studentId: string;
    status: 'pending' | 'approved';
    approvedAt: string | null;
    student: { id: string; name: string | null; email: string };
  }>;
  tags?: Array<{ id: string; name: string }>;
};
