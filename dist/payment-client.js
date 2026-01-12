"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzericardPaymentClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const DEFAULTS = {
    currency: "AZN",
    country: "AZ",
    merchGmt: "+4",
    trType: 1,
    description: "Payment",
};
function formatUtcTimestamp(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return (String(date.getUTCFullYear()) +
        pad(date.getUTCMonth() + 1) +
        pad(date.getUTCDate()) +
        pad(date.getUTCHours()) +
        pad(date.getUTCMinutes()) +
        pad(date.getUTCSeconds()));
}
function fieldValue(value) {
    if (value === null || value === undefined) {
        return "-";
    }
    const stringValue = String(value);
    return `${stringValue.length}${stringValue}`;
}
function normalizePem(value) {
    return value.replace(/\r\n/g, "\n");
}
function generateNonce(length) {
    const bytes = crypto_1.default.randomBytes(Math.ceil(length / 2));
    return bytes.toString("hex").slice(0, length);
}
function buildMInfo(raw) {
    const rawString = typeof raw === "string" ? raw : JSON.stringify(raw !== null && raw !== void 0 ? raw : {});
    return {
        raw: rawString,
        encoded: Buffer.from(rawString, "utf-8").toString("base64"),
    };
}
class AzericardPaymentClient {
    constructor(config) {
        this.config = config;
    }
    async createPayment(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const successUrl = (_a = input.successUrl) !== null && _a !== void 0 ? _a : this.config.defaultSuccessUrl;
        if (!successUrl) {
            throw new Error("successUrl is required to create payment");
        }
        const amount = String(input.amount);
        const currency = (_b = this.config.currency) !== null && _b !== void 0 ? _b : DEFAULTS.currency;
        const trType = (_c = this.config.trType) !== null && _c !== void 0 ? _c : DEFAULTS.trType;
        const timestamp = formatUtcTimestamp(new Date());
        const nonce = generateNonce(16);
        const { raw: mInfoRaw, encoded: mInfoEncoded } = buildMInfo((_d = input.mInfo) !== null && _d !== void 0 ? _d : this.config.mInfo);
        const signBody = fieldValue(amount) +
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
            description: (_f = (_e = input.description) !== null && _e !== void 0 ? _e : this.config.description) !== null && _f !== void 0 ? _f : DEFAULTS.description,
            merchantName: this.config.merchantName,
            successUrl,
            terminal: this.config.terminal,
            merchantEmail: this.config.merchantEmail,
            trType,
            country: (_g = this.config.country) !== null && _g !== void 0 ? _g : DEFAULTS.country,
            merchGmt: (_h = this.config.merchGmt) !== null && _h !== void 0 ? _h : DEFAULTS.merchGmt,
            timestamp,
            nonce,
            pSign,
            name: (_j = this.config.name) !== null && _j !== void 0 ? _j : this.config.merchantName,
            mInfo: mInfoEncoded,
            mInfoRaw,
        };
    }
    async verifyResponseSignature(input, signatureHex) {
        var _a, _b, _c, _d, _e;
        const signBody = fieldValue((_a = input.amount) !== null && _a !== void 0 ? _a : null) +
            fieldValue((_b = input.terminal) !== null && _b !== void 0 ? _b : null) +
            fieldValue((_c = input.approval) !== null && _c !== void 0 ? _c : null) +
            fieldValue((_d = input.rrn) !== null && _d !== void 0 ? _d : null) +
            fieldValue((_e = input.intRef) !== null && _e !== void 0 ? _e : null);
        const publicKey = await this.getBankPublicKey();
        const verifier = crypto_1.default.createVerify("SHA256");
        verifier.update(signBody);
        verifier.end();
        return verifier.verify(publicKey, Buffer.from(signatureHex, "hex"));
    }
    async signPayload(payload) {
        const privateKey = await this.getPrivateKey();
        const signer = crypto_1.default.createSign("SHA256");
        signer.update(payload);
        signer.end();
        return signer.sign(privateKey).toString("hex");
    }
    async getPrivateKey() {
        if (!this.privateKey) {
            this.privateKey = await this.loadKey(this.config.keys.privateKey, "private");
        }
        return this.privateKey;
    }
    async getPublicKey() {
        if (!this.publicKey) {
            this.publicKey = await this.loadKey(this.config.keys.publicKey, "public");
        }
        return this.publicKey;
    }
    async getBankPublicKey() {
        if (!this.bankPublicKey) {
            if (this.config.keys.bankPublicKey) {
                this.bankPublicKey = await this.loadKey(this.config.keys.bankPublicKey, "public");
            }
            else {
                this.bankPublicKey = await this.getPublicKey();
            }
        }
        return this.bankPublicKey;
    }
    async loadKey(source, type) {
        const pem = source.type === "path"
            ? normalizePem(await promises_1.default.readFile(source.value, "utf8"))
            : normalizePem(source.value);
        return type === "private"
            ? crypto_1.default.createPrivateKey(pem)
            : crypto_1.default.createPublicKey(pem);
    }
}
exports.AzericardPaymentClient = AzericardPaymentClient;
