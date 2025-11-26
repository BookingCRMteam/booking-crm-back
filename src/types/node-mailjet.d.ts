declare module 'node-mailjet' {
  interface MailjetConfig {
    apiKey: string;
    apiSecret: string;
  }

  interface EmailAddress {
    Email: string;
    Name?: string;
  }

  interface EmailMessage {
    From: EmailAddress;
    To: EmailAddress[];
    Subject: string;
    TextPart?: string;
    HTMLPart?: string;
  }

  interface SendRequest {
    Messages: EmailMessage[];
  }

  interface RequestOptions {
    version?: string;
  }

  interface Request {
    request(data: SendRequest): Promise<any>;
  }

  class Mailjet {
    constructor(config: MailjetConfig);
    post(resource: string, options?: RequestOptions): Request;
  }

  export = Mailjet;
}
