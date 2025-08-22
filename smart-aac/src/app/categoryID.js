// stores/useStore.js
import { create } from 'zustand'

const useStore = create((set) => ({
  categoryIDs: {},
  setCategoryID: (categoryName, categoryID) => set((state) => ({
    categoryIDs: {
      ...state.categoryIDs,
      [categoryID]: categoryName
    }
  }))
}));

export default useStore