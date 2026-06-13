import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

const COLLECTION_NAME = "shops";

export interface Shop {
  id: string;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  ownerId?: string;
  ownerEmail?: string;
  city?: string;
  area?: string;
  category?: string;
  needsVerification?: boolean;
  [key: string]: any;
}

export const shopService = {
  /**
   * Gets all pending or rejected shops for admin review.
   */
  async getPendingShops(): Promise<Shop[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "in", ["pending", "rejected"]),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData) as Shop[];
      return results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error getting pending shops:", error);
      return [];
    }
  },

  /**
   * Gets all approved shops.
   */
  async getApprovedShops(): Promise<Shop[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "approved"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData) as Shop[];
      return results.sort(
        (a, b) =>
          new Date(b.approvedAt || b.updatedAt || b.createdAt).getTime() -
          new Date(a.approvedAt || a.updatedAt || a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error getting approved shops:", error);
      return [];
    }
  },

  /**
   * Approves a shop.
   */
  async approveShop(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
        adminComment: "",
      });
      return { success: true };
    } catch (error) {
      console.error("Error approving shop:", error);
      return { success: false, error };
    }
  },

  /**
   * Rejects a shop with a reason.
   */
  async rejectShop(id: string, reason: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: "rejected",
        adminComment: reason,
        rejectedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error rejecting shop:", error);
      return { success: false, error };
    }
  },

  /**
   * Deletes a shop.
   */
  async deleteShop(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting shop:", error);
      return { success: false, error };
    }
  },

  /**
   * Gets a shop by ID.
   */
  async getShopById(id: string): Promise<Shop | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      return standardizeData<Shop>(docSnap);
    } catch (error) {
      console.error("Error getting shop by ID:", error);
      return null;
    }
  },

  /**
   * Updates an existing shop.
   */
  async updateShop(id: string, data: Partial<Shop>): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const safeData = { ...data };
      delete safeData.id;
      await updateDoc(docRef, {
        ...safeData,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating shop:", error);
      return { success: false, error };
    }
  },

  /**
   * Creates a new shop.
   */
  async createShop(data: Omit<Shop, "id">): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const { addDoc } = await import("firebase/firestore");
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creating shop:", error);
      return { success: false, error };
    }
  },

  /**
   * Bulk approves multiple shops.
   */
  async bulkApproveShops(ids: string[]): Promise<{ success: boolean; error?: any }> {
    try {
      const { writeBatch } = await import("firebase/firestore");
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        batch.update(docRef, {
          status: "approved",
          approvedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error("Error bulk approving shops:", error);
      return { success: false, error };
    }
  },

  /**
   * Gets approved shops incrementally (cursor-based pagination).
   */
  async getApprovedShopsIncremental(
    pageSize: number,
    lastVisibleDocId?: string | null
  ): Promise<{ shops: Shop[]; lastVisibleDoc: string | null; hasMore: boolean; totalCount: number }> {
    try {
      const { limit, startAfter, orderBy, getCountFromServer } = await import("firebase/firestore");
      const collRef = collection(db, COLLECTION_NAME);

      // Get total count of approved shops
      const countQuery = query(collRef, where("status", "==", "approved"));
      const countSnapshot = await getCountFromServer(countQuery);
      const totalCount = countSnapshot.data().count;

      // Build paginated query
      let q = query(
        collRef,
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      if (lastVisibleDocId) {
        const cursorSnap = await getDoc(doc(db, COLLECTION_NAME, lastVisibleDocId));
        if (cursorSnap.exists()) {
          q = query(
            collRef,
            where("status", "==", "approved"),
            orderBy("createdAt", "desc"),
            startAfter(cursorSnap),
            limit(pageSize)
          );
        }
      }

      const querySnapshot = await getDocs(q);
      const shops = querySnapshot.docs.map(standardizeData) as Shop[];
      const newLastVisibleDocId = shops[shops.length - 1]?.id || null;
      const hasMore = shops.length === pageSize;

      return { shops, lastVisibleDoc: newLastVisibleDocId, hasMore, totalCount };
    } catch (error) {
      console.error("Error getting approved shops incrementally:", error);
      return { shops: [], lastVisibleDoc: null, hasMore: false, totalCount: 0 };
    }
  },

  /**
   * Checks if a shop slug is available. Excludes the current shop ID when editing.
   */
  async isSlugAvailable(slug: string, currentShopId?: string | null): Promise<boolean> {
    if (!slug || slug.trim() === "") return false;
    try {
      const cleanSlug = slug.trim().toLowerCase();
      const q = query(
        collection(db, COLLECTION_NAME),
        where("slug", "==", cleanSlug)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return true;
      if (currentShopId) {
        const otherMatches = querySnapshot.docs.filter((doc) => doc.id !== currentShopId);
        return otherMatches.length === 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking slug availability:", error);
      return false;
    }
  }
};

