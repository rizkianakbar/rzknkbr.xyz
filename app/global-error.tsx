'use client';

import { Button } from '@/components/ui/button';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
};

export default function GlobalErrorPage(props: GlobalErrorPageProps) {
  const { error } = props;
  console.error(error);

  return (
    <html lang="en">
      <body className="flex flex-col gap-4 justify-center items-center h-screen">
        <h2 className="text-3xl font-bold">Oops! Something went wrong</h2>

        <p>Please try again later or contact support if the problem persists.</p>

        <Button onClick={() => window.location.reload()}>Try again</Button>
      </body>
    </html>
  );
}
