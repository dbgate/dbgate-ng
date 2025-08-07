# DBGate Shell

Core TypeScript library for DBGate functionality without Express dependencies. This package contains shared business logic that can be used across different DBGate packages.

## Features

- **Connection Management**: Parse, validate, and manage database connections
- **Environment Configuration**: Load connections from environment variables
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Utility Functions**: Common utilities for logging, error handling, and data manipulation
- **No Express Dependencies**: Pure TypeScript library that can be used in any environment

## Installation

```bash
pnpm install dbgate-shell
```

## Usage

### Connection Management

```typescript
import { ConnectionManager, parseConnectionsFromEnv } from 'dbgate-shell';

// Load connections from environment variables
const connections = parseConnectionsFromEnv();

// Use the connection manager
const manager = new ConnectionManager();
manager.loadFromEnvironment();

// Get all connections
const allConnections = manager.getAll();

// Find a specific connection
const connection = manager.getById('env_1');
```

### Environment Variables Format

```bash
# Connection 1 - MySQL
CONNECTION_1_SERVER=localhost
CONNECTION_1_ENGINE=mysql
CONNECTION_1_USER=root
CONNECTION_1_PASSWORD=password
CONNECTION_1_PORT=3306
CONNECTION_1_DATABASE=myapp
CONNECTION_1_DISPLAY_NAME=Local MySQL

# Connection 2 - PostgreSQL
CONNECTION_2_SERVER=localhost
CONNECTION_2_ENGINE=postgresql
CONNECTION_2_USER=postgres
CONNECTION_2_PASSWORD=password
CONNECTION_2_PORT=5432
CONNECTION_2_DATABASE=testdb
CONNECTION_2_DISPLAY_NAME=Local PostgreSQL
```

### Utilities

```typescript
import { generateId, createLogger, retry, formatBytes } from 'dbgate-shell';

// Generate unique IDs
const id = generateId();

// Create a logger
const logger = createLogger('MyApp');
logger.info('Application started');

// Retry with exponential backoff
await retry(async () => {
  // Some operation that might fail
}, { maxAttempts: 3, delay: 1000 });

// Format bytes
const size = formatBytes(1024); // "1 KB"
```

### Connection Validation

```typescript
import { validateConnection, testConnection } from 'dbgate-shell';

// Validate connection config
const validation = validateConnection({
  server: 'localhost',
  engine: 'mysql',
  port: 3306
});

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Test connection
const result = await testConnection({
  server: 'localhost',
  engine: 'mysql',
  user: 'root',
  password: 'password'
});

if (result.msgtype === 'connected') {
  console.log('Connection successful!');
} else {
  console.error('Connection failed:', result.message);
}
```

## API Reference

### Connection Management

- `parseConnectionsFromEnv(env?)` - Parse connections from environment variables
- `findConnectionById(connections, conid)` - Find connection by ID
- `validateConnection(config)` - Validate connection configuration
- `testConnection(config)` - Test database connection
- `maskConnection(connection)` - Mask sensitive connection data
- `getSupportedEngines()` - Get list of supported database engines

### ConnectionManager Class

- `loadFromEnvironment(env?)` - Load connections from environment
- `getAll()` - Get all connections
- `getById(conid)` - Get connection by ID
- `add(connection)` - Add new connection
- `remove(conid)` - Remove connection
- `update(conid, updates)` - Update connection
- `count()` - Get connection count
- `clear()` - Clear all connections

### Utilities

- `generateId()` - Generate unique UUID
- `generateConnectionId(prefix?)` - Generate connection ID with prefix
- `safeJsonParse(json, defaultValue)` - Safe JSON parsing
- `deepClone(obj)` - Deep clone object
- `isEmpty(value)` - Check if value is empty
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `sleep(ms)` - Sleep/delay function
- `retry(fn, options?)` - Retry with exponential backoff
- `formatBytes(bytes, decimals?)` - Format bytes to human readable
- `isValidEmail(email)` - Validate email format
- `isValidUrl(url)` - Validate URL format
- `extractErrorMessage(error)` - Extract error message from various types
- `createLogger(prefix?)` - Create logger with different levels

## Development

### Building

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Cleaning

```bash
pnpm clean
```

## License

MIT
