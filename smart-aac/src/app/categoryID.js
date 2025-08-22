// stores/useStore.js
import { create } from 'zustand'

const useStore = create((set) => ({
  categoryID: {},
  setCategoryID: (categoryName, categoryID) => set((state) => ({
    categoryID: {
      ...state.categoryID,
      [categoryName]: categoryID
    }
  }))
}));

export default useStore