# Contributing

Thanks for your interest in jankmeter! Here’s how to get started.

## Setup

- **Runtime:** Bun (see `packageManager` in `package.json`)
- **Install:** `bun install`
- **Build:** `bun run build`
- **Test:** `bun test`

## Development

- Source lives in `src/` — core in `src/core/`, adapters in `src/react/`, `src/vite/`, `src/webpack/`, `src/next/`
- Tests are in `tests/` (57 tests across 9 files)
- Examples in `examples/` for manual testing (Vite, Next.js, Webpack, script)

## Submitting changes

1. Fork the repo and open a branch
2. Make your changes; keep tests passing (`bun test`)
3. Open a PR with a clear description of the change

For larger changes, open an issue first to discuss.