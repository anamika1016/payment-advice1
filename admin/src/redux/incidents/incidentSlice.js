import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axios";
import { getUserData } from "@/utils.js/authUtils";
import { toast } from "sonner";

export const fetchIncidents = createAsyncThunk(
  "incidents/fetchIncidents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/incident`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addIncident = createAsyncThunk(
  "incidents/addIncident",
  async (incidentData, { rejectWithValue }) => {
    try {
      console.log(incidentData);

      const { user } = getUserData();
      const response = await axios.post("/incident", {
        ...incidentData,
        userId: user.id,
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateIncident = createAsyncThunk(
  "incidents/updateIncident",
  async ({ id, incidentData }, { rejectWithValue }) => {
    try {
      const { user } = getUserData();
      const response = await axios.put(`/incident/${id}`, {
        ...incidentData,
        userId: user.id,
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteIncident = createAsyncThunk(
  "incidents/deleteIncident",
  async (id, { rejectWithValue }) => {
    try {
      const { user } = getUserData();
      const response = await axios.delete(`/incident/${id}`, {
        params: { userId: user.id },
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRecipientByName = createAsyncThunk(
  "recipients/fetchByName",
  async ({ namePrefix }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/incident/recipients?name=${namePrefix}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  "incidents/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  incidents: [],
  isLoading: false,
  recipientNames: [],
  incidentData: {
    ref_no: "",
    date: "",
    recipient_name: "",
    recipient_address: "",
    account_number: "",
    ifsc_code: "",
    amount: "",
    utr_no: "",
    transaction_date: "",
  },
  error: null,
};

const incidentSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    setIncidentData: (state, action) => {
      state.incidentData = { ...state.incidentData, ...action.payload };
    },
    resetIncident: (state) => {
      state.incidentData = initialState.incidentData;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchIncidents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchIncidents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.incidents = action.payload;
    });
    builder.addCase(fetchIncidents.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Add Incidents
    builder.addCase(addIncident.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addIncident.fulfilled, (state, action) => {
      state.isLoading = false;
      state.incidents.push(action.payload);
    });
    builder.addCase(addIncident.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Update Incidents
    builder.addCase(updateIncident.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateIncident.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.incidents.findIndex(
        (incident) => incident._id === action.payload._id
      );
      if (index !== -1) {
        state.incidents[index] = action.payload;
      }
    });
    builder.addCase(updateIncident.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Delete Incidents
    builder.addCase(deleteIncident.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteIncident.fulfilled, (state, action) => {
      state.isLoading = false;
      state.incidents = state.incidents.filter(
        (incident) => incident._id !== action.payload
      );
    });
    builder.addCase(deleteIncident.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchRecipientByName.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchRecipientByName.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recipientNames = action.payload;
    });
    builder.addCase(fetchRecipientByName.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(updateIncidentStatus.fulfilled, (state, action) => {
      const index = state.incidents.findIndex(
        (incident) => incident._id === action.payload._id
      );
      if (index !== -1) {
        state.incidents[index] = action.payload;
      }
    });
  },
});

export const { setIncidentData, resetIncident } = incidentSlice.actions;

export default incidentSlice.reducer;
