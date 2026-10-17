import { useTransition } from 'react';
import type { ReactNode } from 'react';

import Spinner from './Spinner';

export default function Button({
  children,
  onClick
}: {
  children: ReactNode;
  onClick: any;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: any) => {
    startTransition(() => {
      onClick(e);
    });
  };

  return (
    <>
      <button onClick={handleClick} disabled={isPending}>
        {children} {isPending ? <Spinner /> : null}
      </button>
    </>
  );
}
