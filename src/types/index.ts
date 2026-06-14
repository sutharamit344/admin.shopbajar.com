export interface RTDBBooking {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'seated' | 'cancelled' | 'no_show';
  createdAt: number;
  tableName?: string;
  tableId?: string;
  bookingPrice?: number;
  paymentStatus?: 'paid' | 'unpaid';
  paymentTxnId?: string;
  payoutStatus?: 'paid' | 'unpaid';
  payoutTxnId?: string;
  payoutSettledAt?: number;
  cancelledBy?: 'customer' | 'merchant';
  refundAmount?: number;
  cancellationCharges?: number;
  refundStatus?: 'none' | 'pending' | 'refunded';
  refundTxnId?: string;
  refundSettledAt?: number;
}

export interface FirestorePayment {
  id: string;
  bookingId: string;
  shopId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  tableName: string;
  bookingDate: string;
  bookingTime: string;
  amount: number;
  paymentTxnId: string;
  paymentOrderId: string;
  paymentStatus: string;
  payoutStatus: "unpaid" | "settled";
  payoutTxnId?: string;
  payoutSettledAt?: string;
  createdAt: string;
  // Cancellation/refund fields
  status?: string;
  cancelledBy?: 'customer' | 'merchant';
  refundAmount?: number;
  cancellationCharges?: number;
  refundStatus?: 'none' | 'pending' | 'refunded';
  refundTxnId?: string;
  refundSettledAt?: string;
}
