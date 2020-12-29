/**
 * Created by EdgeTech on 12/12/2016.
 */
import { Job } from './job';
import { WorkerQueue } from '../common';

export class BasicJob extends Job {
  constructor(data?: any) {
    super(WorkerQueue.PROCESS_WORK);
    this.data = data;
  }

  public setData(data: any) {
    this.data = data;
    return this;
  }
}
