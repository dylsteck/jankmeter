'use client';

import { useState, useCallback } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<string | null>(null);

  const causeJank = useCallback(() => {
    const start = performance.now();
    while (performance.now() - start < 500) {}
    setCount((c) => c + 1);
  }, []);

  const fetchData = useCallback(async () => {
    setData(null);
    const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const json = await res.json();
    setData(json.title);
  }, []);

  return (
    <main>
      <h1>jankmeter — Next.js Example</h1>
      <p>The jankmeter toolbar should appear at the bottom of this page.</p>

      <section>
        <h2>Counter (Delay Metrics)</h2>
        <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      </section>

      <section>
        <h2>Cause Jank (FPS Drop)</h2>
        <button onClick={causeJank}>Block main thread 500ms</button>
      </section>

      <section>
        <h2>Fetch Data (Network)</h2>
        <button onClick={fetchData}>Fetch post</button>
        {data && <p>{data}</p>}
      </section>
    </main>
  );
}
