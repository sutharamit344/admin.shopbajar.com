import React, { useEffect, useState } from "react";
import { rtdb, db } from "../../app/config/firebase";
import { ref, onValue, update } from "firebase/database";
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import type { RTDBBooking, FirestorePayment } from "../../types";

export const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"reservations" | "payments">("reservations");
  const [searchQuery, setSearchQuery] = useState("");
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [processingRefundId, setProcessingRefundId] = useState<string | null>(null);
  const [isSettlingAll, setIsSettlingAll] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<RTDBBooking[]>([]);
  const [payments, setPayments] = useState<FirestorePayment[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Fetch all bookings from Realtime Database
  useEffect(() => {
    const bookingsRef = ref(rtdb, "qr_bookings");
    setLoadingBookings(true);
    
    const unsub = onValue(
      bookingsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setBookings([]);
          setLoadingBookings(false);
          return;
        }
        
        const allBookings: RTDBBooking[] = [];
        const data = snapshot.val();
        
        // Loop through shops
        Object.entries(data).forEach(([shopId, shopBookings]: [string, any]) => {
          if (shopBookings && typeof shopBookings === "object") {
            Object.entries(shopBookings).forEach(([bookingId, bookingData]: [string, any]) => {
              allBookings.push({
                id: bookingId,
                shopId,
                ...bookingData
              });
            });
          }
        });
        
        // Sort bookings by date and time desc
        allBookings.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.time.localeCompare(a.time);
        });
        
        setBookings(allBookings);
        setLoadingBookings(false);
      },
      (error) => {
        console.error("Error loading bookings from RTDB:", error);
        setLoadingBookings(false);
      }
    );

    return () => unsub();
  }, []);

  // Fetch booking payments from Firestore
  useEffect(() => {
    setLoadingPayments(true);
    const q = query(collection(db, "booking_payments"));
    
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: FirestorePayment[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as FirestorePayment);
        });
        
        // Sort payments by createdAt desc
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setPayments(list);
        setLoadingPayments(false);
      },
      (error) => {
        console.error("Error loading payments from Firestore:", error);
        setLoadingPayments(false);
      }
    );

    return () => unsub();
  }, []);

  // Settle booking payout
  const handleSettlePayout = async (payment: FirestorePayment) => {
    if (!payment.bookingId || !payment.shopId) return;
    
    const isCancelled = payment.status === "cancelled";
    const settleAmount = isCancelled ? (payment.cancellationCharges || 0) : payment.amount;
    
    const confirmSettle = window.confirm(
      `Confirm table reservation settlement of ₹${settleAmount} ${isCancelled ? "(Cancellation Charge)" : ""} for "${payment.shopName}"?\n\nCustomer: ${payment.customerName}\nBooking Ref: ${payment.bookingId.slice(-6).toUpperCase()}`
    );
    
    if (!confirmSettle) return;
    
    setSettlingId(payment.id);
    const payoutTxnId = `pout_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    try {
      // 1. Update RTDB Booking
      const bookingPath = `qr_bookings/${payment.shopId}/${payment.bookingId}`;
      await update(ref(rtdb, bookingPath), {
        payoutStatus: "paid",
        payoutTxnId: payoutTxnId,
        payoutSettledAt: Date.now()
      });

      // 2. Update Firestore Payment Document
      const q = query(
        collection(db, "booking_payments"),
        where("bookingId", "==", payment.bookingId)
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const docRef = doc(db, "booking_payments", snap.docs[0].id);
        await updateDoc(docRef, {
          payoutStatus: "settled",
          payoutTxnId: payoutTxnId,
          payoutSettledAt: new Date().toISOString()
        });
      }
      
      toast.success("Payout settled successfully!");
    } catch (error: any) {
      console.error("Settlement failure:", error);
      toast.error("Failed to settle payout: " + (error.message || error));
    } finally {
      setSettlingId(null);
    }
  };

  // Bulk settle all pending payouts at once
  const handleSettleAllPayouts = async () => {
    const pending = payments.filter(
      (p) =>
        p.payoutStatus !== "settled" &&
        (p.status !== "cancelled" || (p.status === "cancelled" && (p.cancellationCharges ?? 0) > 0))
    );

    if (pending.length === 0) {
      toast.error("No pending payouts to settle.");
      return;
    }

    const confirmMsg = `Are you sure you want to bulk-settle all ${pending.length} pending payouts totaling ₹${totalAmountPending}?\n\nThis will generate automated transaction records and update all shop balances.`;
    if (!window.confirm(confirmMsg)) return;

    setIsSettlingAll(true);
    let successCount = 0;

    try {
      await Promise.all(
        pending.map(async (payment) => {
          const payoutTxnId = `pout_bulk_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          try {
            // A. Update RTDB
            const bookingPath = `qr_bookings/${payment.shopId}/${payment.bookingId}`;
            await update(ref(rtdb, bookingPath), {
              payoutStatus: "paid",
              payoutTxnId: payoutTxnId,
              payoutSettledAt: Date.now(),
            });

            // B. Update Firestore
            const q = query(
              collection(db, "booking_payments"),
              where("bookingId", "==", payment.bookingId)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
              const docRef = doc(db, "booking_payments", snap.docs[0].id);
              await updateDoc(docRef, {
                payoutStatus: "settled",
                payoutTxnId: payoutTxnId,
                payoutSettledAt: new Date().toISOString(),
              });
            }
            successCount++;
          } catch (itemErr) {
            console.error(`Failed to settle payment ${payment.id}:`, itemErr);
          }
        })
      );

      toast.success(`Successfully settled ${successCount} payouts!`);
    } catch (err: any) {
      console.error("Bulk settlement failed:", err);
      toast.error("Bulk settlement failed: " + (err.message || err));
    } finally {
      setIsSettlingAll(false);
    }
  };

  // Process customer refund
  const handleProcessRefund = async (payment: FirestorePayment) => {
    if (!payment.bookingId || !payment.shopId) return;

    let refundTxnId = "";
    let isMock = false;

    if (payment.paymentTxnId) {
      const confirmMsg = `Initiate automated refund for ${payment.customerName}?\n\nRefund Amount: ₹${payment.refundAmount || 0}\nOriginal Payment ID: ${payment.paymentTxnId}\n\nThis will trigger the Razorpay Refund API automatically.`;
      if (!window.confirm(confirmMsg)) return;

      setProcessingRefundId(payment.id);
      try {
        const res = await fetch("http://localhost:3000/api/refund", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentTxnId: payment.paymentTxnId,
            refundAmount: payment.refundAmount || 0,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to trigger refund API");
        }

        refundTxnId = data.refundId;
        isMock = !!data.isMock;
      } catch (apiErr: any) {
        console.error("Automated refund failed, falling back to manual entry:", apiErr);
        const manualPrompt = window.prompt(
          `Automated refund failed: ${apiErr.message || apiErr}\n\nPlease enter the Refund Transaction ID manually:`
        );
        if (!manualPrompt || !manualPrompt.trim()) {
          setProcessingRefundId(null);
          return;
        }
        refundTxnId = manualPrompt.trim();
      }
    } else {
      // Fallback if transaction ID is missing from the record
      const manualPrompt = window.prompt(
        `No payment transaction ID found in record.\n\nPlease enter the Razorpay Refund Transaction ID manually:`
      );
      if (!manualPrompt || !manualPrompt.trim()) return;
      refundTxnId = manualPrompt.trim();
    }

    if (!refundTxnId) {
      setProcessingRefundId(null);
      return;
    }

    setProcessingRefundId(payment.id);
    const settledAt = new Date().toISOString();

    try {
      // 1. Update RTDB Booking refund fields
      const bookingPath = `qr_bookings/${payment.shopId}/${payment.bookingId}`;
      await update(ref(rtdb, bookingPath), {
        refundStatus: "refunded",
        refundTxnId: refundTxnId,
        refundSettledAt: Date.now(),
      });

      // 2. Update Firestore payment document
      const docRef = doc(db, "booking_payments", payment.id);
      await updateDoc(docRef, {
        refundStatus: "refunded",
        refundTxnId: refundTxnId,
        refundSettledAt: settledAt,
      });

      const mockSuffix = isMock ? " (Simulated)" : "";
      toast.success(`Refund of ₹${payment.refundAmount || 0} processed successfully${mockSuffix}! ID: ${refundTxnId}`);
    } catch (error: any) {
      console.error("Refund processing failure:", error);
      toast.error("Failed to process refund: " + (error.message || error));
    } finally {
      setProcessingRefundId(null);
    }
  };

  // Helper date/time formatters
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const suffix = h < 12 ? "AM" : "PM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  // Filter lists based on search
  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.customerName?.toLowerCase().includes(q) ||
      b.customerPhone?.includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.shopId.toLowerCase().includes(q)
    );
  });

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.customerName?.toLowerCase().includes(q) ||
      p.customerPhone?.includes(q) ||
      p.shopName?.toLowerCase().includes(q) ||
      p.paymentTxnId?.toLowerCase().includes(q) ||
      p.bookingId?.toLowerCase().includes(q)
    );
  });

  // Calculate statistics
  const totalAmountCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalAmountSettled = payments
    .filter((p) => p.payoutStatus === "settled")
    .reduce((acc, p) => {
      const isCancelled = p.status === "cancelled";
      const amt = isCancelled ? (p.cancellationCharges || 0) : (p.amount || 0);
      return acc + amt;
    }, 0);
  const totalAmountPending = payments
    .filter((p) => p.payoutStatus !== "settled")
    .reduce((acc, p) => {
      const isCancelled = p.status === "cancelled";
      const amt = isCancelled ? (p.cancellationCharges || 0) : (p.amount || 0);
      return acc + amt;
    }, 0);
  const pendingRefunds = payments.filter((p) => p.refundStatus === "pending");
  const totalRefundPending = pendingRefunds.reduce((acc, p) => acc + (p.refundAmount || 0), 0);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Table Bookings & Settlements</h1>
          <p className="text-sm text-gray-500">Manage customer reservations, track transaction fees, and settle merchant payouts.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Reservations</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{bookings.length}</span>
            <span className="text-xs text-gray-500">bookings total</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Fees Collected</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₹{totalAmountCollected.toLocaleString("en-IN")}</span>
            <span className="text-xs text-gray-500">from paid slots</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Settled to Merchants</div>
          <div className="mt-2 flex items-baseline gap-2 text-emerald-600">
            <span className="text-2xl font-black text-emerald-700">₹{totalAmountSettled.toLocaleString("en-IN")}</span>
            <span className="text-xs text-emerald-600/70 font-semibold">disbursed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Settlements</div>
          <div className="mt-2 flex items-baseline gap-2 text-amber-600">
            <span className="text-2xl font-black text-amber-700">₹{totalAmountPending.toLocaleString("en-IN")}</span>
            <span className="text-xs text-amber-650 font-semibold animate-pulse">awaiting payout</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">Refunds Pending</div>
          <div className="mt-2 flex items-baseline gap-2 text-red-600">
            <span className="text-2xl font-black text-red-600">₹{totalRefundPending.toLocaleString("en-IN")}</span>
            <span className="text-xs text-red-500/70 font-semibold">{pendingRefunds.length} refund{pendingRefunds.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3">
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "reservations"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Reservations Log
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "payments"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <CreditCardIcon className="w-3.5 h-3.5" />
            Payments & Payouts
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {activeTab === "payments" && totalAmountPending > 0 && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isSettlingAll}
              onClick={handleSettleAllPayouts}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-[11px] shadow-xs inline-flex items-center gap-1.5 px-3 rounded-lg shrink-0"
            >
              <BanknotesIcon className="w-4 h-4" />
              Settle All (₹{totalAmountPending})
            </Button>
          )}

          <div className="relative w-full sm:w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === "reservations"
                  ? "Search guest name, phone..."
                  : "Search shop name, customer, txn ID..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tables Content */}
      {activeTab === "reservations" ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loadingBookings ? (
            <div className="py-20 text-center">
              <ArrowPathIcon className="animate-spin w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-medium">Loading reservations from Realtime Database...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center">
              <CalendarDaysIcon className="w-12 h-12 text-gray-250 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-650 mb-1">No reservations found</p>
              <p className="text-xs text-gray-400 font-medium">Any customer bookings placed via storefront will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Guest Info</th>
                    <th className="py-3 px-4">Visit Date & Time</th>
                    <th className="py-3 px-4">Table</th>
                    <th className="py-3 px-4">Booking Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-xs text-gray-700 font-medium">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                        #{b.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{b.customerName}</div>
                        <div className="text-[10px] text-gray-400">{b.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(b.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                          <ClockIcon className="w-3.5 h-3.5 text-gray-300" />
                          <span>{formatTime(b.time)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {b.tableName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-700">
                            {b.tableName}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <UsersIcon className="w-3 h-3 text-gray-350" />
                          <span>{b.partySize} seats</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            b.status === "seated"
                              ? "success"
                              : b.status === "confirmed"
                                ? "info"
                                : b.status === "pending"
                                  ? "warning"
                                  : "danger"
                          }
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {b.bookingPrice && b.bookingPrice > 0 ? (
                          <div className="space-y-0.5">
                            {b.paymentStatus === "paid" ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">
                                ₹{b.bookingPrice} Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-[10px] font-bold text-red-650">
                                ₹{b.bookingPrice} Unpaid
                              </span>
                            )}
                            {b.paymentTxnId && (
                              <div className="text-[9px] text-gray-400 font-mono">
                                ID: {b.paymentTxnId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Free Reservation</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {b.paymentStatus === "paid" ? (
                          b.payoutStatus === "paid" ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-650">
                                Settled
                              </span>
                              {b.payoutTxnId && (
                                <div className="text-[9px] text-gray-400 font-mono">
                                  Txn: {b.payoutTxnId.slice(0, 16)}...
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-600">
                              Awaiting Payout
                            </span>
                          )
                        ) : (
                          <span className="text-gray-450">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loadingPayments ? (
            <div className="py-20 text-center">
              <ArrowPathIcon className="animate-spin w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-medium">Loading transaction payments from Firestore...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-20 text-center">
              <CreditCardIcon className="w-12 h-12 text-gray-250 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-650 mb-1">No payment transactions found</p>
              <p className="text-xs text-gray-400 font-medium">Once payments are completed, they will appear here for payout management.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Merchant Shop</th>
                    <th className="py-3 px-4">Guest Customer</th>
                    <th className="py-3 px-4 text-right">Fee Amount</th>
                    <th className="py-3 px-4">Razorpay Payment ID</th>
                    <th className="py-3 px-4">Payout Status</th>
                    <th className="py-3 px-4">Refund Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-xs text-gray-700 font-medium">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{p.shopName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {p.shopId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">{p.customerName}</div>
                        <div className="text-[10px] text-gray-400">{p.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-gray-900 whitespace-nowrap">
                        ₹{p.amount}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-gray-400">
                        {p.paymentTxnId}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.status === "cancelled" && (p.cancellationCharges ?? 0) === 0 ? (
                          <span className="text-[10px] text-gray-400">No Payout (100% Refunded)</span>
                        ) : p.payoutStatus === "settled" ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">
                              <CheckCircleIcon className="w-3 h-3" />
                              Settled {p.status === "cancelled" ? `(₹${p.cancellationCharges})` : ""}
                            </span>
                            {p.payoutTxnId && (
                              <div className="text-[9px] text-gray-450 font-mono">
                                Txn: {p.payoutTxnId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Awaiting Disbursal {p.status === "cancelled" ? `(₹${p.cancellationCharges})` : ""}
                          </span>
                        )}
                      </td>

                      {/* Refund Status column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.status === "cancelled" ? (
                          p.refundStatus === "refunded" ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">
                                <CheckCircleIcon className="w-3 h-3" />
                                Refunded · ₹{p.refundAmount || 0}
                              </span>
                              {p.refundTxnId && (
                                <div className="text-[9px] text-gray-450 font-mono">
                                  Txn: {p.refundTxnId}
                                </div>
                              )}
                            </div>
                          ) : p.refundStatus === "pending" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-[10px] font-bold text-red-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Refund Due · ₹{p.refundAmount || 0}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">No Refund</span>
                          )
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-end">
                          {p.payoutStatus !== "settled" && 
                           (p.status !== "cancelled" || (p.status === "cancelled" && (p.cancellationCharges ?? 0) > 0)) ? (
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={settlingId === p.id}
                              onClick={() => handleSettlePayout(p)}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-[10px] shadow-xs inline-flex items-center gap-1 px-2.5 rounded-md"
                            >
                              <BanknotesIcon className="w-3.5 h-3.5" />
                              Settle Payout
                            </Button>
                          ) : p.payoutStatus === "settled" && 
                            (p.status !== "cancelled" || (p.status === "cancelled" && (p.cancellationCharges ?? 0) > 0)) ? (
                            <span className="text-[10px] font-semibold text-gray-400 select-none">
                              Payout Settled {p.payoutSettledAt ? new Date(p.payoutSettledAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                              }) : ""}
                            </span>
                          ) : null}

                          {p.status === "cancelled" && p.refundStatus === "pending" && (
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={processingRefundId === p.id}
                              onClick={() => handleProcessRefund(p)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold h-7 text-[10px] shadow-xs inline-flex items-center gap-1 px-2.5 rounded-md"
                            >
                              <ArrowPathIcon className="w-3.5 h-3.5" />
                              Process Refund
                            </Button>
                          )}
                          {p.status === "cancelled" && p.refundStatus === "refunded" && (
                            <span className="text-[10px] font-semibold text-emerald-600 select-none">
                              Refunded {p.refundSettledAt ? new Date(p.refundSettledAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                              }) : ""}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
