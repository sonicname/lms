import { Checkbox, Divider, Stack, Text, Title } from '@mantine/core';

export type SidebarFiltersValue = {
  categories: string[];
  levels: string[];
};

const CATEGORIES = ['Vovinam', 'Yoga', 'Dance Sport', 'Thiền định', 'Karate'];
const LEVELS = ['Sơ cấp', 'Trung cấp', 'Chuyên gia'];

export default function SidebarFilters({
  value,
  onChange,
}: {
  value: SidebarFiltersValue;
  onChange: (next: SidebarFiltersValue) => void;
}) {
  const toggle = (key: 'categories' | 'levels', val: string) => {
    const set = new Set(value[key]);
    if (set.has(val)) set.delete(val);
    else set.add(val);
    onChange({ ...value, [key]: Array.from(set) });
  };

  return (
    <div className='w-full'>
      <div>
        <Title order={6} mb='xs'>
          Danh mục
        </Title>
        <Divider mb='xs' />
        <Stack gap={6}>
          {CATEGORIES.map((c) => (
            <Checkbox
              key={c}
              label={<Text size='sm'>{c}</Text>}
              checked={value.categories.includes(c)}
              onChange={() => toggle('categories', c)}
            />
          ))}
        </Stack>
      </div>

      <div className='mt-6'>
        <Title order={6} mb='xs'>
          Cấp độ
        </Title>
        <Divider mb='xs' />
        <Stack gap={6}>
          {LEVELS.map((lv) => (
            <Checkbox
              key={lv}
              label={<Text size='sm'>{lv}</Text>}
              checked={value.levels.includes(lv)}
              onChange={() => toggle('levels', lv)}
            />
          ))}
        </Stack>
      </div>
    </div>
  );
}
