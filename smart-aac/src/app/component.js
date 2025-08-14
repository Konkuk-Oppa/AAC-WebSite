import styles from './page.module.css';
import { useState, useRef } from 'react';

// TextCard 옵션 모달
function TextCardModal({isOpen, onClose, item, onEdit, onDelete, onBookmark}) {
  if (!isOpen) return null;
  console.log(item);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.textCardModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>텍스트 옵션</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.textCardModalBody}>
          <div className={styles.selectedText}>"{item.text}"</div>
          <div className={styles.textCardOptions}>
            <button 
              className={styles.textCardOption}
              onClick={() => {
                onEdit(item.text);
                onClose();
              }}
            >
              <span className="material-symbols-outlined">edit</span>
              수정
            </button>
            <button 
              className={styles.textCardOption}
              onClick={() => {
                onDelete(text);
                onClose();
              }}
            >
              <span className="material-symbols-outlined">delete</span>
              삭제
            </button>
            <button 
              className={styles.textCardOption}
              onClick={() => {
                onBookmark(item);
                onClose();
              }}
            >
              <span className="material-symbols-outlined">
                {item.bookmark ? 'bookmark' : 'bookmark_border'}
              </span>
              {item.bookmark ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TextCard({
  item,
  isNotEnd, 
  onTextClick, 
  onEdit, 
  onDelete, 
  onBookmark, 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // TTS 기능
  const handleTTS = (e) => {
    e.stopPropagation(); 
    
    // TODO 더 자연스러운 TTS 구현하기
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'ko-KR'; // 한국어 설정
      utterance.rate = 0.8; // 속도 조절
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };

  // 클릭 핸들러
  const handleClick = () => {
    if (!isLongPress.current && onTextClick) {
      onTextClick(item.text);
    }
    isLongPress.current = false;
  };

  // 길게 누르기 시작
  const handleMouseDown = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsModalOpen(true);
    }, 500); // 500ms 길게 누르기
  };

  // 길게 누르기 취소
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 터치 이벤트 핸들러 (모바일)
  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsModalOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return(
    <>
      <div 
        className={styles.sentenceItem}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.textCardContent}>
          <p>{item.text}</p>
          <button 
            className={styles.ttsButton}
            onClick={handleTTS}
            title="텍스트 읽기"
          >
            <span className="material-symbols-outlined">volume_up</span>
          </button>
        </div>
        {isNotEnd && <hr/>}
      </div>

      <TextCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onBookmark={onBookmark}
      />
    </>
  )
}

function ConversationCardModal({isOpen}) {
  if (!isOpen) return null;
  
  return(<div>모달 내용</div>);
}

export function ConversationCard({ item, onTextClick, isNotEnd }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // TTS 기능
  const handleTTS = (e) => {
    e.stopPropagation(); 
    
    // TODO 더 자연스러운 TTS 구현하기
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(item);
      utterance.lang = 'ko-KR'; // 한국어 설정
      utterance.rate = 0.8; // 속도 조절
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };

  // 클릭 핸들러
  const handleClick = () => {
    if (!isLongPress.current && onTextClick) {
      onTextClick(item);
    }
    isLongPress.current = false;
  };

  // 길게 누르기 시작
  const handleMouseDown = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsModalOpen(true);
    }, 500); // 500ms 길게 누르기
  };

  // 길게 누르기 취소
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 터치 이벤트 핸들러 (모바일)
  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsModalOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  return (
    <>
      <div 
        className={styles.sentenceItem}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.textCardContent}>
          <p>{item}</p>
          <button 
            className={styles.ttsButton}
            onClick={handleTTS}
            title="텍스트 읽기"
          >
            <span className="material-symbols-outlined">volume_up</span>
          </button>
        </div>
        {isNotEnd && <hr/>}
      </div>

      <ConversationCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
    </>
  );
}
