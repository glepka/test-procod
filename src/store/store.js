import { create } from 'zustand';

export const usePDFStore = create((set, get) => ({
  fileName: new URLSearchParams(window.location.search).get('fileName') || 'test.pdf',
  pages: [],
  selectedRegion: {},
  selectedRegions: [],

  setSelectedRegion: (region) =>
    set(() => ({
      selectedRegion: region,
    })),

  addRegion: (region) =>
    set((state) => ({
      selectedRegions: [...state.selectedRegions, region],
    })),

  clearSelection: () =>
    set(() => ({
      selectedRegions: [],
    })),
}));
