// liqpayjs-sdk.d.ts

declare module 'liqpayjs-sdk' {
  export interface LiqPayParams {
    public_key?: string;
    version?: number | string;
    action: string;
    amount: number | string;
    currency: string;
    description: string;
    order_id: string;
    server_url: string;
    result_url: string;
    language?: string;
    sandbox?: boolean | 0 | 1;
    [key: string]: unknown; // Дозволяємо інші параметри
  }

  interface LiqPayCnbForm {
    cnb_form: string;
    signature: string;
  }

  export default class LiqPay {
    constructor(publicKey: string, privateKey: string);

    public_key: string;
    private_key: string;

    cnb_form(params: LiqPayParams): string;
    str_to_sign(str: string): string;
  }
}
