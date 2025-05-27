# DbGate - new generation
This project is a POC of [DbGate](https://github.com//dbgate/dbgate) **partial rewrite**.  
It is now in analysis state, it is not sure, whether this will be realized

## Why?
- Code will be more easy to understand for more people
- Simplify build system
  - Easier to develop
  - Much faster builds
- Use newer technology stack
- Ability to create better looking UI

## What to change?
- use 100% TypeScript
- use ES modules instead of CommonJS modules
- use modern "native" bundler, eg. esbuild or SWC
- Use solid.js instead of Svelte
  - Svelte 5 completely changed syntax and semantics, currently used syntax in DbGate is already obsolete
  - solid.js has simpler build pipeline (it uses JSX) and better TypeScript support
- Use Tailwind CSS ass CSS toolkit
  - no need to scoped CSS
  - many developers are familiar with this
- Redesign plugin system
  - drop backend plugins, it will became "drivers" and will be not pluggable (file formats and database support)
  - enhance power for "frontend" plugins - now suitable only for color themes

## What to keep?
- Layout, functionality
- TS libraries (filterparser, sqltree, tools, datalib)
- Open-source base repo (GPL or MIT) + Premium private repo (synced with [diflow](https://github.com/dbgate/diflow))
- Desktop app, Web, Docker and NPM builds
- NPM packages usable without DbGate UI

## What to decide? - ideas to be examined
- Use Tauri/Pake instead of Electron (https://github.com/dbgate/dbgate/issues/905)
- Really use solid.js instead of Svelte?
- Really use Tailwind CSS? Or make own CSS classes?
- Open-source repo, premium repo - could be used eg. git submodules instead of diflow merging?
- Use process isolation for database connections?
  - It brings bigger complexity
  - It is very safe, event with buggy database drivers, especially when using mutli-user web app
