import {
  collection,
  addDoc,
  query,
  getDocs,
  limit,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

const COLLECTION_NAME = "activity_logs";

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  entityId: string;
  entityType: string;
  performedBy: string;
  timestamp: string;
}

export const logService = {
  /**
   * Logs an activity to Firestore.
   */
  async logActivity(
    action: string,
    details: string,
    entityId: string,
    entityType: string,
    userEmail: string = "Admin"
  ): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        action,
        details,
        entityId,
        entityType,
        performedBy: userEmail,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  },

  /**
   * Gets global activity logs.
   */
  async getGlobalLogs(limitCount: number = 50): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("timestamp", "desc"),
        limit(limitCount),
      );
      const snap = await getDocs(q);
      return snap.docs.map(standardizeData) as ActivityLog[];
    } catch (error) {
      console.error("Error fetching logs:", error);
      return [];
    }
  }
};
