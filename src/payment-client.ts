import crypto from "crypto";
import fs from "fs/promises";
import {
  AzericardMerchantConfig,
  CreatePaymentInput,
  PaymentPayload,
  KeySource,
  VerifyResponseInput,
} from "./types";

const DEFAULTS = {
  currency: "AZN",
  country: "AZ",
  merchGmt: "+4",
  trType: 1,
  description: "Payment",
} as const;

function formatUtcTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    String(date.getUTCFullYear()) +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds())
  );
}

function fieldValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  const stringValue = String(value);
  return `${stringValue.length}${stringValue}`;
}

function normalizePem(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function generateNonce(length: number): string {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").slice(0, length);
}

function buildMInfo(raw: Record<string, unknown> | string | undefined): {
  raw: string;
  encoded: string;
} {
  const rawString = typeof raw === "string" ? raw : JSON.stringify(raw ?? {});
  return {
    raw: rawString,
    encoded: Buffer.from(rawString, "utf-8").toString("base64"),
  };
}

export class AzericardPaymentClient {
  private config: AzericardMerchantConfig;
  private privateKey?: crypto.KeyObject;
  private publicKey?: crypto.KeyObject;
  private bankPublicKey?: crypto.KeyObject;

  constructor(config: AzericardMerchantConfig) {
    this.config = config;
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentPayload> {
    const successUrl = input.successUrl ?? this.config.defaultSuccessUrl;
    if (!successUrl) {
      throw new Error("successUrl is required to create payment");
    }

    const amount = String(input.amount);
    const currency = this.config.currency ?? DEFAULTS.currency;
    const trType = this.config.trType ?? DEFAULTS.trType;
    const timestamp = formatUtcTimestamp(new Date());
    const nonce = generateNonce(16);
    const { raw: mInfoRaw, encoded: mInfoEncoded } = buildMInfo(
      input.mInfo ?? this.config.mInfo
    );

    const signBody =
      fieldValue(amount) +
      fieldValue(currency) +
      fieldValue(this.config.terminal) +
      fieldValue(trType) +
      fieldValue(timestamp) +
      fieldValue(nonce) +
      fieldValue(successUrl);

    const pSign = await this.signPayload(signBody);

    return {
      amount,
      currency,
      order: input.order,
      description: input.description ?? this.config.description ?? DEFAULTS.description,
      merchantName: this.config.merchantName,
      successUrl,
      terminal: this.config.terminal,
      merchantEmail: this.config.merchantEmail,
      trType,
      country: this.config.country ?? DEFAULTS.country,
      merchGmt: this.config.merchGmt ?? DEFAULTS.merchGmt,
      timestamp,
      nonce,
      pSign,
      name: this.config.name ?? this.config.merchantName,
      mInfo: mInfoEncoded,
      mInfoRaw,
    };
  }

  async verifyResponseSignature(
    input: VerifyResponseInput,
    signatureHex: string
  ): Promise<boolean> {
    const signBody =
      fieldValue(input.amount ?? null) +
      fieldValue(input.terminal ?? null) +
      fieldValue(input.approval ?? null) +
      fieldValue(input.rrn ?? null) +
      fieldValue(input.intRef ?? null);

    const publicKey = await this.getBankPublicKey();
    const verifier = crypto.createVerify("SHA256");
    verifier.update(signBody);
    verifier.end();
    return verifier.verify(publicKey, Buffer.from(signatureHex, "hex"));
  }

  private async signPayload(payload: string): Promise<string> {
    const privateKey = await this.getPrivateKey();
    const signer = crypto.createSign("SHA256");
    signer.update(payload);
    signer.end();
    return signer.sign(privateKey).toString("hex");
  }

  private async getPrivateKey(): Promise<crypto.KeyObject> {
    if (!this.privateKey) {
      this.privateKey = await this.loadKey(this.config.keys.privateKey, "private");
    }
    return this.privateKey;
  }

  private async getPublicKey(): Promise<crypto.KeyObject> {
    if (!this.publicKey) {
      this.publicKey = await this.loadKey(this.config.keys.publicKey, "public");
    }
    return this.publicKey;
  }

  private async getBankPublicKey(): Promise<crypto.KeyObject> {
    if (!this.bankPublicKey) {
      if (this.config.keys.bankPublicKey) {
        this.bankPublicKey = await this.loadKey(
          this.config.keys.bankPublicKey,
          "public"
        );
      } else {
        this.bankPublicKey = await this.getPublicKey();
      }
    }
    return this.bankPublicKey;
  }

  private async loadKey(
    source: KeySource,
    type: "private" | "public"
  ): Promise<crypto.KeyObject> {
    const pem =
      source.type === "path"
        ? normalizePem(await fs.readFile(source.value, "utf8"))
        : normalizePem(source.value);

    return type === "private"
      ? crypto.createPrivateKey(pem)
      : crypto.createPublicKey(pem);
  }
}
