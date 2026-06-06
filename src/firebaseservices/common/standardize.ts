import { DocumentSnapshot, Timestamp } from "firebase/firestore";

/**
 * Recursively converts Firestore Timestamps to ISO strings.
 */
export function serializeTimestamps(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeTimestamps(item));
  }

  // Check if it's a Firestore Timestamp
  if (obj instanceof Timestamp || (obj && typeof obj.toDate === "function")) {
    return obj.toDate().toISOString();
  }

  const serialized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    serialized[key] = serializeTimestamps(value);
  }
  return serialized;
}

/**
 * Standardizes document data with ID and serialized timestamps.
 */
export function standardizeData<T = any>(docSnap: DocumentSnapshot): T | null {
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...serializeTimestamps(docSnap.data()),
  } as T;
}
