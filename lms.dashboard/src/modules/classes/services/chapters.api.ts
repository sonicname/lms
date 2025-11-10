import api from '../../../core/api';

export type ChapterItem = {
  id: string;
  title: string;
};

export const chaptersApi = {
  async list(classId: string): Promise<ChapterItem[]> {
    return api.get<ChapterItem[]>(`/classes/${classId}/chapters`);
  },
};
