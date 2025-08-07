# DBGate API

Backend API server for DBGate built with Express.js and TypeScript.

## Features

- Express.js server with TypeScript
- CORS enabled for cross-origin requests
- JSON request/response handling
- Health check endpoint
- Error handling middleware
- Development hot-reload with tsx

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

From the root directory:

```bash
pnpm install
```

### Development

Start the development server with hot-reload:

```bash
pnpm --filter dbgate-api dev
```

The server will start on `http://localhost:3001`

### Building

Build the TypeScript code:

```bash
pnpm --filter dbgate-api build
```

### Production

Start the production server:

```bash
pnpm --filter dbgate-api start
```

## API Endpoints

- `GET /` - Server status and information
- `GET /api/health` - Health check endpoint

## Environment Variables

- `PORT` - Server port (default: 3001)

## Development

The API is structured to be extended with additional routes and middleware. Add new routes in the `src/` directory and import them in `src/index.ts`.
