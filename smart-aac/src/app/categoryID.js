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
    { id: 'ko-KR-Neural2-A', name: '여성 음성 1 (자연스러운)', gender: 'female', description: '부드럽고 자연스러운 여성 음성' },
    { id: 'ko-KR-Neural2-B', name: '남성 음성 1 (자연스러운)', gender: 'male', description: '안정적이고 명확한 남성 음성' },
    { id: 'ko-KR-Neural2-C', name: '여성 음성 2 (밝은)', gender: 'female', description: '밝고 활기찬 여성 음성' },
    { id: 'ko-KR-Standard-A', name: '여성 음성 3 (표준)', gender: 'female', description: '표준 품질의 여성 음성' },
    { id: 'ko-KR-Standard-B', name: '남성 음성 2 (표준)', gender: 'male', description: '표준 품질의 남성 음성' }
  ],
  
  // 현재 선택된 TTS 음성 (기본값: 첫 번째 옵션)
  selectedTTS: 'ko-KR-Neural2-A',
  
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