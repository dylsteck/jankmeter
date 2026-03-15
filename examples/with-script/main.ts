import { init } from 'jankmeter';

init();

const app = document.getElementById('app')!;
app.innerHTML = `
  <div style="font-family: system-ui; padding: 2rem; max-width: 600px">
    <h1>jankmeter — Script Example</h1>
    <p>The jankmeter toolbar should appear at the bottom of this page.</p>
    <p>No framework — just vanilla JS with the jankmeter programmatic API.</p>

    <section style="margin-top: 1.5rem">
      <h2>Counter (Delay Metrics)</h2>
      <button id="counter-btn">Count: 0</button>
    </section>

    <section style="margin-top: 1.5rem">
      <h2>Cause Jank (FPS Drop)</h2>
      <button id="jank-btn">Block main thread 500ms</button>
    </section>

    <section style="margin-top: 1.5rem">
      <h2>Fetch Data (Network)</h2>
      <button id="fetch-btn">Fetch post</button>
      <p id="fetch-result"></p>
    </section>
  </div>
`;

let count = 0;
document.getElementById('counter-btn')!.addEventListener('click', () => {
  count++;
  document.getElementById('counter-btn')!.textContent = `Count: ${count}`;
});

document.getElementById('jank-btn')!.addEventListener('click', () => {
  const start = performance.now();
  while (performance.now() - start < 500) {}
  count++;
  document.getElementById('counter-btn')!.textContent = `Count: ${count}`;
});

document.getElementById('fetch-btn')!.addEventListener('click', async () => {
  const result = document.getElementById('fetch-result')!;
  result.textContent = 'Loading...';
  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
  const json = await res.json();
  result.textContent = json.title;
});
