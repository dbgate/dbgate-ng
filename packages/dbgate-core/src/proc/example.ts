import { ProcessProxy } from "./ProcessProxy";
import { ServerConnectionProcess } from "./ServerConnectionProcess";
import path from "path";

// Example usage of ProcessProxy with ServerConnectionProcess
async function exampleUsage() {
    // Create a proxy that forks the ServerConnectionWorker module
    const workerPath = path.join(__dirname, 'ServerConnectionWorker.js');
    const proxy = new ProcessProxy(workerPath, ServerConnectionProcess);

    try {
        // Now you can call methods on the proxy as if it were a ServerConnectionProcess instance
        // The calls will be forwarded to the child process
        const databases = await (proxy as any).getDatabases();
        console.log('Databases:', databases);
        
    } catch (error) {
        console.error('Error calling getDatabases:', error);
    } finally {
        // Clean up the child process
        proxy.destroy();
    }
}

// Uncomment to run the example
// exampleUsage();
