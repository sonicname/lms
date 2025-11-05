import SignInForm from '../../components/form/sign-in-form';

export default function SignInPage() {
  return (
    <div className='relative h-full w-full'>
      <div className='max-w-[556px] w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-200 rounded-lg p-8'>
        <SignInForm />
      </div>
    </div>
  );
}
