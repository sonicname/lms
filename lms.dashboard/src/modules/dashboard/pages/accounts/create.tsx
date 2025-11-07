import { Card, Title } from '@mantine/core';
import CreateAccountForm from '../../../components/../dashboard/components/create-account-form.tsx';

export default function CreateNewAccountPage() {
  return (
    <div className='max-w-[720px] mx-auto w-full p-6'>
      <Title order={3} mb='md'>
        Tạo tài khoản mới
      </Title>
      <Card withBorder radius='md' padding='lg'>
        <CreateAccountForm />
      </Card>
    </div>
  );
}
