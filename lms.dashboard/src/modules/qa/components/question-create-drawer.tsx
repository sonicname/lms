import { Button, Drawer, Stack, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';

export interface QuestionCreateDrawerProps {
  opened: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; content: string }) => void;
}

export default function QuestionCreateDrawer({
  opened,
  loading,
  onClose,
  onSubmit,
}: QuestionCreateDrawerProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        onClose();
        setTitle('');
        setContent('');
      }}
      title='Tạo câu hỏi'
      position='right'
      size='md'
    >
      <Stack gap='md'>
        <TextInput
          label='Tiêu đề'
          placeholder='Nhập tiêu đề'
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <Textarea
          label='Nội dung'
          placeholder='Mô tả chi tiết câu hỏi'
          autosize
          minRows={4}
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
        />
        <Button
          onClick={() => {
            if (!title.trim()) return;
            onSubmit({ title: title.trim(), content: content.trim() });
          }}
          loading={loading}
          disabled={!title.trim() || loading}
        >
          Tạo
        </Button>
      </Stack>
    </Drawer>
  );
}
