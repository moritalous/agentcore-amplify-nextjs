import { Sha256 } from '@aws-crypto/sha256-universal';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function signAwsRequest(
  url: string,
  body: object,
  headers: Record<string, string>,
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  },
  options: {
    service: string;
    region: string;
    method: string;
  }
) {

  const signedUrl = new URL(url);
  const bodyString = JSON.stringify(body);

  const signer = new SignatureV4({
    service: options.service,
    region: options.region,
    credentials,
    sha256: Sha256,
    applyChecksum: false,
    uriEscapePath: true
  });

  const request = new HttpRequest({
    method: options.method,
    protocol: signedUrl.protocol,
    hostname: signedUrl.hostname,
    path: signedUrl.pathname,
    query: Object.fromEntries(signedUrl.searchParams),
    headers: headers,
    body: bodyString
  });

  const signedRequest = await signer.sign(request);

  return {
    headers: signedRequest.headers,
    body: bodyString,
  };
}
