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
  orderBy,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

const COLLECTION_NAME = "categories";

export interface Category {
  id: string;
  name: string;
  status: "pending" | "approved";
  productViewType?: "image" | "text" | "mini";
  createdAt: string;
  updatedAt?: string;
}

export const categoryService = {
  /**
   * Gets all approved categories.
   */
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "approved"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData) as Category[];
      return results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  /**
   * Gets pending categories.
   */
  async getPendingCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "pending"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData) as Category[];
      return results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error getting pending categories:", error);
      return [];
    }
  },

  /**
   * Adds an approved category.
   */
  async addCategory(name: string, productViewType: "image" | "text" | "mini" = "image"): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name,
        status: "approved",
        productViewType,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, error };
    }
  },

  /**
   * Approves a pending category.
   */
  async approveCategory(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { 
        status: "approved",
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error approving category:", error);
      return { success: false, error };
    }
  },

  /**
   * Updates a category name and view type.
   */
  async updateCategory(id: string, name: string, productViewType: "image" | "text" | "mini" = "image"): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        name,
        productViewType,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, error };
    }
  },

  /**
   * Deletes a category.
   */
  async deleteCategory(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, error };
    }
  },

  /**
   * Gets all subcategories.
   */
  async getSubCategories(): Promise<any[]> {
    try {
      const q = query(collection(db, "subcategories"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(standardizeData);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  },

  /**
   * Adds a subcategory.
   */
  async addSubCategory(name: string, parentCategory: string): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const docRef = await addDoc(collection(db, "subcategories"), {
        name,
        parentCategory,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding subcategory:", error);
      return { success: false, error };
    }
  },

  /**
   * Updates a subcategory.
   */
  async updateSubCategory(id: string, name: string, parentCategory: string): Promise<{ success: boolean; error?: any }> {
    try {
      await updateDoc(doc(db, "subcategories", id), {
        name,
        parentCategory,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating subcategory:", error);
      return { success: false, error };
    }
  },

  /**
   * Deletes a subcategory.
   */
  async deleteSubCategory(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      await deleteDoc(doc(db, "subcategories", id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      return { success: false, error };
    }
  }
};

