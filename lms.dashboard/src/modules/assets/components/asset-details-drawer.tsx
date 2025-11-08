import {
  Badge,
  Button,
  Drawer,
  Group,
  Image,
  Stack,
  Text,
} from '@mantine/core';
import appEnv from 'app-env';
import type { AssetModel } from '../models/asset.model';

export type AssetDetailsDrawerProps = {
  opened: boolean;
  asset: AssetModel | null;
  onClose: () => void;
};

function humanSize(bytes: number) {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(1)} ${units[i]}`;
}

export default function AssetDetailsDrawer({
  opened,
  asset,
  onClose,
}: AssetDetailsDrawerProps) {
  const isImage = asset?.fileType === 'image';
  const isVideo = asset?.fileType === 'video';
  const isAudio = !!asset && asset.mimetype?.startsWith('audio/');
  const isPdf =
    !!asset &&
    (asset.mimetype === 'application/pdf' || /\.pdf$/i.test(asset.filename));
  const previewUrl = asset ? new URL(asset.url, appEnv.apiUrl).toString() : '';

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Chi tiết nội dung'
      position='right'
      size='md'
    >
      {asset ? (
        <Stack gap='md'>
          <Group gap='xs'>
            <Text fw={600} fz='lg'>
              {asset.filename}
            </Text>
            <Badge variant='light'>{asset.fileType}</Badge>
          </Group>
          <Text size='sm'>Mimetype: {asset.mimetype}</Text>
          <Text size='sm'>Kích thước: {humanSize(asset.fileSize)}</Text>
          <Text size='sm'>Type: {asset.type || '—'}</Text>
          <Text size='sm'>
            Tạo lúc: {new Date(asset.createdAt).toLocaleString()}
          </Text>
          <Group>
            <Button
              variant='light'
              onClick={() =>
                window.open(previewUrl, '_blank', 'noopener,noreferrer')
              }
            >
              Mở preview
            </Button>
          </Group>
          {isImage && (
            <Image src={previewUrl} alt={asset.filename} radius='sm' />
          )}
          {isVideo && (
            <video controls style={{ width: '100%' }}>
              <source src={previewUrl} type={asset.mimetype} />
              Trình duyệt không hỗ trợ video.
            </video>
          )}
          {isAudio && (
            <audio controls style={{ width: '100%' }}>
              <source src={previewUrl} type={asset.mimetype} />
              Trình duyệt không hỗ trợ audio.
            </audio>
          )}
          {isPdf && (
            <iframe
              src={previewUrl}
              style={{
                width: '100%',
                height: 480,
                border: '1px solid var(--mantine-color-default-border)',
              }}
            />
          )}
          {!isImage && !isVideo && (
            <Text size='sm'>Đường dẫn: {previewUrl}</Text>
          )}
        </Stack>
      ) : (
        <Text c='dimmed'>Không có dữ liệu</Text>
      )}
    </Drawer>
  );
}
