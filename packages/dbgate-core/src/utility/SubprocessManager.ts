import { ProcessBase } from '../process/ProcessBase';
import { ProcessContainerProxy, ProcessWorkerProxy } from './ProcessContainerProxy';

export class SubprocessManager {
  containerProxies: { [id: string]: ProcessContainerProxy } = {};
  workerProxies: { [id: string]: ProcessWorkerProxy<ProcessBase> } = {};

  async getProcessInstance<T extends ProcessBase>(
    pcoid: string,
    pwoid: string,
    ProcessClass: new () => T,
    startup?: (instance: T) => Promise<void>
  ): Promise<T> {
    if (this.workerProxies[pwoid]) {
      return this.workerProxies[pwoid] as unknown as T;
    }

    if (!startup) {
      throw new Error('Process not found and startup function is not provided');
    }

    const containerId = pcoid || pwoid;

    if (!this.containerProxies[containerId]) {
      this.containerProxies[containerId] = new ProcessContainerProxy();
    }
    const instance = await this.containerProxies[containerId].createProcess(ProcessClass);
    this.workerProxies[pwoid] = instance as unknown as ProcessWorkerProxy<ProcessBase>;
    await startup(instance);
    return instance;
  }
}

export const subprocessManager = new SubprocessManager();
