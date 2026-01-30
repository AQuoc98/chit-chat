# @chit-chat/eslint-config

Shared ESLint configuration for the Chit Chat monorepo.

## Exports

- `@chit-chat/eslint-config/base` - Base configuration with TypeScript and Turbo plugin
- `@chit-chat/eslint-config/react` - React configuration extending base with React Hooks and React Refresh plugins

## Usage

### For React apps

```javascript
import config from '@chit-chat/eslint-config/react';

export default config;
```

### For Node.js apps

```javascript
import config from '@chit-chat/eslint-config/base';

export default config;
```
