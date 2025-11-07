import { Button, Code, Group, ScrollArea } from '@mantine/core';
import {
  LuBookOpen,
  LuCircleUserRound,
  LuFileArchive,
  LuLogOut,
} from 'react-icons/lu';
import { MdOutlineClass } from 'react-icons/md';
import { getAuthStore } from '../../../auth/stores/auth-store';
import { LinksGroup } from '../navbar-links-group';
import classes from './menu-sidebar.module.css';

const sidebarMenuItems = [
  {
    label: 'Dashboard',
    icon: LuBookOpen,
    initiallyOpened: true,
  },
  {
    label: 'Tài khoản',
    icon: LuCircleUserRound,
    initiallyOpened: true,
    links: [
      { label: 'Danh sách tài khoản', link: '/dashboard/accounts' },
      { label: 'Tài khoản bị khoá', link: '/dashboard/accounts/blocked' },
      {
        label: 'Danh sách giáo viên',
        link: '/dashboard/accounts/teachers',
      },
      {
        label: 'Danh sách học sinh',
        link: '/dashboard/accounts/students',
      },
    ],
  },
  {
    label: 'Lớp học',
    icon: MdOutlineClass,
    links: [
      { label: 'Danh sách lớp học', link: '/dashboard/classes' },
      { label: 'Thêm lớp học', link: '/dashboard/classes/create' },
    ],
  },
  {
    label: 'Nội dung',
    icon: LuFileArchive,
    links: [
      {
        label: 'Danh sách nội dung',
        link: '/dashboard/contents',
      },
      {
        label: 'Thêm nội dung',
        link: '/dashboard/contents/create',
      },
    ],
  },
];

export default function MenuSidebar() {
  const { clearAuth } = getAuthStore();

  const links = sidebarMenuItems.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify='space-between'>
          LMS Admin Portal
          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <div className='flex w-full justify-center p-2'>
          <Button
            className='w-full'
            variant='subtle'
            color='red'
            leftSection={<LuLogOut />}
            onClick={() => {
              clearAuth();
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </nav>
  );
}
