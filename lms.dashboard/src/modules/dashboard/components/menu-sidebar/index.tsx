/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Code, Group, ScrollArea } from '@mantine/core';
import {
  LuBookOpen,
  LuCircleUserRound,
  LuFileArchive,
  LuFileQuestion,
  LuLogOut,
  LuTarget,
} from 'react-icons/lu';
import { MdOutlineClass } from 'react-icons/md';
import { getAuthStore } from '../../../auth/stores/auth-store';
import { LinksGroup } from '../navbar-links-group';
import classes from './menu-sidebar.module.css';

export default function MenuSidebar() {
  const { clearAuth, getCurrentUserRole } = getAuthStore();

  const userRole = getCurrentUserRole();

  const sidebarMenuItems = [
    {
      label: 'Dashboard',
      icon: LuBookOpen,
      initiallyOpened: true,
      href: '/dashboard',
    },
    userRole === 'admin' && {
      label: 'Quản lý tài khoản',
      icon: LuCircleUserRound,
      href: '/dashboard/accounts',
    },
    {
      label: 'Lớp học',
      icon: MdOutlineClass,
      href: '/dashboard/classes',
    },
    {
      label: 'Nội dung',
      icon: LuFileArchive,
      href: '/dashboard/contents',
    },
    {
      label: 'Hỏi & Đáp',
      icon: LuTarget,
      href: '/dashboard/qa',
    },
    userRole === 'teacher' && {
      label: 'Ngân hàng câu hỏi',
      icon: LuFileQuestion,
      href: '/dashboard/quizz',
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.FC<any>;
    initiallyOpened?: boolean;
    href: string;
  }[];

  const links = sidebarMenuItems.map((item) => (
    <LinksGroup {...item} key={item.label} href={item.href} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify='space-between'>
          LMS Admin Portal
          <Code fw={700}>
            {userRole === 'admin'
              ? 'Admin'
              : userRole === 'teacher'
              ? 'Giáo viên'
              : 'Học viên'}
          </Code>
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
