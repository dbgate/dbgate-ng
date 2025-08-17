import { ProcessBase } from "./ProcessBase";
import { fork, ChildProcess } from 'child_process';

export class ProcessProxy<Process extends ProcessBase> {
    private childProcess: ChildProcess | null = null;
    private messageId = 0;
    private pendingCalls = new Map<number, { resolve: Function; reject: Function }>();
    
    constructor(private moduleName: string, private ProcessClass: new () => Process) {
        this.initializeChildProcess();
        this.setupMethodProxies();
    }

    private initializeChildProcess() {
        this.childProcess = fork(this.moduleName);
        
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
            console.error('Child process error:', error);
        });

        this.childProcess.on('exit', (code) => {
            console.log('Child process exited with code:', code);
            this.childProcess = null;
        });
    }

    private setupMethodProxies() {
        const processInstance = new this.ProcessClass();
        const prototype = Object.getPrototypeOf(processInstance);
        const methodNames = Object.getOwnPropertyNames(prototype)
            .filter(name => name !== 'constructor' && typeof prototype[name] === 'function');

        methodNames.forEach(methodName => {
            (this as any)[methodName] = (...args: any[]) => {
                return this.callChildMethod(methodName, args);
            };
        });
    }

    private callChildMethod(methodName: string, args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.childProcess) {
                reject(new Error('Child process not available'));
                return;
            }

            const id = ++this.messageId;
            this.pendingCalls.set(id, { resolve, reject });

            this.childProcess.send({
                type: 'call',
                id,
                method: methodName,
                args
            });

            // Set timeout for the call
            setTimeout(() => {
                if (this.pendingCalls.has(id)) {
                    this.pendingCalls.delete(id);
                    reject(new Error(`Method call timeout: ${methodName}`));
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
    }
}