import {IEmailName} from '../jobs';

export interface MailOption {
  emailName: IEmailName;
  subject: string;
  template: string;
  content?: any;
}
