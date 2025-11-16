import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useQueries } from '@tanstack/react-query';
import appEnv from 'app-env';
import { LuGripVertical, LuX } from 'react-icons/lu';
import { assetsApi } from '../../assets/services/assets.api';

export type SelectedBannersSortableProps = {
  value: string[];
  onChange: (ids: string[]) => void;
};

export default function SelectedBannersSortable({
  value,
  onChange,
}: SelectedBannersSortableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const assetQueries = useQueries({
    queries: value.map((id) => ({
      queryKey: ['asset', id],
      queryFn: () => assetsApi.getOne(id),
      staleTime: 60_000,
    })),
  });

  const items = value.map((id, idx) => ({
    id,
    data: assetQueries[idx]?.data ?? null,
  }));

  return (
    <Stack gap={6}>
      {value.length === 0 ? (
        <Text size='sm' c='dimmed'>
          Chưa chọn ảnh nào
        </Text>
      ) : null}
      <DndContext
        sensors={sensors}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;
          const oldIndex = value.indexOf(String(active.id));
          const newIndex = value.indexOf(String(over.id));
          if (oldIndex === -1 || newIndex === -1) return;
          onChange(arrayMove(value, oldIndex, newIndex));
        }}
      >
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <Stack
            gap={8}
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 8,
              padding: 8,
            }}
          >
            {items.map((it) => (
              <SortableItem
                key={it.id}
                id={it.id}
                onRemove={() => onChange(value.filter((x) => x !== it.id))}
              >
                <Group gap='sm' wrap='nowrap'>
                  {it.data?.url ? (
                    <Image
                      src={`${appEnv.apiUrl}${it.data.url}`}
                      alt={it.data.filename || it.id}
                      w={64}
                      h={40}
                      fit='cover'
                      radius='sm'
                    />
                  ) : (
                    <Paper
                      w={64}
                      h={40}
                      radius='sm'
                      withBorder
                      p={0}
                      bg='gray.1'
                    />
                  )}
                  <Text size='sm' maw={280} truncate>
                    {it.data?.filename || it.id}
                  </Text>
                </Group>
              </SortableItem>
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </Stack>
  );
}

function SortableItem({
  id,
  children,
  onRemove,
}: {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'var(--mantine-color-body)',
    border: '1px solid var(--mantine-color-gray-3)',
    borderRadius: 8,
    padding: 8,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <Group justify='space-between' wrap='nowrap'>
        <Group gap={8} wrap='nowrap'>
          <Tooltip label='Kéo để sắp xếp'>
            <ActionIcon variant='subtle' {...attributes} {...listeners}>
              <LuGripVertical />
            </ActionIcon>
          </Tooltip>
          {children}
        </Group>
        <Tooltip label='Bỏ chọn'>
          <ActionIcon variant='subtle' color='red' onClick={onRemove}>
            <LuX />
          </ActionIcon>
        </Tooltip>
      </Group>
    </div>
  );
}
