import crypto from 'crypto';

type BoxNowTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type BoxNowParcel = {
  id: string;
};

type BoxNowDeliveryResponse = {
  referenceNumber?: string;
  parcels?: BoxNowParcel[];
};

type BoxNowLabelResponse =
  | string
  | {
      url?: string;
      labelUrl?: string;
      labels?: Array<{ url?: string }>;
    };

let tokenCache: { token: string; expiresAt: number } | null = null;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getBoxNowApiUrl(): string {
  return (process.env.BOXNOW_API_URL || 'https://api-production.boxnow.hr').replace(/\/$/, '');
}

function buildHeaders(token: string): Record<string, string> {
  const partnerId = process.env.BOXNOW_PARTNER_ID;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(partnerId ? { 'X-PartnerID': partnerId } : {}),
  };
}

export async function getBoxNowAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 15_000) {
    return tokenCache.token;
  }

  const baseUrl = getBoxNowApiUrl();
  const response = await fetch(`${baseUrl}/api/v1/auth-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: getEnv('BOXNOW_CLIENT_ID'),
      client_secret: getEnv('BOXNOW_CLIENT_SECRET'),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`BoxNow auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as BoxNowTokenResponse;
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export function mapBoxNowError(status: number, payloadText: string): string {
  const raw = (payloadText || '').trim();
  const normalized = raw.toLowerCase();
  const compactRaw = raw.replace(/\s+/g, ' ').slice(0, 280);

  if (normalized.includes('p410')) return 'Order number already exists in BoxNow.';
  if (normalized.includes('p411')) return 'Partner is not allowed to use COD.';
  if (normalized.includes('p405') || normalized.includes('c404')) return 'Invalid phone format.';
  if (normalized.includes('p402')) return 'Invalid destination location ID.';
  if (normalized.includes('p401')) return 'Invalid origin location ID.';
  if (normalized.includes('p406')) return 'Invalid parcel size. Use 1, 2 or 3.';
  if (normalized.includes('p412')) {
    return 'Customer return nije omogućen za vaš BoxNow partner račun (P412). Kontaktirajte BoxNow podršku.';
  }
  if (status === 503) return 'BoxNow temporary unavailable (503).';

  // Keep a short provider payload fragment to speed up diagnosis of unknown 4xx/5xx.
  if (compactRaw) {
    return `BoxNow request failed (${status}): ${compactRaw}`;
  }

  return `BoxNow request failed (${status}).`;
}

type CreateDeliveryRequestInput = {
  orderNumber: string;
  invoiceValue: string;
  paymentMode: 'prepaid' | 'cod';
  amountToBeCollected: string;
  allowReturn: boolean;
  origin: {
    contactNumber: string;
    contactEmail: string;
    contactName: string;
    locationId: string;
    title?: string;
    name?: string;
    addressLine1?: string;
    postalCode?: string;
    country?: string;
  };
  destination: {
    contactNumber: string;
    contactEmail: string;
    contactName: string;
    locationId: string;
  };
  items: Array<{
    id: string;
    name: string;
    value: string;
    weight: number | null;
    compartmentSize?: 1 | 2 | 3;
  }>;
};

export async function createBoxNowDeliveryRequest(input: CreateDeliveryRequestInput) {
  const baseUrl = getBoxNowApiUrl();
  const token = await getBoxNowAccessToken();
  const response = await fetch(`${baseUrl}/api/v1/delivery-requests`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(mapBoxNowError(response.status, errorText));
  }

  return (await response.json()) as BoxNowDeliveryResponse;
}

export async function fetchBoxNowLabel(parcelId: string): Promise<string | null> {
  const baseUrl = getBoxNowApiUrl();
  const token = await getBoxNowAccessToken();
  const response = await fetch(`${baseUrl}/api/v1/parcels/${parcelId}/label.pdf`, {
    method: 'GET',
    headers: {
      ...buildHeaders(token),
      accept: 'application/json, text/plain, application/pdf',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(mapBoxNowError(response.status, errorText));
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    return null;
  }

  const data = (await response.json()) as BoxNowLabelResponse;
  if (typeof data === 'string') return data;
  return data.url || data.labelUrl || data.labels?.[0]?.url || null;
}

export async function cancelBoxNowParcel(parcelId: string): Promise<void> {
  const baseUrl = getBoxNowApiUrl();
  const token = await getBoxNowAccessToken();
  const response = await fetch(`${baseUrl}/api/v1/parcels/${parcelId}:cancel`, {
    method: 'POST',
    headers: buildHeaders(token),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(mapBoxNowError(response.status, errorText));
  }
}

type CreateCustomerReturnInput = {
  orderNumber: string;
  sender: {
    contactPhoneNumber: string;
    contactEmail: string;
    contactName: string;
    locationId: string;
  };
  destination: {
    locationId: string;
  };
  items: Array<{
    id: string;
    name: string;
    value: string;
  }>;
};

export async function createBoxNowCustomerReturn(input: CreateCustomerReturnInput) {
  const baseUrl = getBoxNowApiUrl();
  const token = await getBoxNowAccessToken();
  const response = await fetch(`${baseUrl}/api/v1/delivery-requests:customerReturns`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      orderNumber: input.orderNumber,
      invoiceValue: '0.00',
      paymentMode: 'prepaid',
      amountToBeCollected: '0.00',
      allowReturn: true,
      sender: input.sender,
      destination: input.destination,
      items: input.items,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(mapBoxNowError(response.status, errorText));
  }
  return response.json();
}

export function verifyBoxNowSignature(rawBody: string, dataSignature: string): boolean {
  const secret = process.env.BOXNOW_WEBHOOK_SECRET;
  if (!secret) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(dataSignature));
}
