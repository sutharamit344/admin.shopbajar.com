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
  limit,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";
import { slugify } from "../../utils/slugify";

const COLLECTION_NAME = "blogs";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  coverImage?: string;
  category?: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt?: string;
}

export const blogService = {
  /**
   * Gets all blogs.
   */
  async getBlogs(limitCount: number = 50): Promise<Blog[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map(standardizeData) as Blog[];
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return [];
    }
  },

  /**
   * Gets a blog by slug.
   */
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return standardizeData<Blog>(snap.docs[0]);
    } catch (error) {
      console.error("Error fetching blog by slug:", error);
      return null;
    }
  },

  /**
   * Adds a blog.
   */
  async addBlog(blogData: Partial<Blog>): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const title = blogData.title || "Untitled";
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...blogData,
        slug: slugify(title),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding blog:", error);
      return { success: false, error };
    }
  },

  /**
   * Updates a blog.
   */
  async updateBlog(id: string, blogData: Partial<Blog>): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = {
        ...blogData,
        updatedAt: serverTimestamp(),
      };
      if (blogData.title) {
        updateData.slug = slugify(blogData.title);
      }
      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error) {
      console.error("Error updating blog:", error);
      return { success: false, error };
    }
  },

  /**
   * Deletes a blog.
   */
  async deleteBlog(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting blog:", error);
      return { success: false, error };
    }
  }
};
