# dbgate-api-core

Core API controllers and middleware for DBGate. This package contains the business logic and controller implementations that can be used by different API servers.

## Features

- Connection management controllers
- Express middleware for API routing
- Type-safe controller implementations
- Modular architecture for easy extension

## Dependencies

- `dbgate-core`: Core utilities and base functionality
- `dbgate-tools`: Shared tools and utilities
- `express`: Web framework for API routing
- `lodash`: Utility library

## Usage

```typescript
import { useAllControllers } from 'dbgate-api-core';

// In your Express app
useAllControllers(app, electron);
```
