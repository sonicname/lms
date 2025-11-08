import { Button, Group, Modal, Text } from '@mantine/core';

export type ClassDeleteModalProps = {
  opened: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ClassDeleteModal({
  opened,
  loading,
  onClose,
  onConfirm,
}: ClassDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title='Xác nhận xoá lớp' centered>
      <Text mb='md'>
        Bạn có chắc muốn xoá lớp học này? Hành động này không thể hoàn tác.
      </Text>
      <Group justify='flex-end'>
        <Button variant='default' onClick={onClose}>
          Huỷ
        </Button>
        <Button color='red' onClick={onConfirm} loading={!!loading}>
          Xoá
        </Button>
      </Group>
    </Modal>
  );
}
