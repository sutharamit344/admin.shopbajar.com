import {
  collection,
  addDoc,
  query,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { standardizeData } from "../common/standardize";

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface State {
  id: string;
  name: string;
  countryId: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
}

export interface Area {
  id: string;
  name: string;
  cityId: string;
  lat: string;
  lng: string;
  pincode: string;
}

export const locationService = {
  // Countries
  async getCountries(): Promise<Country[]> {
    const q = query(collection(db, "countries"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(standardizeData) as Country[];
  },
  async addCountry(name: string, code: string) {
    return await addDoc(collection(db, "countries"), { name, code, createdAt: serverTimestamp() });
  },
  async updateCountry(id: string, name: string, code: string) {
    const docRef = doc(db, "countries", id);
    await updateDoc(docRef, { name, code, updatedAt: serverTimestamp() });
  },
  async deleteCountry(id: string) {
    await deleteDoc(doc(db, "countries", id));
  },

  // States
  async getStates(): Promise<State[]> {
    const q = query(collection(db, "states"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(standardizeData) as State[];
  },
  async addState(name: string, countryId: string) {
    return await addDoc(collection(db, "states"), { name, countryId, createdAt: serverTimestamp() });
  },
  async updateState(id: string, name: string, countryId: string) {
    const docRef = doc(db, "states", id);
    await updateDoc(docRef, { name, countryId, updatedAt: serverTimestamp() });
  },
  async deleteState(id: string) {
    await deleteDoc(doc(db, "states", id));
  },

  // Cities
  async getCities(): Promise<City[]> {
    const q = query(collection(db, "cities"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(standardizeData) as City[];
  },
  async addCity(name: string, stateId: string) {
    return await addDoc(collection(db, "cities"), { name, stateId, createdAt: serverTimestamp() });
  },
  async updateCity(id: string, name: string, stateId: string) {
    const docRef = doc(db, "cities", id);
    await updateDoc(docRef, { name, stateId, updatedAt: serverTimestamp() });
  },
  async deleteCity(id: string) {
    await deleteDoc(doc(db, "cities", id));
  },

  // Areas
  async getAreas(): Promise<Area[]> {
    const q = query(collection(db, "areas"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(standardizeData) as Area[];
  },
  async addArea(data: Omit<Area, "id">) {
    return await addDoc(collection(db, "areas"), { ...data, createdAt: serverTimestamp() });
  },
  async updateArea(id: string, data: Partial<Omit<Area, "id">>) {
    const docRef = doc(db, "areas", id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },
  async deleteArea(id: string) {
    await deleteDoc(doc(db, "areas", id));
  },
};
