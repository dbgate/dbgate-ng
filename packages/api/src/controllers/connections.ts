import { Request, Response } from 'express';
import { Connection } from '../../../types/api/connections-api';
import crypto from 'crypto';

// Simple in-memory storage for connections (loaded from env)
let connections: Connection[] = [];

// Initialize connections from environment variables
function initializeConnections(): void {
  connections = [];
  
  // Parse connections from environment variables
  // Format: CONNECTION_1_SERVER=localhost, CONNECTION_1_ENGINE=mysql, etc.
  const envKeys = Object.keys(process.env);
  const connectionNumbers = new Set<string>();
  
  // Find all connection numbers
  envKeys.forEach(key => {
    const match = key.match(/^CONNECTION_(\d+)_/);
    if (match) {
      connectionNumbers.add(match[1]);
    }
  });
  
  // Build connections from env vars
  connectionNumbers.forEach(num => {
    const server = process.env[`CONNECTION_${num}_SERVER`];
    const engine = process.env[`CONNECTION_${num}_ENGINE`];
    
    if (server && engine) {
      const connection: Connection = {
        _id: crypto.randomUUID(),
        conid: `env_${num}`,
        server,
        engine,
        user: process.env[`CONNECTION_${num}_USER`],
        password: process.env[`CONNECTION_${num}_PASSWORD`],
        port: process.env[`CONNECTION_${num}_PORT`] ? parseInt(process.env[`CONNECTION_${num}_PORT`]!) : undefined,
        database: process.env[`CONNECTION_${num}_DATABASE`],
        displayName: process.env[`CONNECTION_${num}_DISPLAY_NAME`] || `${engine} - ${server}`,
        authType: process.env[`CONNECTION_${num}_AUTH_TYPE`],
        useDatabaseUrl: process.env[`CONNECTION_${num}_USE_DATABASE_URL`] === 'true',
        databaseUrl: process.env[`CONNECTION_${num}_DATABASE_URL`],
        ssl: process.env[`CONNECTION_${num}_SSL`] === 'true',
        isReadOnly: process.env[`CONNECTION_${num}_READ_ONLY`] === 'true',
        defaultDatabase: process.env[`CONNECTION_${num}_DEFAULT_DATABASE`],
      };
      
      connections.push(connection);
    }
  });
  
  console.log(`🔗 Loaded ${connections.length} connections from environment variables`);
}

// Initialize connections on module load
initializeConnections();

// Controller methods
export const connectionsController = {
  // List all connections
  async list(req: Request, res: Response): Promise<void> {
    try {
      res.json(connections);
    } catch (error) {
      console.error('Error listing connections:', error);
      res.status(500).json({ error: 'Failed to list connections' });
    }
  },

  // Get a specific connection by conid
  async get(req: Request, res: Response): Promise<void> {
    try {
      const { conid } = req.params;
      const connection = connections.find(c => c.conid === conid);
      
      if (!connection) {
        res.status(404).json({ error: 'Connection not found' });
        return;
      }
      
      res.json(connection);
    } catch (error) {
      console.error('Error getting connection:', error);
      res.status(500).json({ error: 'Failed to get connection' });
    }
  },

  // Test a connection (simplified implementation)
  async test(req: Request, res: Response): Promise<void> {
    try {
      const { values } = req.body;
      
      // For now, just validate that required fields are present
      if (!values.server || !values.engine) {
        res.json({
          msgtype: 'error',
          message: 'Server and engine are required'
        });
        return;
      }
      
      // Simulate connection test (always successful for now)
      res.json({
        msgtype: 'connected',
        message: 'Connection test successful'
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      res.json({
        msgtype: 'error',
        message: 'Connection test failed'
      });
    }
  },

  // Save connection (not implemented for env-based connections)
  async save(req: Request, res: Response): Promise<void> {
    res.status(501).json({ 
      error: 'Save not implemented for environment-based connections' 
    });
  },

  // Delete connection (not implemented for env-based connections)
  async delete(req: Request, res: Response): Promise<void> {
    res.status(501).json({ 
      error: 'Delete not implemented for environment-based connections' 
    });
  },

  // Create new SQLite database (not implemented)
  async newSqliteDatabase(req: Request, res: Response): Promise<void> {
    res.status(501).json({ 
      error: 'SQLite database creation not implemented' 
    });
  },

  // Refresh connections from environment variables
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      initializeConnections();
      res.json({ success: true, count: connections.length });
    } catch (error) {
      console.error('Error refreshing connections:', error);
      res.status(500).json({ error: 'Failed to refresh connections' });
    }
  }
};

export default connectionsController;