import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import {
  Card,
  Grid,
  Group,
  NumberFormatter,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { analyticsApi } from '../../analytics/services/analytics.api';

export default function DashboardRootPage() {
  const overviewQuery = useQuery({
    queryKey: ['analytics', 'admin', 'overview'],
    queryFn: () => analyticsApi.adminOverview(),
  });

  const engagementQuery = useQuery({
    queryKey: ['analytics', 'admin', 'engagement', '30d'],
    queryFn: () =>
      analyticsApi.adminEngagement(
        dayjs().subtract(30, 'day').toDate(),
        new Date(),
      ),
  });

  const ov = overviewQuery.data;
  const eg = engagementQuery.data;

  return (
    <Stack gap='lg'>
      <Title order={3}>Tổng quan</Title>
      {overviewQuery.isLoading ? (
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton height={96} radius='md' />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard label='Người dùng' value={ov?.totals.users ?? 0} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard label='Giáo viên' value={ov?.totals.teachers ?? 0} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard label='Học sinh' value={ov?.totals.students ?? 0} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard label='Lớp học' value={ov?.totals.classes ?? 0} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard label='Bài học' value={ov?.totals.lessons ?? 0} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatCard label='Bài kiểm tra' value={ov?.totals.tests ?? 0} />
          </Grid.Col>
        </Grid>
      )}

      <Title order={3}>Tương tác 30 ngày</Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius='md' p='md'>
            {engagementQuery.isLoading ? (
              <Skeleton height={280} />
            ) : (
              <AreaChart
                h={280}
                data={[
                  {
                    date: 'window',
                    Submissions: eg?.submissionsCount ?? 0,
                    Questions: eg?.questionsCount ?? 0,
                    Answers: eg?.answersCount ?? 0,
                  },
                ]}
                dataKey='date'
                series={[
                  { name: 'Submissions', color: 'indigo.6' },
                  { name: 'Questions', color: 'cyan.6' },
                  { name: 'Answers', color: 'teal.6' },
                ]}
                curveType='linear'
                withLegend
                strokeWidth={2}
                tooltipAnimationDuration={150}
              />
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius='md' p='md'>
            {overviewQuery.isLoading ? (
              <Skeleton height={280} />
            ) : (
              <DonutChart
                withLabelsLine
                labelsType='percent'
                data={[
                  {
                    name: 'Câu hỏi',
                    value: ov?.totals.questions ?? 0,
                    color: 'cyan.6',
                  },
                  {
                    name: 'Câu trả lời',
                    value: ov?.totals.answers ?? 0,
                    color: 'teal.6',
                  },
                  {
                    name: 'Bài nộp',
                    value: ov?.totals.submissions ?? 0,
                    color: 'indigo.6',
                  },
                ]}
                strokeWidth={2}
                chartLabel='Hoạt động'
                h={280}
              />
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={12}>
          <Card withBorder radius='md' p='md'>
            {overviewQuery.isLoading ? (
              <Skeleton height={280} />
            ) : (
              <BarChart
                h={280}
                data={[
                  {
                    name: 'Hệ thống',
                    Lớp: ov?.totals.classes ?? 0,
                    Bài_học: ov?.totals.lessons ?? 0,
                    Bài_kiểm_tra: ov?.totals.tests ?? 0,
                  },
                ]}
                dataKey='name'
                withLegend
                series={[
                  { name: 'Lớp', color: 'grape.6' },
                  { name: 'Bài_học', color: 'violet.6' },
                  { name: 'Bài_kiểm_tra', color: 'pink.6' },
                ]}
                barProps={{ radius: 6 }}
              />
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card withBorder radius='md' p='md'>
      <Group justify='space-between' align='flex-end'>
        <div>
          <Text size='sm' c='dimmed'>
            {label}
          </Text>
          <Text fz={28} fw={700}>
            <NumberFormatter value={value} thousandSeparator />
          </Text>
        </div>
      </Group>
    </Card>
  );
}
