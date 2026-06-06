// src/components/drawer/Drawers.tsx
import React from "react";
import { Drawer } from "./Drawer";
import { useAppSelector } from "../../app/hooks";
import { EditShopDrawer } from "../../pages/shops/EditShopDrawer";
import { CategoryDrawer } from "../../pages/categories/CategoryDrawer";
import { SubCategoryDrawer } from "../../pages/categories/SubCategoryDrawer";
import { ClusterDrawer } from "../../pages/clusters/ClusterDrawer";
import { CountryDrawer } from "../../pages/locations/drawers/CountryDrawer";
import { StateDrawer } from "../../pages/locations/drawers/StateDrawer";
import { CityDrawer } from "../../pages/locations/drawers/CityDrawer";
import { AreaDrawer } from "../../pages/locations/drawers/AreaDrawer";
import { FeatureDrawer } from "../../pages/features/FeatureDrawer";

const Drawers = () => {
  const isDrawerOpen = useAppSelector((state) => state.drawer.open);
  const drawerName = useAppSelector((state) => state.drawer.name);

  const drawerComponents: Record<string, React.JSX.Element> = {
    ShopEdit: <EditShopDrawer />,
    // Unified Drawers
    Category: <CategoryDrawer />,
    SubCategory: <SubCategoryDrawer />,
    Cluster: <ClusterDrawer />,
    Country: <CountryDrawer />,
    State: <StateDrawer />,
    City: <CityDrawer />,
    Area: <AreaDrawer />,
    Feature: <FeatureDrawer />,
    // Aliases for backward compatibility if needed during migration
    CategoryAdd: <CategoryDrawer />,
    CategoryEdit: <CategoryDrawer />,
    SubCategoryAdd: <SubCategoryDrawer />,
    SubCategoryEdit: <SubCategoryDrawer />,
    ClusterAdd: <ClusterDrawer />,
    ClusterEdit: <ClusterDrawer />,
    CountryAdd: <CountryDrawer />,
    CountryEdit: <CountryDrawer />,
    StateAdd: <StateDrawer />,
    StateEdit: <StateDrawer />,
    CityAdd: <CityDrawer />,
    CityEdit: <CityDrawer />,
    AreaAdd: <AreaDrawer />,
    AreaEdit: <AreaDrawer />,
  };

  return (
    <>
      {isDrawerOpen && Object.keys(drawerComponents).includes(drawerName) && (
        <Drawer>{drawerComponents[drawerName]}</Drawer>
      )}
    </>
  );
};

export default Drawers;
