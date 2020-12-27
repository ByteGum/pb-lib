import { QueueableData } from '../interfaces';
import { Utils } from '../utils';
import { WorkerQueue } from '../common';

export abstract class Job implements QueueableData {
  public queueName: string;
  protected id: string;
  protected data?: string;

  constructor(queueName: WorkerQueue, data?: any) {
    this.queueName = queueName;
    this.data = data;
    this.id = Utils.generateRandomID(16);
  }

  public getId() {
    return this.id;
  }

  public setData(data: any) {
    this.data = data;
    return this;
  }

  public getData(data: any) {
    return this.data;
  }
}
