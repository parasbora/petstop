// src/store/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { isAuthenticated } from "@/lib/auth";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: isAuthenticated(),
    data:null,
    
  },
  reducers: {
    _sync(state) {
      state.isAuthenticated = isAuthenticated();
    },
  },
});

export const authReducer = authSlice.reducer;
export const syncAuth = authSlice.actions._sync;