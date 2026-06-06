import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

const COLLECTION_NAME = "clusters";

export interface Cluster {
  id: string;
  name: string;
  category: string;
  area?: string;
  city?: string;
  pincode?: string;
  status: "pending" | "approved";
  createdAt: string;
  updatedAt?: string;
}

export const clusterService = {
  /**
   * Gets all approved clusters.
   */
  async getClusters(): Promise<Cluster[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "approved"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData) as Cluster[];
      return results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
      console.error("Error getting clusters:", error);
      return [];
    }
  },

  /**
   * Gets pending clusters.
   */
  async getPendingClusters(): Promise<Cluster[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "pending"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData) as Cluster[];
      return results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error getting pending clusters:", error);
      return [];
    }
  },

  /**
   * Approves a cluster.
   */
  async approveCluster(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { 
        status: "approved",
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error approving cluster:", error);
      return { success: false, error };
    }
  },

  /**
   * Rejects/Deletes a cluster.
   */
  async rejectCluster(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("Error rejecting cluster:", error);
      return { success: false, error };
    }
  },

  /**
   * Adds an approved cluster.
   */
  async addCluster(clusterData: Partial<Cluster>): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...clusterData,
        status: "approved",
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding cluster:", error);
      return { success: false, error };
    }
  },

  /**
   * Updates an existing cluster.
   */
  async updateCluster(id: string, clusterData: Partial<Cluster>): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...clusterData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating cluster:", error);
      return { success: false, error };
    }
  }
};
