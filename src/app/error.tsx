"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Oh no! Something went wrong! 🙈</h2>
        <p>{error.digest}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
