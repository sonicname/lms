import { LuCircleUser, LuLogOut } from 'react-icons/lu';
import { Link } from 'react-router';
import useSignOut from '~/modules/auth/hooks/use-sign-out';

export default function TopBar() {
  const { signOut } = useSignOut();

  return (
    <div className='h-10 bg-[#01458D] text-white'>
      <div className='max-w-[1400px] mx-auto flex items-center justify-end h-full p-2 gap-x-4'>
        <Link to='/profile'>
          <div className='flex items-center gap-x-2'>
            <LuCircleUser />
            <span className='text-sm'>Tài khoản</span>
          </div>
        </Link>

        <div
          className='flex items-center gap-x-2 cursor-pointer'
          onClick={signOut}
        >
          <LuLogOut />
          <span className='text-sm'>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
}
