import { ProcessContainerProxy } from '../utility/ProcessContainerProxy';
import { ServerConnectionProcess } from './ServerConnectionProcess';

async function exampleUsage() {
  // Create a process container proxy
  const container = new ProcessContainerProxy();
  
  try {
    // Create a new process worker
    const serverConnection = await container.createProcess(ServerConnectionProcess);
    
    console.log('Worker ID:', serverConnection.workerId);
    
    // Call methods on the process
    const databases = await serverConnection.getDatabases();
    console.log('Databases:', databases);
    
    const tables = await serverConnection.getTableList('database1');
    console.log('Tables:', tables);
    
    // Clean up the worker
    await serverConnection.destroy();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up the container
    container.destroy();
  }
}

// Export for testing
export { exampleUsage };

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}
