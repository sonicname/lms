import {
  Badge,
  Button,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useState } from 'react';
import type {
  AnswerModel,
  QuestionDetailModel,
} from '../models/question.model';

export interface QuestionDetailsDrawerProps {
  opened: boolean;
  loadingAnswers?: boolean;
  question: QuestionDetailModel | null;
  answers: AnswerModel[];
  creatingAnswer?: boolean;
  onClose: () => void;
  onCreateAnswer: (content: string) => void;
}

export default function QuestionDetailsDrawer({
  opened,
  question,
  answers,
  loadingAnswers,
  creatingAnswer,
  onClose,
  onCreateAnswer,
}: QuestionDetailsDrawerProps) {
  const [content, setContent] = useState('');

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        onClose();
        setContent('');
      }}
      title={question ? `Chi tiết câu hỏi` : 'Câu hỏi'}
      position='right'
      size='lg'
    >
      {question ? (
        <Stack gap='md'>
          <Stack gap={2}>
            <Text fw={600}>{question.title}</Text>
            <Text size='sm' c='dimmed'>
              {question.content}
            </Text>
            <Badge color='blue' variant='light'>
              {new Date(question.createdAt).toLocaleString()}
            </Badge>
          </Stack>
          <Stack gap='xs'>
            <Text fw={500}>Trả lời</Text>
            <ScrollArea h={240} scrollbarSize={6} offsetScrollbars>
              <Stack gap='sm' p='xs'>
                {loadingAnswers ? (
                  <Text size='sm' c='dimmed'>
                    Đang tải...
                  </Text>
                ) : answers.length ? (
                  answers.map((a) => (
                    <Stack
                      key={a.id}
                      gap={2}
                      className='border border-neutral-200 rounded px-2 py-1'
                    >
                      <Text size='sm'>{a.content}</Text>
                      <Text size='xs' c='dimmed'>
                        {new Date(a.createdAt).toLocaleString()}
                      </Text>
                    </Stack>
                  ))
                ) : (
                  <Text size='sm' c='dimmed'>
                    Chưa có trả lời
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          </Stack>
          <Stack gap='xs'>
            <Textarea
              placeholder='Nội dung trả lời'
              autosize
              minRows={3}
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
            />
            <Group justify='flex-end'>
              <Button
                onClick={() => {
                  if (!content.trim()) return;
                  onCreateAnswer(content.trim());
                  setContent('');
                }}
                loading={creatingAnswer}
                disabled={!content.trim() || creatingAnswer}
              >
                Gửi trả lời
              </Button>
            </Group>
          </Stack>
        </Stack>
      ) : (
        <Text size='sm' c='dimmed'>
          Không có dữ liệu
        </Text>
      )}
    </Drawer>
  );
}
