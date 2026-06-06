import React, { useEffect, useState } from "react";
import MainRouter from "./_routers/Router";
import { Toaster } from "react-hot-toast";
import { DeleteDialog } from "./components/dialog/DeleteDialog";
import Drawers from "./components/drawer/Drawers";
import { authService } from "./firebaseservices/auth/auth.service";
import { setUser } from "./pages/login/loginSlice";
import { useAppDispatch } from "./app/hooks";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Verify admin status
          const isAdmin = await authService.isUserAdmin();
          if (isAdmin) {
            const profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              isAdmin: true,
            };
            localStorage.setItem("adminUser", JSON.stringify(profile));
            dispatch(setUser(profile));
          } else {
            // Logged in but not admin
            await authService.logout();
            localStorage.removeItem("adminUser");
            dispatch(setUser(null));
          }
        } else {
          localStorage.removeItem("adminUser");
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        localStorage.removeItem("adminUser");
        dispatch(setUser(null));
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Initializing Secure Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <DeleteDialog onConfirm={() => {}} />
      <Drawers />
      <MainRouter />
    </>
  );
};

export default App;
