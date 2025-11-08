import { Button, Group, Modal, Text } from '@mantine/core';

export type AssetDeleteModalProps = {
  opened: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AssetDeleteModal({
  opened,
  loading,
  onClose,
  onConfirm,
}: AssetDeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Xác nhận xoá nội dung'
      centered
    >
      <Text mb='md'>
        Bạn có chắc muốn xoá nội dung này? Hành động này không thể hoàn tác.
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
