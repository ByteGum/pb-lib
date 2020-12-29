import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from '../jobs';
import { QueueTasks, WorkerService } from '../common';
import { WorkerException } from '../exceptions';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class JobService {
  constructor(
    @Inject(WorkerService.WORKER_SERVICE_TOKEN) private readonly client: ClientProxy,
  ) {}

  public addJobToQueue(job: Job, task: QueueTasks) {
    Logger.log(`Sent Job::::${job.queueName} Task:${task}`);
    this.client.send(task, job).subscribe(
      (res) =>
        Logger.log(
          `Finished Job:::: ${job.queueName}, Task:${task} in ${res.duration}`,
        ),
      (e) => Logger.error(new WorkerException(e)),
    );
  }

  public send(task: any, job: Job) {
    Logger.log(`Sent Job::::${job.queueName} Task:${task}`);
    this.client.send(task, job.getData()).subscribe(
      (res) =>
        Logger.log(
          `Finished Job:::: ${job.queueName}, Task:${task} in ${res.duration}`,
        ),
      (e) => Logger.error(new WorkerException(e)),
    );
  }
}
