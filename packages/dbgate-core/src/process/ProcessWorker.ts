import { ProcessBase } from "./ProcessBase";

export class ProcessWorker<Process extends ProcessBase> {
    private processInstance: Process;

    constructor(ProcessClass: new () => Process) {
        this.processInstance = new ProcessClass();
        this.setupMessageHandler();
    }

    private setupMessageHandler() {
        process.on('message', async (message: any) => {
            if (message.type === 'call') {
                try {
                    const method = (this.processInstance as any)[message.method];
                    if (typeof method !== 'function') {
                        throw new Error(`Method ${message.method} not found`);
                    }

                    const result = await method.apply(this.processInstance, message.args);
                    
                    process.send!({
                        type: 'response',
                        id: message.id,
                        result
                    });
                } catch (error) {
                    process.send!({
                        type: 'response',
                        id: message.id,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        });
    }

    // Method for direct method calls (used by the worker container)
    async callMethod(methodName: string, args: any[]): Promise<any> {
        const method = (this.processInstance as any)[methodName];
        if (typeof method !== 'function') {
            throw new Error(`Method ${methodName} not found`);
        }
        return await method.apply(this.processInstance, args);
    }
}

// Helper function to create a worker for a specific process class
export function createWorker<Process extends ProcessBase>(ProcessClass: new () => Process) {
    return new ProcessWorker(ProcessClass);
}
