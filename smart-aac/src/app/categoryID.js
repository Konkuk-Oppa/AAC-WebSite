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

const useTTSStore = create((set) => ({
  tts: '',
  setTts: (text) => set({ tts: text }),
  
  // TTS 음성 옵션들
  ttsOptions: [
    { id: 'ko-KR-Chirp3-HD-Achernar', name: '여성 음성 1 (자연스러운)', gender: 'female', description: '부드럽고 자연스러운 여성 음성' },
    { id: 'ko-KR-Chirp3-HD-Algenib', name: '남성 음성 1 (자연스러운)', gender: 'male', description: '안정적이고 명확한 남성 음성' }
  ],
  
  // 현재 선택된 TTS 음성 (기본값: 첫 번째 옵션)
  selectedTTS: 'ko-KR-Chirp3-HD-Achernar',

  // TTS 음성 선택 함수
  setSelectedTTS: (ttsId) => set({ selectedTTS: ttsId }),
  
  // 현재 선택된 TTS 정보 가져오기
  getSelectedTTSInfo: () => {
    const state = useTTSStore.getState();
    return state.ttsOptions.find(option => option.id === state.selectedTTS);
  }
}));


export default useStore
export { useTTSStore }