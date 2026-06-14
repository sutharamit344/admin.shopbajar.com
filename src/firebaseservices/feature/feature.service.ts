import {
  collection,
  addDoc,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

const COLLECTION_NAME = "features";

export interface Feature {
  id: string;
  featureKey: string;
  title: string;
  description: string;
  price: number;
  billingCycle: string;
  category: string;
  trialDays: number;
  icon: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
}

export const featureService = {
  /**
   * Gets all master features.
   */
  async getFeatures(): Promise<Feature[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(standardizeData) as Feature[];
    } catch (error) {
      console.error("Error getting features:", error);
      return [];
    }
  },

  /**
   * Adds a master feature.
   */
  async addFeature(featureData: Omit<Feature, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...featureData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding feature:", error);
      return { success: false, error };
    }
  },

  /**
   * Updates a master feature.
   */
  async updateFeature(id: string, featureData: Partial<Feature>): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...featureData,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating feature:", error);
      return { success: false, error };
    }
  },

  /**
   * Deletes a master feature.
   */
  async deleteFeature(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting feature:", error);
      return { success: false, error };
    }
  },

  async seedDefaultFeatures(): Promise<{ success: boolean; message: string; count?: number; error?: any }> {
    try {
      const existing = await this.getFeatures();
      for (const feat of existing) {
        await deleteDoc(doc(db, COLLECTION_NAME, feat.id));
      }

      const defaultFeatures = [
        {
          featureKey: "whatsapp_checkout",
          title: "Checkout with WhatsApp",
          description: "Enable customers to submit their cart inquiries directly via WhatsApp message.",
          icon: "Phone",
          price: 299,
          billingCycle: "monthly",
          category: "Inquiry",
          trialDays: 14,
          status: "active" as const
        },
        {
          featureKey: "dashboard_checkout",
          title: "Checkout with Dashboard",
          description: "Enable customers to submit inquiries directly to your Merchant Dashboard console.",
          icon: "LayoutDashboard",
          price: 499,
          billingCycle: "monthly",
          category: "Inquiry",
          trialDays: 14,
          status: "active" as const
        },
        {
          featureKey: "billing_system",
          title: "Billing & POS System",
          description: "All-in-one billing workspace. Generate professional tax invoices (A4 format) and print thermal POS receipts (80mm) with automated catalog stock deduction.",
          icon: "Calculator",
          price: 249,
          billingCycle: "monthly",
          category: "Billing",
          trialDays: 7,
          status: "active" as const
        },
        {
          featureKey: "qr_ordering",
          title: "QR Table Ordering",
          description: "Let customers scan a table QR code, browse your menu on their phone, and place orders directly — no waiter needed. Includes live kitchen dashboard, real-time order tracking, and browser popup notifications.",
          icon: "QrCode",
          price: 799,
          billingCycle: "monthly",
          category: "Ordering",
          trialDays: 14,
          status: "active" as const
        },
        {
          featureKey: "table_booking",
          title: "Table Reservations",
          description: "Allow customers to pre-book tables from your shop profile. Includes a multi-step booking wizard with date selection, time slot availability, party size, and contact details. Manage all reservations — confirm, seat, reject, or mark no-show — from the Bookings console.",
          icon: "CalendarDays",
          price: 399,
          billingCycle: "monthly",
          category: "Reservations",
          trialDays: 14,
          status: "active" as const
        }
      ];

      const promises = defaultFeatures.map(f => addDoc(collection(db, COLLECTION_NAME), {
        ...f,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));

      await Promise.all(promises);
      return { success: true, message: "Successfully seeded default features", count: defaultFeatures.length };
    } catch (error) {
      console.error("Error seeding default features:", error);
      return { success: false, message: "Failed to seed features", error };
    }
  }
};
