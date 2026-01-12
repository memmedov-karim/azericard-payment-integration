import { AzericardMerchantConfig, CreatePaymentInput, PaymentPayload, VerifyResponseInput } from "./types";
export declare class AzericardPaymentClient {
    private config;
    private privateKey?;
    private publicKey?;
    private bankPublicKey?;
    constructor(config: AzericardMerchantConfig);
    createPayment(input: CreatePaymentInput): Promise<PaymentPayload>;
    verifyResponseSignature(input: VerifyResponseInput, signatureHex: string): Promise<boolean>;
    private signPayload;
    private getPrivateKey;
    private getPublicKey;
    private getBankPublicKey;
    private loadKey;
}
