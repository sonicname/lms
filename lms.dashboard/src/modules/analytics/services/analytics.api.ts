import api from '../../../core/api';

export interface AdminOverviewAnalytics {
  totals: {
    users: number;
    teachers: number;
    students: number;
    classes: number;
    chapters: number;
    lessons: number;
    tests: number;
    submissions: number;
    questions: number;
    answers: number;
  };
  averages: {
    submissionScore: number | null;
  };
}

export interface AdminEngagementAnalytics {
  window: { from: string | null; to: string | null };
  submissionsCount: number;
  questionsCount: number;
  answersCount: number;
  newUsersCount: number;
  avgScore: number | null;
}

export interface AdminClassOverviewAnalytics {
  class: { id: string; name: string };
  students: { total: number; approved: number; pending: number };
  content: { chapters: number; lessons: number };
  assessments: {
    tests: number;
    submissions: number;
    submissionRate: number | null;
    avgScore: number | null;
  };
  qa: { questions: number; answers: number };
}

export const analyticsApi = {
  adminOverview(): Promise<AdminOverviewAnalytics> {
    return api.get<AdminOverviewAnalytics>('/analytics/admin/overview');
  },
  adminEngagement(from?: Date, to?: Date): Promise<AdminEngagementAnalytics> {
    const params = new URLSearchParams();
    if (from) params.set('from', from.toISOString());
    if (to) params.set('to', to.toISOString());
    const qs = params.toString();
    return api.get<AdminEngagementAnalytics>(
      `/analytics/admin/engagement${qs ? `?${qs}` : ''}`,
    );
  },
  adminClassOverview(classId: string): Promise<AdminClassOverviewAnalytics> {
    return api.get<AdminClassOverviewAnalytics>(
      `/analytics/admin/classes/${classId}/overview`,
    );
  },
};
