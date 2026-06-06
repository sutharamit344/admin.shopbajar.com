import React from "react";
import {
  collection,
  addDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  getCountFromServer,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../app/config/firebase";
import { slugify } from "../../utils/slugify";
import { Button } from "../../components/common/Button";
import {
  CircleStackIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export const DatabasePage: React.FC = () => {
  const [stats, setStats] = useState({
    shops: 0,
    categories: 0,
    clusters: 0,
    countries: 0,
    states: 0,
    cities: 0,
    areas: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const getCount = async (col: string) => {
        const snap = await getCountFromServer(collection(db, col));
        return snap.data().count;
      };

      const [s, c, cl, co, st, ci, ar] = await Promise.all([
        getCount("shops"),
        getCount("categories"),
        getCount("clusters"),
        getCount("countries"),
        getCount("states"),
        getCount("cities"),
        getCount("areas"),
      ]);

      setStats({
        shops: s,
        categories: c,
        clusters: cl,
        countries: co,
        states: st,
        cities: ci,
        areas: ar
      });
    } catch (error) {
      console.error("Stats fetch failed", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const clearCollection = async (name: string) => {
    if (!confirm(`Wipe all data from ${name}?`)) return;
    setIsProcessing(true);
    try {
      const snap = await getDocs(collection(db, name));
      if (snap.empty) {
        toast.success(`${name} is already empty`);
        setIsProcessing(false);
        return;
      }

      const batchSize = 500;
      const docs = snap.docs;

      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + batchSize);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }

      toast.success(`${name} cleared (${docs.length} records)`);
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Wipe failed");
    }
    setIsProcessing(false);
  };

  const seedMasterData = async () => {
    setIsProcessing(true);
    try {
      const getOrCreate = async (colName: string, name: string, extraData: any = {}) => {
        const q = query(collection(db, colName), where("name", "==", name));
        const snap = await getDocs(q);
        if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

        const docRef = await addDoc(collection(db, colName), {
          name,
          status: "approved",
          createdAt: serverTimestamp(),
          ...extraData
        });
        return { id: docRef.id, name };
      };

      // 1. Seed Country
      const country: any = await getOrCreate("countries", "India");

      // 2. Seed States
      const states = ["Gujarat", "Maharashtra", "Rajasthan"];
      const stateIds: Record<string, string> = {};
      for (const s of states) {
        const doc: any = await getOrCreate("states", s, { countryId: country.id });
        stateIds[s] = doc.id;
      }

      // 3. Seed Cities (Gujarat)
      const gujCities = ["Ahmedabad", "Surat", "Rajkot"];
      const cityIds: Record<string, string> = {};
      for (const c of gujCities) {
        const doc: any = await getOrCreate("cities", c, {
          stateId: stateIds["Gujarat"],
          countryId: country.id
        });
        cityIds[c] = doc.id;
      }

      // 4. Seed Areas (Ahmedabad)
      const amdAreas = [
        { name: "Gota", lat: 23.1058, lng: 72.5413, pincode: "382481" },
        { name: "Sola", lat: 23.0754, lng: 72.5254, pincode: "380060" },
        { name: "Thaltej", lat: 23.05, lng: 72.51, pincode: "380059" },
        { name: "Science City", lat: 23.0751, lng: 72.5075, pincode: "380060" },
      ];
      for (const a of amdAreas) {
        await getOrCreate("areas", a.name, {
          ...a,
          cityId: cityIds["Ahmedabad"],
          stateId: stateIds["Gujarat"],
          countryId: country.id,
        });
      }

      // 5. Seed Categories
      const categories = [
        { name: "Grocery Store", img: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80" },
        { name: "Electronics", img: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80" },
        { name: "Fashion", img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=800&q=80" },
        { name: "Restaurants", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" },
      ];
      for (const cat of categories) {
        await getOrCreate("categories", cat.name, {
          ...cat,
          slug: slugify(cat.name),
        });
      }

      // 6. Seed Clusters (Market Hubs)
      const clusterData = [
        { name: "Gota Shopping Hub", lat: 23.105, lng: 72.541, area: "Gota", pincode: "382481" },
        { name: "Sola Road Market", lat: 23.075, lng: 72.525, area: "Sola", pincode: "380061" },
        { name: "Science City Commercial", lat: 23.075, lng: 72.507, area: "Sola", pincode: "380060" },
        { name: "Thaltej Cross Roads", lat: 23.05, lng: 72.51, area: "Thaltej", pincode: "380059" }
      ];

      for (const cl of clusterData) {
        // Distribute clusters across seeded categories for better visibility
        const hubCategories = ["Electronics", "Fashion", "Grocery Store"];
        const hubCategory = hubCategories[clusterData.indexOf(cl) % hubCategories.length];

        await getOrCreate("clusters", cl.name, {
          ...cl,
          city: "Ahmedabad",
          state: "Gujarat",
          country: "India",
          category: hubCategory,
          status: "approved", // Ensure explicitly approved
        });
      }

      toast.success("Master Data Seeded (Duplicates Prevented)!");
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Master Seeding Failed");
    }
    setIsProcessing(false);
  };

  const seedShops = async (amount: number) => {
    setIsProcessing(true);
    try {
      // Fetch latest master data first
      const [areasSnap, catsSnap, clustersSnap] = await Promise.all([
        getDocs(collection(db, "areas")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "clusters"))
      ]);

      if (areasSnap.empty || catsSnap.empty) {
        toast.error("Seed Master Data first!");
        setIsProcessing(false);
        return;
      }

      const availableAreas = areasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const availableCats = catsSnap.docs.map(d => d.data().name);
      const availableClusters = clustersSnap.docs.map(d => d.data().name);
      const catImages: Record<string, string> = {};
      catsSnap.docs.forEach(d => { catImages[d.data().name] = d.data().img; });

      const buildings = ["Sigma Icon", "Dev Aurum", "The First", "Privilon", "Ganesh Glory", "Iskcon Emporio"];
      const landmarks = ["Opp. Reliance Fresh", "Near Subway", "Behind Shell Petrol Pump", "Beside ICICI Bank", "Next to Garden"];

      for (let i = 0; i < amount; i++) {
        const area: any = availableAreas[Math.floor(Math.random() * availableAreas.length)];

        // Group by 3 to ensure minimum 3 shops per cluster
        const groupIndex = Math.floor(i / 3);
        const catName = availableCats[groupIndex % availableCats.length];

        // Find clusters that match this category
        const matchingClusters = clustersSnap.docs
          .filter(d => d.data().category === catName)
          .map(d => d.data().name);

        const clusterName = matchingClusters.length > 0
          ? matchingClusters[groupIndex % matchingClusters.length]
          : (availableClusters.length > 0 ? availableClusters[groupIndex % availableClusters.length] : "");


        const shopId = Math.floor(Math.random() * 100000);
        const name = `ShopBajar Merchant ${shopId}`;

        await addDoc(collection(db, "shops"), {
          name,
          slug: slugify(name),
          category: catName,
          clusterType: clusterName,
          country: "India",
          state: "Gujarat",
          city: "Ahmedabad",
          area: area.name,
          pincode: area.pincode,
          shopNo: `${100 + i}`,
          building: buildings[Math.floor(Math.random() * buildings.length)],
          zone: landmarks[Math.floor(Math.random() * landmarks.length)],
          village: area.name === "Gota" ? "Chenpur" : "Village " + area.name,
          status: "approved",
          createdAt: serverTimestamp(),
          approvedAt: serverTimestamp(),
          lat: area.lat + (Math.random() - 0.5) * 0.005,
          lng: area.lng + (Math.random() - 0.5) * 0.005,
          coverImage: catImages[catName],
          logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
          phone: `${9000000000 + shopId}`,
          whatsapp: `${9000000000 + shopId}`,
          ownerEmail: `owner_${shopId}@shopbajar.com`,
          ownerId: "pro_seeder",
          description: `Experience professional ${catName.toLowerCase()} services in the heart of ${area.name}. We pride ourselves on quality and customer satisfaction. Welcome to your one-stop solution for all ${catName} needs.`,
          businessType: i % 3 === 0 ? "product" : i % 3 === 1 ? "service" : "mixed",
          rating: (4 + Math.random()).toFixed(1),
          avgRating: parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)),
          totalRatings: Math.floor(Math.random() * 200) + 10,
          views: Math.floor(Math.random() * 5000) + 100,
          isVerified: true,
          isCertified: Math.random() > 0.3,
          businessHours: "10:00 AM - 8:00 PM",
          primaryColor: "#FF6A00",
          secondaryColor: "#0A0A0F",
          socialLinks: [],
          mapEmbed: ""
        });
      }
      toast.success(`Seeded ${amount} shops`);
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Shop Seeding Failed");
    }
    setIsProcessing(false);
  };

  const seedShopDetails = async () => {
    if (!confirm("Seed reviews, working hours, products, and services for all existing shops?")) return;
    setIsProcessing(true);
    try {
      const shopsSnap = await getDocs(collection(db, "shops"));
      if (shopsSnap.empty) {
        toast.error("No shops found to seed details");
        setIsProcessing(false);
        return;
      }

      let count = 0;
      for (const shopDoc of shopsSnap.docs) {
        const shopData = shopDoc.data();
        const shopId = shopDoc.id;
        const cat = shopData.category || "General";

        // 1. Generate Opening Hours
        const openingHoursDetails = {
          monday: { open: "09:00 AM", close: "08:30 PM", isClosed: false },
          tuesday: { open: "09:00 AM", close: "08:30 PM", isClosed: false },
          wednesday: { open: "09:00 AM", close: "08:30 PM", isClosed: false },
          thursday: { open: "09:00 AM", close: "08:30 PM", isClosed: false },
          friday: { open: "09:00 AM", close: "09:00 PM", isClosed: false },
          saturday: { open: "10:00 AM", close: "09:00 PM", isClosed: false },
          sunday: { open: "10:00 AM", close: "04:00 PM", isClosed: Math.random() > 0.7 }
        };

        const menu = [
          {
            name: "Popular Offerings",
            items: [
              {
                name: `Premium ${cat} Item 1`,
                description: `Best-in-class ${cat.toLowerCase()} offering with superior quality and verified standards.`,
                price: Math.floor(Math.random() * 1500) + 250,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                popular: true,
                featured: true,
                isNew: true
              },
              {
                name: `Specialized ${cat} Service`,
                description: `Expert consultation and complete service package tailored for your exact requirements.`,
                price: Math.floor(Math.random() * 3000) + 500,
                image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80",
                popular: true,
                featured: true,
                isNew: true
              }
            ]
          },
          {
            name: "Standard Catalog",
            items: [
              {
                name: `Essential ${cat} Bundle`,
                description: `Everyday reliable bundle designed for high performance and exceptional durability.`,
                price: Math.floor(Math.random() * 800) + 100,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                popular: false,
                featured: false,
                isNew: true
              },
              {
                name: `Value ${cat} Package`,
                description: `Affordable, high-value choice maintaining full commercial grade standards.`,
                price: Math.floor(Math.random() * 1200) + 200,
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
                popular: false,
                featured: false,
                isNew: true
              }
            ]
          }
        ];

        // 3. Generate Gallery Images
        const gallery = [
          "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80"
        ];

        // 4. Seed Subcollection Ratings & calculate average
        const reviewNames = ["Amit Patel", "Neha Sharma", "Rajesh Kumar", "Pooja Mehta", "Vikram Malhotra"];
        const reviewComments = [
          "Absolutely wonderful experience! Highly professional and prompt service.",
          "Great quality products and very transparent pricing. Will definitely visit again.",
          "Very satisfied with the customer support. The staff is polite and knowledgeable.",
          "Excellent value for money. Highly recommended for anyone in the local area.",
          "Good service overall, very clean and well maintained establishment."
        ];

        const ratingsRef = collection(db, "shops", shopId, "ratings");
        const existingRatings = await getDocs(ratingsRef);
        let totalRatings = existingRatings.size;
        let sumRating = 0;
        existingRatings.forEach(r => { sumRating += (r.data().rating || 5); });

        // Add 3 new realistic reviews if fewer than 5 exist
        if (totalRatings < 5) {
          for (let i = 0; i < 3; i++) {
            const rScore = Math.floor(Math.random() * 2) + 4; // 4 or 5
            const rName = reviewNames[(count + i) % reviewNames.length];
            const rComment = reviewComments[(count + i) % reviewComments.length];
            await addDoc(ratingsRef, {
              rating: rScore,
              comment: rComment,
              userName: rName,
              createdAt: serverTimestamp()
            });
            totalRatings += 1;
            sumRating += rScore;
          }
        }

        const avgRating = totalRatings > 0 ? parseFloat((sumRating / totalRatings).toFixed(1)) : 4.8;

        // 5. Update Shop Document
        await updateDoc(doc(db, "shops", shopId), {
          openingHoursDetails,
          menu,
          gallery,
          reviewCount: totalRatings,
          totalRatings,
          avgRating,
          rating: avgRating.toFixed(1)
        });

        count++;
      }

      toast.success(`Successfully seeded details & reviews for ${count} shops!`);
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to seed shop details");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Database Master</h1>
        <p className="text-gray-500">
          System maintenance and data seeding tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Shops", count: stats.shops, color: "primary", col: "shops" },
          { label: "Categories", count: stats.categories, color: "success", col: "categories" },
          { label: "Countries", count: stats.countries, color: "warning", col: "countries" },
          { label: "States", count: stats.states, color: "info", col: "states" },
          { label: "Cities", count: stats.cities, color: "danger", col: "cities" },
          { label: "Areas", count: stats.areas, color: "secondary", col: "areas" },
          { label: "Clusters", count: stats.clusters, color: "info", col: "clusters" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {item.label}
              </p>
              <h2 className="text-3xl font-black text-gray-900">
                {isLoading ? "..." : item.count}
              </h2>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="p-2"
              onClick={() => clearCollection(item.col)}
              disabled={isProcessing}
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
              <CloudArrowUpIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Seeding Tools</h3>
              <p className="text-sm text-gray-500">
                Populate the database with realistic test data.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Core Hierarchy
            </p>
            <Button
              fullWidth
              variant="outline"
              className="py-6 border-2 border-dashed border-primary-100 hover:border-primary-500 hover:bg-primary-50 text-primary-900 font-bold"
              onClick={seedMasterData}
              disabled={isProcessing}
            >
              Seed Master Locations & Categories
            </Button>
            <p className="text-[10px] text-gray-400 italic">
              Seeds: India → Gujarat → Ahmedabad → Areas & Standard Categories
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Generate Shops
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[10, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => seedShops(num)}
                  disabled={isProcessing}
                  className="p-4 rounded-md border-2 border-dashed border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-1 group"
                >
                  <span className="text-xl font-black text-gray-900 group-hover:text-primary-800">
                    {num}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Shops
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Enhance Seeded Shops
            </p>
            <Button
              fullWidth
              variant="outline"
              className="py-6 border-2 border-dashed border-amber-200 hover:border-amber-500 hover:bg-amber-50 text-amber-900 font-bold"
              onClick={seedShopDetails}
              disabled={isProcessing}
            >
              Seed Reviews, Hours, Products & Services
            </Button>
            <p className="text-[10px] text-gray-400 italic">
              Populates all existing shops with realistic reviews, business hours, catalog items, and gallery photos.
            </p>
          </div>

          <div className="p-6 bg-red-50 rounded-md border border-red-100 space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <ExclamationTriangleIcon className="w-5 h-5" />
              SYSTEM WIPE
            </div>
            <p className="text-xs text-red-600/70">
              Permanently delete all shops, activity logs, and inquiries. Use
              with extreme caution.
            </p>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (confirm("FINAL WARNING: Wipe EVERYTHING?")) {
                  // Add logic for full wipe
                  toast.error(
                    "Full wipe disabled for safety. Use individual wipes.",
                  );
                }
              }}
              disabled={isProcessing}
            >
              Wipe All Data
            </Button>
          </div>
        </div>

        <div className="bg-primary-900 p-10 rounded-[32px] shadow-xl flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
          <CircleStackIcon className="absolute top-0 right-0 w-64 h-64 opacity-5 translate-x-1/4 -translate-y-1/4" />
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-white/10 rounded-md flex items-center justify-center mx-auto">
              <ArrowPathIcon
                className={`w-10 h-10 text-amber-400 ${isProcessing ? "animate-spin" : ""}`}
              />
            </div>
            <h3 className="text-2xl font-bold">System Status</h3>
            <p className="text-white/50 text-sm max-w-xs mx-auto">
              {isProcessing
                ? "The database is currently being modified. Please wait..."
                : "All systems are operational. Ready for maintenance tasks."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
