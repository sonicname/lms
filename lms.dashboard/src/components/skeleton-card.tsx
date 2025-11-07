import { Group, Skeleton, Stack } from '@mantine/core';

type SkeletonCardProps = {
  // Number of skeleton text lines to render
  lines?: number;
  // When true, card stretches to parent height
  isFullHeight?: boolean;
};

export default function SkeletonCard({
  lines = 3,
  isFullHeight = false,
}: SkeletonCardProps) {
  const count = Math.max(0, Math.floor(lines));
  // If full height, ensure a minimum number of lines to visually fill space
  const minFillLines = isFullHeight ? 8 : count;
  const extraNeeded = isFullHeight ? Math.max(0, minFillLines - count) : 0;
  const totalLines = count + extraNeeded;
  const containerClass = `w-full rounded-lg border border-gray-200 p-4 ${
    isFullHeight ? 'h-full flex flex-col' : ''
  }`;

  return (
    <div className={containerClass}>
      <Group align='flex-start' gap='md' wrap='nowrap'>
        {/* Thumbnail placeholder (slightly larger if full height for visual balance) */}
        <Skeleton
          height={isFullHeight ? 80 : 64}
          width={isFullHeight ? 80 : 64}
          radius='md'
        />

        {/* Text block */}
        <Stack gap={8} style={{ flex: 1 }}>
          {/* Title placeholder */}
          <Skeleton height={14} width='55%' radius='sm' />

          {/* Detail + filler lines */}
          {Array.from({ length: totalLines }).map((_, i) => {
            // Vary widths for natural look; introduce a couple more patterns if many lines
            const widths = [
              '95%',
              '90%',
              '85%',
              '80%',
              '75%',
              '70%',
              '65%',
              '60%',
            ];
            const width = widths[i % widths.length];
            return <Skeleton key={i} height={12} width={width} radius='sm' />;
          })}
        </Stack>
      </Group>

      {/* Price / action row */}
      <Group
        justify='space-between'
        className={isFullHeight ? 'mt-auto pt-3' : ''}
      >
        <Skeleton height={18} width={100} radius='sm' />
        <Skeleton height={32} width={96} radius='md' />
      </Group>
    </div>
  );
}
