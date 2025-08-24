'use client'
import { useState } from 'react';
import { useTTSStore } from '../categoryID';
import { getTTS } from '../controller';
import styles from './tts-settings.module.css';

export default function TTSSettings() {
  const { 
    ttsOptions, 
    selectedTTS, 
    setSelectedTTS,
    getSelectedTTSInfo 
  } = useTTSStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState('안녕하세요. 이것은 음성 테스트입니다.');

  // 음성 미리듣기 함수
  const playPreview = async (ttsId) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // 임시로 선택된 TTS로 변경
      const originalTTS = selectedTTS;
      setSelectedTTS(ttsId);
      
      const response = await getTTS({ text: testText });
      
      if (response.success && response.data) {
        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false);
        });
        
        await audio.play();
      } else {
        setIsPlaying(false);
        alert('음성 재생에 실패했습니다.');
      }
      
      // 원래 TTS로 복원 (실제 선택하지 않은 경우)
      if (originalTTS !== ttsId) {
        setSelectedTTS(originalTTS);
      }
    } catch (error) {
      console.error('음성 미리듣기 오류:', error);
      setIsPlaying(false);
      alert('음성 재생 중 오류가 발생했습니다.');
    }
  };

  // TTS 선택 함수
  const handleTTSSelect = (ttsId) => {
    setSelectedTTS(ttsId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>음성 설정</h1>
        <p>원하는 음성을 선택하세요</p>
      </div>

      <div className={styles.testSection}>
        <label htmlFor="testText">테스트 문장:</label>
        <input
          id="testText"
          type="text"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className={styles.testInput}
          placeholder="테스트할 문장을 입력하세요"
        />
      </div>

      <div className={styles.voiceOptions}>
        {ttsOptions.map((option) => (
          <div 
            key={option.id} 
            className={`${styles.voiceCard} ${selectedTTS === option.id ? styles.selected : ''}`}
          >
            <div className={styles.voiceInfo}>
              <div className={styles.voiceHeader}>
                <h3>{option.name}</h3>
                <span className={`${styles.gender} ${styles[option.gender]}`}>
                  {option.gender === 'female' ? '👩' : '👨'}
                </span>
              </div>
              <p className={styles.description}>{option.description}</p>
            </div>
            
            <div className={styles.voiceActions}>
              <button
                className={styles.previewBtn}
                onClick={() => playPreview(option.id)}
                disabled={isPlaying}
              >
                {isPlaying ? '재생중...' : '미리듣기'}
              </button>
              <button
                className={`${styles.selectBtn} ${selectedTTS === option.id ? styles.selected : ''}`}
                onClick={() => handleTTSSelect(option.id)}
              >
                {selectedTTS === option.id ? '선택됨' : '선택하기'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.currentSelection}>
        <h3>현재 선택된 음성</h3>
        <div className={styles.selectedInfo}>
          <p><strong>{getSelectedTTSInfo()?.name}</strong></p>
          <p>{getSelectedTTSInfo()?.description}</p>
        </div>
      </div>
    </div>
  );
}
