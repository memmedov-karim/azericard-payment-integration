export type KeySource = {
    type: "path";
    value: string;
} | {
    type: "pem";
    value: string;
};
export interface AzericardKeyConfig {
    privateKey: KeySource;
    publicKey: KeySource;
    bankPublicKey?: KeySource;
}
export interface AzericardMerchantConfig {
    merchantName: string;
    merchantEmail: string;
    terminal: string;
    keys: AzericardKeyConfig;
    currency?: string;
    country?: string;
    merchGmt?: string;
    trType?: number;
    name?: string;
    description?: string;
    defaultSuccessUrl?: string;
    mInfo?: Record<string, unknown> | string;
}
export interface CreatePaymentInput {
    order: string;
    amount: number | string;
    successUrl?: string;
    description?: string;
    mInfo?: Record<string, unknown> | string;
}
export interface PaymentPayload {
    amount: string;
    currency: string;
    order: string;
    description: string;
    merchantName: string;
    successUrl: string;
    terminal: string;
    merchantEmail: string;
    trType: number;
    country: string;
    merchGmt: string;
    timestamp: string;
    nonce: string;
    pSign: string;
    name: string;
    mInfo: string;
    mInfoRaw: string;
}
export interface GenerateFormOptions {
    actionUrl?: string;
    autoSubmit?: boolean;
    formName?: string;
    language?: string;
}
export interface VerifyResponseInput {
    amount?: string | number | null;
    terminal?: string | null;
    approval?: string | null;
    rrn?: string | null;
    intRef?: string | null;
}
