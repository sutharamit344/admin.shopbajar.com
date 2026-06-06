import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { locationService, type Country, type State, type City, type Area } from "../firebaseservices/location/location.service";
import toast from "react-hot-toast";

interface LocationState {
  countries: Country[];
  states: State[];
  cities: City[];
  areas: Area[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  countries: [],
  states: [],
  cities: [],
  areas: [],
  isLoading: false,
  error: null,
};

export const fetchAllLocations = createAsyncThunk("location/fetchAll", async () => {
  const [countries, states, cities, areas] = await Promise.all([
    locationService.getCountries(),
    locationService.getStates(),
    locationService.getCities(),
    locationService.getAreas(),
  ]);
  return { countries, states, cities, areas };
});

export const addCountryAction = createAsyncThunk(
  "location/addCountry",
  async ({ name, code }: { name: string; code: string }, { dispatch }) => {
    try {
      await locationService.addCountry(name, code);
      toast.success("Country added");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to add country");
      throw e;
    }
  }
);

export const addStateAction = createAsyncThunk(
  "location/addState",
  async ({ name, countryId }: { name: string; countryId: string }, { dispatch }) => {
    try {
      await locationService.addState(name, countryId);
      toast.success("State added");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to add state");
      throw e;
    }
  }
);

export const addCityAction = createAsyncThunk(
  "location/addCity",
  async ({ name, stateId }: { name: string; stateId: string }, { dispatch }) => {
    try {
      await locationService.addCity(name, stateId);
      toast.success("City added");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to add city");
      throw e;
    }
  }
);

export const addAreaAction = createAsyncThunk(
  "location/addArea",
  async (data: Omit<Area, "id">, { dispatch }) => {
    try {
      await locationService.addArea(data);
      toast.success("Area added");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to add area");
      throw e;
    }
  }
);

export const updateCountryAction = createAsyncThunk(
  "location/updateCountry",
  async ({ id, name, code }: { id: string; name: string; code: string }, { dispatch }) => {
    try {
      await locationService.updateCountry(id, name, code);
      toast.success("Country updated");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to update country");
      throw e;
    }
  }
);

export const updateStateAction = createAsyncThunk(
  "location/updateState",
  async ({ id, name, countryId }: { id: string; name: string; countryId: string }, { dispatch }) => {
    try {
      await locationService.updateState(id, name, countryId);
      toast.success("State updated");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to update state");
      throw e;
    }
  }
);

export const updateCityAction = createAsyncThunk(
  "location/updateCity",
  async ({ id, name, stateId }: { id: string; name: string; stateId: string }, { dispatch }) => {
    try {
      await locationService.updateCity(id, name, stateId);
      toast.success("City updated");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to update city");
      throw e;
    }
  }
);

export const updateAreaAction = createAsyncThunk(
  "location/updateArea",
  async ({ id, ...data }: { id: string } & Partial<Omit<Area, "id">>, { dispatch }) => {
    try {
      await locationService.updateArea(id, data);
      toast.success("Area updated");
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error("Failed to update area");
      throw e;
    }
  }
);

export const deleteLocationAction = createAsyncThunk(
  "location/delete",
  async ({ id, type }: { id: string; type: "country" | "state" | "city" | "area" }, { dispatch }) => {
    try {
      if (type === "country") await locationService.deleteCountry(id);
      if (type === "state") await locationService.deleteState(id);
      if (type === "city") await locationService.deleteCity(id);
      if (type === "area") await locationService.deleteArea(id);
      toast.success(`${type} deleted`);
      dispatch(fetchAllLocations());
    } catch (e: any) {
      toast.error(`Failed to delete ${type}`);
      throw e;
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.countries = action.payload.countries;
        state.states = action.payload.states;
        state.cities = action.payload.cities;
        state.areas = action.payload.areas;
      })
      .addCase(fetchAllLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch locations";
      });
  },
});

export default locationSlice.reducer;
