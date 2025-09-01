import { ProcessBase } from '../process/ProcessBase';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ProcessWorkerProxy<T extends ProcessBase> {
  workerId: string;
  destroy(): Promise<void>;
}

export class ProcessContainerProxy {
  private childProcess: ChildProcess | null = null;
  private messageId = 0;
  private pendingCalls = new Map<number, { resolve: Function; reject: Function }>();
  private workerProxies = new Map<string, ProcessWorkerProxy<any>>();

  constructor() {
    this.initializeWorkerContainer();
  }

  private initializeWorkerContainer() {
    // Fork the dbgate-workers process
    const workerPath = path.resolve(__dirname, '../../../dbgate-workers/dist/index.js');
    console.log('Create new worker container process:', workerPath)
    this.childProcess = fork(workerPath);

    this.childProcess.on('message', (message: any) => {
      if (message.type === 'response' && this.pendingCalls.has(message.id)) {
        const { resolve, reject } = this.pendingCalls.get(message.id)!;
        this.pendingCalls.delete(message.id);

        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      }
    });

    this.childProcess.on('error', (error) => {
      console.error('Worker container process error:', error);
    });

    this.childProcess.on('exit', (code) => {
      console.log('Worker container process exited with code:', code);
      this.childProcess = null;
    });
  }

  async createProcess<Process extends ProcessBase>(
    ProcessClass: new () => Process
  ): Promise<ProcessWorkerProxy<Process> & Process> {
    if (!this.childProcess) {
      throw new Error('Worker container process not available');
    }

    // Get the module path and class name from the ProcessClass
    const processInstance = new ProcessClass();
    const modulePath = processInstance.moduleName || ProcessClass.name;

    const result = await this.sendMessage({
      type: 'new',
      ProcessClass: {
        modulePath,
        className: ProcessClass.name
      }
    });

    const workerId = result.workerId;

    // Create a proxy that forwards method calls to the worker
    const proxy = this.createWorkerProxy<Process>(workerId, ProcessClass);
    this.workerProxies.set(workerId, proxy);

    return proxy as ProcessWorkerProxy<Process> & Process;
  }

  private createWorkerProxy<Process extends ProcessBase>(
    workerId: string,
    ProcessClass: new () => Process
  ): ProcessWorkerProxy<Process> & Process {
    const processInstance = new ProcessClass();
    const prototype = Object.getPrototypeOf(processInstance);
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(name => name !== 'constructor' && typeof prototype[name] === 'function');

    const proxy: any = {
      workerId,
      destroy: async () => {
        await this.destroyWorker(workerId);
        this.workerProxies.delete(workerId);
      }
    };

    // Add all methods from the ProcessClass to the proxy
    methodNames.forEach(methodName => {
      proxy[methodName] = (...args: any[]) => {
        return this.callWorkerMethod(workerId, methodName, args);
      };
    });

    // Copy properties from the process instance
    Object.getOwnPropertyNames(processInstance).forEach(propName => {
      if (typeof (processInstance as any)[propName] !== 'function') {
        proxy[propName] = (processInstance as any)[propName];
      }
    });

    return proxy;
  }

  private async callWorkerMethod(workerId: string, methodName: string, args: any[]): Promise<any> {
    return this.sendMessage({
      type: 'call',
      workerId,
      method: methodName,
      args
    });
  }

  private async destroyWorker(workerId: string): Promise<void> {
    await this.sendMessage({
      type: 'destroy',
      workerId
    });
  }

  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.childProcess) {
        reject(new Error('Worker container process not available'));
        return;
      }

      const id = ++this.messageId;
      this.pendingCalls.set(id, { resolve, reject });

      this.childProcess.send({
        ...message,
        id
      });

      // Set timeout for the call
      setTimeout(() => {
        if (this.pendingCalls.has(id)) {
          this.pendingCalls.delete(id);
          reject(new Error(`Message timeout: ${message.type}`));
        }
      }, 30000); // 30 second timeout
    });
  }

  destroy() {
    if (this.childProcess) {
      this.childProcess.kill();
      this.childProcess = null;
    }
    this.pendingCalls.clear();
    this.workerProxies.clear();
  }
}
