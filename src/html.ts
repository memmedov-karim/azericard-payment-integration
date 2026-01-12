import { GenerateFormOptions, PaymentPayload } from "./types";

export const AZERICARD_PROD_URL = "https://mpi.3dsecure.az/cgi-bin/cgi_link";
export const AZERICARD_TEST_URL = "https://testmpi.3dsecure.az/cgi-bin/cgi_link";

export function generatePaymentForm(
  payment: PaymentPayload,
  options: GenerateFormOptions = {}
): string {
  const actionUrl = options.actionUrl ?? AZERICARD_PROD_URL;
  const autoSubmit = options.autoSubmit ?? true;
  const formName = options.formName ?? "azericardpaymentform";
  const language = options.language ?? "AZ";

  const submitScript = autoSubmit
    ? `<script>window.onload = function() { document.forms['${formName}'].submit() }</script>`
    : "";

  return `
    <form ACTION="${actionUrl}" METHOD="POST" name="${formName}">
      <input name="AMOUNT" value="${payment.amount}" type="hidden">
      <input name="CURRENCY" value="${payment.currency}" type="hidden">
      <input name="ORDER" value="${payment.order}" type="hidden">
      <input name="DESC" value="${payment.description}" type="hidden">
      <input name="MERCH_NAME" value="${payment.merchantName}" type="hidden">
      <input name="MERCH_URL" value="${payment.successUrl}" type="hidden">
      <input name="TERMINAL" value="${payment.terminal}" type="hidden">
      <input name="EMAIL" value="${payment.merchantEmail}" type="hidden">
      <input name="TRTYPE" value="${payment.trType}" type="hidden">
      <input name="COUNTRY" value="${payment.country}" type="hidden">
      <input name="MERCH_GMT" value="${payment.merchGmt}" type="hidden">
      <input name="BACKREF" value="${payment.successUrl}" type="hidden">
      <input name="TIMESTAMP" value="${payment.timestamp}" type="hidden">
      <input name="NONCE" value="${payment.nonce}" type="hidden">
      <input name="LANG" value="${language}" type="hidden">
      <input name="P_SIGN" value="${payment.pSign}" type="hidden">
      <input name="NAME" value="${payment.name}" type="hidden">
      <input name="M_INFO" value="${payment.mInfo}" type="hidden">
      <input alt="Submit" type="submit" style="display: none">
    </form>
    ${submitScript}
  `;
}

export function generateBadRequestHtml(message: string, goBackLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Status</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
        }
        .message {
          font-size: 1.5em;
          color: #d9534f;
          margin-bottom: 20px;
        }
        .button {
          padding: 10px 20px;
          font-size: 1em;
          color: #fff;
          background-color: #0275d8;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
        }
        .button:hover {
          background-color: #025aa5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="message">${message}</div>
        <a href="${goBackLink}" class="button">Geri Qayit</a>
      </div>
    </body>
    </html>
  `;
}
