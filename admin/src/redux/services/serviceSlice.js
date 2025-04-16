import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axios";
import { getUserData } from "@/utils.js/authUtils";
import { toast } from "sonner";

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/service`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addService = createAsyncThunk(
  "services/addService",
  async (serviceData, { rejectWithValue }) => {
    try {
      const { user } = getUserData();
      const payload = {
        userId: user.id,
        ...serviceData,
      };
      const response = await axios.post("/service", payload);
      if (response.data.success) {
        toast.success(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      // Return the error message for field-specific handling
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const { user } = getUserData();
      const response = await axios.put(`/service/${id}`, {
        ...serviceData,
        userId: user.id,
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      // Return the error message for field-specific handling
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/service/${id}`);
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

export const bulkUploadServices = createAsyncThunk(
  "services/bulkUploadServices",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post("/service/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(fetchServices());
        return response.data.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);

      // If there are specific validation errors, show them
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        error.response.data.errors.forEach((err) => {
          toast.error(err);
        });
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  services: [],
  isLoading: false,
  serviceData: {
    name: "",
    email: "",
    phone: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    bankAddress: "",
    state: "",
    district: "",
    type: "",
  },
  error: null,
  validationErrors: {
    email: null,
    phone: null,
    accountNumber: null,
    name: null,
  },
};

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setSeviceData: (state, action) => {
      state.serviceData = { ...state.serviceData, ...action.payload };
    },
    resetService: (state) => {
      state.serviceData = initialState.serviceData;
      state.error = null;
      state.validationErrors = initialState.validationErrors;
    },
    clearValidationErrors: (state) => {
      state.validationErrors = initialState.validationErrors;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Services
    builder.addCase(fetchServices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.isLoading = false;
      state.services = action.payload;
    });
    builder.addCase(fetchServices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Add service
    builder.addCase(addService.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.validationErrors = initialState.validationErrors;
    });
    builder.addCase(addService.fulfilled, (state, action) => {
      state.isLoading = false;
      state.services.push(action.payload);
    });
    builder.addCase(addService.rejected, (state, action) => {
      state.isLoading = false;

      // Check for specific validation errors
      const errorMsg = action.payload;
      if (errorMsg.includes("Email")) {
        state.validationErrors.email = errorMsg;
      } else if (errorMsg.includes("Phone")) {
        state.validationErrors.phone = errorMsg;
      } else if (errorMsg.includes("Account")) {
        state.validationErrors.accountNumber = errorMsg;
      } else if (errorMsg.includes("Name")) {
        state.validationErrors.name = errorMsg;
      } else {
        state.error = errorMsg;
      }
    });

    // Update service
    builder.addCase(updateService.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.validationErrors = initialState.validationErrors;
    });
    builder.addCase(updateService.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.services.findIndex(
        (service) => service._id === action.payload._id
      );
      if (index !== -1) {
        state.services[index] = action.payload;
      }
    });
    builder.addCase(updateService.rejected, (state, action) => {
      state.isLoading = false;

      // Check for specific validation errors
      const errorMsg = action.payload;
      if (errorMsg.includes("Email")) {
        state.validationErrors.email = errorMsg;
      } else if (errorMsg.includes("Phone")) {
        state.validationErrors.phone = errorMsg;
      } else if (errorMsg.includes("Account")) {
        state.validationErrors.accountNumber = errorMsg;
      } else if (errorMsg.includes("Name")) {
        state.validationErrors.name = errorMsg;
      } else {
        state.error = errorMsg;
      }
    });

    // Delete service
    builder.addCase(deleteService.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteService.fulfilled, (state, action) => {
      state.isLoading = false;
      state.services = state.services.filter(
        (service) => service._id !== action.payload
      );
    });
    builder.addCase(deleteService.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Bulk Upload
    builder.addCase(bulkUploadServices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(bulkUploadServices.fulfilled, (state) => {
      state.isLoading = false;
      // Services will be fetched separately
    });
    builder.addCase(bulkUploadServices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { setSeviceData, resetService, clearValidationErrors } =
  serviceSlice.actions;

export default serviceSlice.reducer;
