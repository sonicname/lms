import { useForm, type FormValidateInput } from '@mantine/form';
import type { FormEvent, ReactNode } from 'react';

type CommonRecord = Record<string, unknown>;

type AuthFormProps<Values extends CommonRecord> = {
  values?: Values;
  validate?: FormValidateInput<Values>;
  handleSubmit: (
    values: Values,
    event: FormEvent<HTMLFormElement> | undefined,
  ) => void | Promise<unknown>;
  children: (form: ReturnType<typeof useForm<Values>>) => ReactNode;
};

export default function AuthForm<Values extends CommonRecord>(
  props: AuthFormProps<Values>,
) {
  const { values, validate } = props;

  const form = useForm({
    initialValues: values,
    validate: validate ?? undefined,
  });

  return (
    <form onSubmit={form.onSubmit(props.handleSubmit)}>
      {props.children(form)}
    </form>
  );
}
