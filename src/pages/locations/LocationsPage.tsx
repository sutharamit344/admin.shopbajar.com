import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAllLocations,
  deleteLocationAction,
} from "../../store/locationSlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
} from "../../components/common/common";
import {
  GlobeAltIcon,
  MapIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { opened } from "../../store/drawerSlice";
import { openDialog } from "../../store/dialogSlice";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";

type LocationTab = "countries" | "states" | "cities" | "areas";

export const LocationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { countries, states, cities, areas, isLoading } = useAppSelector(
    (state) => state.locations,
  );
  const [activeTab, setActiveTab] = useState<LocationTab>("countries");

  const loadData = () => {
    dispatch(fetchAllLocations());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleAdd = () => {
    const drawerMap: Record<LocationTab, string> = {
      countries: "Country",
      states: "State",
      cities: "City",
      areas: "Area",
    };
    dispatch(
      opened({
        name: drawerMap[activeTab],
        title: `Add New ${activeTab.slice(0, -1)}`,
        data: null, // Clear data for Add mode
      }),
    );
  };

  const handleEdit = (row: any) => {
    const editDrawerMap: Record<LocationTab, string> = {
      countries: "Country",
      states: "State",
      cities: "City",
      areas: "Area",
    };
    dispatch(
      opened({
        name: editDrawerMap[activeTab],
        title: `Edit ${activeTab.slice(0, -1)}: ${row.name}`,
        data: row,
      }),
    );
  };

  const countryColumns: Column<any>[] = [
    { key: "name", header: "Country Name", sortable: true },
    { key: "code", header: "Code", sortable: true },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmcountrydelete",
                  name: row.name,
                  type: "country",
                }),
              )
            }
          />
        </div>
      ),
    },
  ];

  const stateColumns: Column<any>[] = [
    { key: "name", header: "State Name", sortable: true },
    {
      key: "countryId",
      header: "Country",
      render: (value) =>
        countries.find((c) => c.id === value)?.name || "Unknown",
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmstatedelete",
                  name: row.name,
                  type: "state",
                }),
              )
            }
          />
        </div>
      ),
    },
  ];

  const cityColumns: Column<any>[] = [
    { key: "name", header: "City Name", sortable: true },
    {
      key: "stateId",
      header: "State",
      render: (value) => states.find((s) => s.id === value)?.name || "Unknown",
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmcitydelete",
                  name: row.name,
                  type: "city",
                }),
              )
            }
          />
        </div>
      ),
    },
  ];

  const areaColumns: Column<any>[] = [
    { key: "name", header: "Area Name", sortable: true },
    {
      key: "cityId",
      header: "City",
      render: (value) => cities.find((c) => c.id === value)?.name || "Unknown",
    },
    { key: "pincode", header: "Pincode" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmareadelete",
                  name: row.name,
                  type: "area",
                }),
              )
            }
          />
        </div>
      ),
    },
  ];

  const tabConfig: Record<
    LocationTab,
    { icon: any; columns: Column<any>[]; data: any[] }
  > = {
    countries: { icon: GlobeAltIcon, columns: countryColumns, data: countries },
    states: { icon: MapIcon, columns: stateColumns, data: states },
    cities: { icon: BuildingOfficeIcon, columns: cityColumns, data: cities },
    areas: { icon: MapPinIcon, columns: areaColumns, data: areas },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Location Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage geographic hierarchy and business areas.
          </p>
        </div>
        <AddIconButton onClick={handleAdd} label={`Add ${activeTab.slice(0, -1)}`} />
      </div>

      <div className="flex gap-4 border-b border-gray-100">
        {(Object.keys(tabConfig) as LocationTab[]).map((tab) => {
          const Icon = tabConfig[tab].icon;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "border-b-2 border-primary-800 text-primary-800"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab}
            </button>
          );
        })}
      </div>

      <DataTable
        title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List`}
        columns={tabConfig[activeTab].columns}
        data={tabConfig[activeTab].data}
        isLoading={isLoading}
        onRefresh={loadData}
        searchPlaceholder={`Search ${activeTab}...`}
      />

      <DeleteDialog
        itemType={
          activeTab === "countries" ? "country" : 
          activeTab === "cities" ? "city" : 
          activeTab.slice(0, -1)
        }
        onConfirm={async (id) => {
          const type = activeTab === "countries" ? "country" : 
                       activeTab === "cities" ? "city" : 
                       activeTab.slice(0, -1);
          await dispatch(
            deleteLocationAction({ id, type: type as any }),
          );
        }}
      />
    </div>
  );
};
