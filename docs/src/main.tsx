import { render } from 'preact';
import { App } from './App';

// Initialize jankmeter toolbar on the docs page itself
import { init } from 'jankmeter';
init();

render(<App />, document.getElementById('app')!);
