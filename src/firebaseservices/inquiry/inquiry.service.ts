import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  limit,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

const COLLECTION_NAME = "contact_messages";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read";
  createdAt: any;
}

export const inquiryService = {
  /**
   * Gets all inquiries.
   */
  async getInquiries(limitCount: number = 100): Promise<Inquiry[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map(standardizeData) as Inquiry[];
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      return [];
    }
  },

  /**
   * Updates inquiry status.
   */
  async updateStatus(id: string, status: "new" | "read"): Promise<{ success: boolean; error?: any }> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), { status });
      return { success: true };
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      return { success: false, error };
    }
  },

  /**
   * Deletes an inquiry.
   */
  async deleteInquiry(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      return { success: false, error };
    }
  }
};
