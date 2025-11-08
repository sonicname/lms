import { Button, Group, Modal, Text } from '@mantine/core';

export type AccountDeleteModalProps = {
  opened: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AccountDeleteModal({
  opened,
  loading,
  onClose,
  onConfirm,
}: AccountDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title='Xác nhận xoá' centered>
      <Text mb='md'>
        Bạn có chắc muốn xoá tài khoản này? Hành động này không thể hoàn tác.
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
