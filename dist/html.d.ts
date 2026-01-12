import { GenerateFormOptions, PaymentPayload } from "./types";
export declare const AZERICARD_PROD_URL = "https://mpi.3dsecure.az/cgi-bin/cgi_link";
export declare const AZERICARD_TEST_URL = "https://testmpi.3dsecure.az/cgi-bin/cgi_link";
export declare function generatePaymentForm(payment: PaymentPayload, options?: GenerateFormOptions): string;
export declare function generateBadRequestHtml(message: string, goBackLink: string): string;
