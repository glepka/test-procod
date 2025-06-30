import { create } from "zustand";
import { blocksq } from "../mocks/mocks";

export const usePDFStore = create((set, get) => ({
  fileName:
    new URLSearchParams(window.location.search).get("fileName") || "test.pdf",
  pages: [],
  selectedRegion: {},
  selectedRegions: blocksq,
  // selectedRegions: [],

  setSelectedRegion: (region) =>
    set(() => ({
      selectedRegion: region,
    })),

  addRegion: (region) =>
    set((state) => ({
      selectedRegions: [...state.selectedRegions, region],
    })),

  setSelectedRegions: (newRegions) => {
    set(() => ({
      selectedRegions: newRegions,
    }));
  },

  clearSelection: () =>
    set(() => ({
      selectedRegions: [],
    })),
}));
