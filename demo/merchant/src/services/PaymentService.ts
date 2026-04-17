/**
 * Payment Service - Calls PSP to process payments
 */
export interface ChargeRequest {
  source: string;
  settle: boolean;
  handle: string;
  amount?: number;
  currency: string;
  customer_handle?: string;
  customer?: Customer;
  order_lines?: OrderLine[];
}

export interface OrderLine {
  ordertext: string;
  amount: number;
  vat?: number;
  quantity?: number;
  amount_incl_vat?: boolean;
}

export interface Customer {
  first_name?: string;
  last_name?: string;
  email?: string;
  /** First line of address */
  address?: string;
  /** Optional second line of address */
  address2?: string;
  /** Address city/district/suburb/town/village */
  city?: string;
  /** Address state/county/province/region */
  state?: string;
  /** Address country */
  country?: string;
  /** Address postal code or zip code */
  postal_code?: string;
  generate_handle?: boolean;
}

export interface ChargeResponse {
  id: string;
  state: "created" | "authorized" | "settled" | "failed" | "cancelled" | "pending";
  amount: number;
  currency: string;
}

export class PaymentService {
  private pspUrl: string;
  private pspPaymentApi: string;
  private merchantSecretKey: string;

  constructor() {
    this.pspUrl = process.env.PSP_URL || 'http://localhost:4000';
    this.pspPaymentApi = process.env.PSP_PAYMENT_URL || `${this.pspUrl}/agentic_commerce/create_and_process_payment_intent`
    this.merchantSecretKey = process.env.PSP_MERCHANT_API_KEY || 'merchant_secret_key_123';
  }

  /**
   * Process payment via PSP using create_and_process_payment_intent endpoint
   */
  async processPayment(request: ChargeRequest): Promise<ChargeResponse> {
    try {
      const response = await fetch(this.pspPaymentApi, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.merchantSecretKey).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          body: errorData,
        };
      }

      const paymentIntent = await response.json() as ChargeResponse;
      return paymentIntent;
    } catch (error: any) {
      console.error('Error processing payment via PSP:', error);
      throw error;
    }
  }

}