import { Injectable } from '@nestjs/common';
import { JobService } from './job.service';
import { ConfigService } from '@nestjs/config';
import { MailOption, SmsOption } from '../interfaces';
import { IEmailName, SmsJob, EmailJob } from '../jobs';
import { QueueTasks } from '../common';

@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigService,
    private readonly jobService: JobService,
  ) {
  }

  queueToSendEmail(option: MailOption) {
    this.handleEmail(
      option.emailName,
      option.fromEmail,
      option.subject,
      option.template,
      option.content,
    );
  }

  queueToSendSms(option: SmsOption) {
    this.handleSMS(option.mobile.phoneNumber, option.template, option.content);
  }

  handleEmail(
    emailName: IEmailName,
    fromEmail: IEmailName,
    subject: string,
    template: string,
    additionalContent: any = {},
  ) {
    const emailJob = new EmailJob()
      .setFrom(fromEmail)
      .setTo(emailName)
      .setSubject(subject)
      .setTemplate(template)
      .setContent(additionalContent);

    this.jobService.addJobToQueue(emailJob, QueueTasks.SEND_EMAIL);
  }

  handleSMS(phone: string, template: string, content: any, config: any = {}) {
    const job = new SmsJob()
      .setFrom(config.from)
      .setTo(phone)
      .setTemplate(template)
      .setContent(content);

    this.jobService.addJobToQueue(job, QueueTasks.SEND_SMS);
  }
}
