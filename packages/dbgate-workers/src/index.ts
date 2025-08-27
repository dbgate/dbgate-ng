/// <reference types="node" />

import { processClassRegistry } from "dbgate-core";

// Import types directly from the source files
interface ProcessBase {
  moduleName: string;
}

interface ProcessWorkerMessage {
  type: string;
  id: number;
  method?: string;
  args?: any[];
}

// Self-contained ProcessWorker implementation for the worker container
class ProcessWorker<Process extends ProcessBase> {
  private processInstance: Process;

  constructor(ProcessClass: new () => Process) {
    this.processInstance = new ProcessClass();
  }

  async callMethod(methodName: string, args: any[]): Promise<any> {
    const method = (this.processInstance as any)[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${methodName} not found`);
    }
    return await method.apply(this.processInstance, args);
  }
}

interface WorkerInstance {
  id: string;
  worker: ProcessWorker<any>;
}

class WorkerContainer {
  private workers = new Map<string, WorkerInstance>();
  private nextId = 1;

  constructor() {
    this.setupMessageHandler();
  }

  private setupMessageHandler() {
    process.on('message', async (message: any) => {
      try {
        switch (message.type) {
          case 'new':
            await this.handleNewWorker(message);
            break;
          case 'call':
            await this.handleMethodCall(message);
            break;
          case 'destroy':
            await this.handleDestroyWorker(message);
            break;
          default:
            this.sendError(message.id, `Unknown message type: ${message.type}`);
        }
      } catch (error) {
        this.sendError(message.id, error instanceof Error ? error.message : String(error));
      }
    });
  }

  private async handleNewWorker(message: any) {
    const { ProcessClass, id: messageId } = message;
    
    if (!ProcessClass) {
      this.sendError(messageId, 'ProcessClass is required');
      return;
    }

    try {
      // For now, we'll use a registry approach since dynamic imports are complex
      // In a real implementation, you'd register process classes or use a factory
      const ProcessClassConstructor = this.getProcessClass(ProcessClass.className);
      
      if (!ProcessClassConstructor) {
        this.sendError(messageId, `Process class ${ProcessClass.className} not found`);
        return;
      }

      const workerId = `worker_${this.nextId++}`;
      const worker = new ProcessWorker(ProcessClassConstructor);
      
      this.workers.set(workerId, {
        id: workerId,
        worker
      });

      this.sendResponse(messageId, { workerId });
    } catch (error) {
      this.sendError(messageId, `Failed to create worker: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getProcessClass(className: string): (new () => ProcessBase) | null {
    return processClassRegistry[className] || null;
  }

  private async handleMethodCall(message: any) {
    const { workerId, method, args, id: messageId } = message;
    
    const workerInstance = this.workers.get(workerId);
    if (!workerInstance) {
      this.sendError(messageId, `Worker ${workerId} not found`);
      return;
    }

    try {
      // Forward the method call to the specific worker
      const result = await workerInstance.worker.callMethod(method, args);
      this.sendResponse(messageId, result);
    } catch (error) {
      this.sendError(messageId, error instanceof Error ? error.message : String(error));
    }
  }

  private async handleDestroyWorker(message: any) {
    const { workerId, id: messageId } = message;
    
    const workerInstance = this.workers.get(workerId);
    if (!workerInstance) {
      this.sendError(messageId, `Worker ${workerId} not found`);
      return;
    }

    try {
      // Clean up the worker
      this.workers.delete(workerId);
      this.sendResponse(messageId, { success: true });
    } catch (error) {
      this.sendError(messageId, error instanceof Error ? error.message : String(error));
    }
  }

  private sendResponse(id: number, result: any) {
    process.send!({
      type: 'response',
      id,
      result
    });
  }

  private sendError(id: number, error: string) {
    process.send!({
      type: 'response',
      id,
      error
    });
  }
}

// Start the worker container
new WorkerContainer();