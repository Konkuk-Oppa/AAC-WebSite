import { getRecommendCategory, getTTS, updateText } from './controller';
import { CategorySelectModal } from './page';
import styles from './page.module.css';
import { useState, useRef, useCallback } from 'react';

// 카테고리 옵션 모달 
function CategoryModal({isOpen, onClose, category, onEdit, onDelete, currentPath}) {
  if (!isOpen) return null;
  const [newText, setNewText] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (await onDelete(currentPath, category.name, category.id)) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.textCardModalContent} onClick={(e) => e.stopPropagation()}>
        {!showDeleteConfirm ? (
          <>
            <div className={styles.modalHeader}>
              <h3>카테고리 수정</h3>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.textCardModalBody}>
              <input 
                type="text" 
                value={newText} 
                onChange={(e) => setNewText(e.target.value)} 
                className={styles.formInput}
              />
              <div className={styles.textCardOptions}>
                <button 
                  className={styles.textCardOption}
                  onClick={handleDeleteClick}
                >
                  <span className="material-symbols-outlined">delete</span>
                  삭제
                </button>
                <button 
                  className={styles.addSubmitButton}
                  onClick={async () => {
                    if (await onEdit(currentPath, category.name, newText, category.id)) {
                      onClose();
                    }
                  }}
                >
                  수정
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h3>카테고리 삭제 확인</h3>
              <button className={styles.closeButton} onClick={handleDeleteCancel}>×</button>
            </div>
            <div className={styles.textCardModalBody}>
              <p>정말로 "{category.name}" 카테고리를 삭제하시겠습니까?</p>
              <p style={{color: '#ff6b6b', fontSize: '14px', marginTop: '10px'}}>
                카테고리 내의 모든 하위 카테고리와 단어/문장이 함께 삭제됩니다.
              </p>
              <div className={styles.textCardOptions} style={{flexDirection: 'row', gap: '12px'}}>
                <button 
                  className={styles.textCardOption}
                  onClick={handleDeleteCancel}
                  style={{flex: 1, justifyContent: 'center'}}
                >
                  취소
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={handleDeleteConfirm}
                  style={{flex: 1}}
                >
                  삭제
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// TextCard 옵션 모달
function TextCardModal({isOpen, onClose, item, onEdit, onDelete, onBookmark, currentPath, categories}) {
  if (!isOpen) return null;

  const [newText, setNewText] = useState(item.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  let cat0Name = "", cat1Name = "", cat2Name = "";
  if (currentPath.length === 0) {
    cat0Name = item.category0;
    cat1Name = item.category1;
    cat2Name = item.category2;
  } else {
    if (currentPath.length > 0) cat0Name = currentPath[0];
    if (currentPath.length > 1) cat1Name = currentPath[1];
    if (currentPath.length > 2) cat2Name = currentPath[2];
  }

  // 삭제 핸들러
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (await onDelete(item.id, item.text, cat0Name, cat1Name, cat2Name)) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // 실시간 북마크 상태 확인
  const getCurrentBookmarkState = () => {
    if (item.bookmark) return item.bookmark;
    let currentBookmarkState = false;
    
    if (categories) {
      categories.forEach(cat0 => {
        if (cat0.name === cat0Name) {
          if (cat1Name === "") {
            // category1이 ""면 cat0의 list에서 찾기
            if (cat0.list) {
              const foundItem = cat0.list.find(textItem => textItem.text === item.text);
              if (foundItem) {
                currentBookmarkState = foundItem.bookmark || false;
              }
            }
          } else {
            // category1이 있는 경우
            cat0.subcategories?.forEach(cat1 => {
              if (cat1.name === cat1Name) {
                if (cat2Name === "") {
                  // category2가 ""면 cat1의 list에서 찾기
                  if (cat1.list) {
                    const foundItem = cat1.list.find(textItem => textItem.text === item.text);
                    if (foundItem) {
                      currentBookmarkState = foundItem.bookmark || false;
                    }
                  }
                } else {
                  // category2가 있는 경우
                  cat1.subcategories?.forEach(cat2 => {
                    if (cat2.name === cat2Name && cat2.list) {
                      const foundItem = cat2.list.find(textItem => textItem.text === item.text);
                      if (foundItem) {
                        currentBookmarkState = foundItem.bookmark || false;
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
    
    return currentBookmarkState;
  };

  const isBookmarked = getCurrentBookmarkState();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.textCardModalContent} onClick={(e) => e.stopPropagation()}>
        {!showDeleteConfirm ? (
          <>
            <div className={styles.modalHeader}>
              <h3>텍스트 수정</h3>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.textCardModalBody}>
              <input 
                type="text" 
                value={newText} 
                onChange={(e) => setNewText(e.target.value)} 
                className={styles.formInput}
              />
              <div className={styles.textCardOptions}>
                <button 
                  className={styles.textCardOption}
                  onClick={handleDeleteClick}
                >
                  <span className="material-symbols-outlined">delete</span>
                  삭제
                </button>
                <button 
                  className={styles.textCardOption}
                  onClick={() => {
                    onBookmark(item.id, item.text, cat0Name, cat1Name, cat2Name);
                    onClose();
                  }}
                >
                  <span className="material-symbols-outlined">
                    {isBookmarked ? 'bookmark' : 'bookmark_border'}
                  </span>
                  {isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                </button>
                <button 
                  className={styles.addSubmitButton}
                  onClick={async () => {
                    if(await onEdit(item.id, item.text, newText, cat0Name, cat1Name, cat2Name)) {
                      onClose();
                    }
                  }}
                >
                  수정
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h3>텍스트 삭제 확인</h3>
              <button className={styles.closeButton} onClick={handleDeleteCancel}>×</button>
            </div>
            <div className={styles.textCardModalBody}>
              <p>정말로 "{item.text}"을(를) 삭제하시겠습니까?</p>
              <p style={{color: '#ff6b6b', fontSize: '14px', marginTop: '10px'}}>
                삭제된 내용은 복구할 수 없습니다.
              </p>
              <div className={styles.textCardOptions} style={{flexDirection: 'row', gap: '12px'}}>
                <button 
                  className={styles.textCardOption}
                  onClick={handleDeleteCancel}
                  style={{flex: 1, justifyContent: 'center'}}
                >
                  취소
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={handleDeleteConfirm}
                  style={{flex: 1}}
                >
                  삭제
                </button>
              </div>
            </div>
          </>
        )}
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
  currentPath,
  categories,
  onUpdate
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // TTS 기능
  const handleTTS = async (e) => {
    e.stopPropagation(); 

    let cat0Name = "", cat1Name = "", cat2Name = "";
    if (currentPath.length === 0) {
      cat0Name = item.category0;
      cat1Name = item.category1;
      cat2Name = item.category2;
    } else {
      if (currentPath.length > 0) cat0Name = currentPath[0];
      if (currentPath.length > 1) cat1Name = currentPath[1];
      if (currentPath.length > 2) cat2Name = currentPath[2];
    }
    onUpdate(item.id, cat0Name, cat1Name, cat2Name);

    // getTTS({text: item.text})
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
        currentPath={currentPath}
        categories={categories}
      />
    </>
  )
}

function ConversationCardModal({isOpen, onClose, categories, onAdd, item}) {
  if (!isOpen) return null;

  const [inputText, setInputText] = useState(item);
  const [selectedType, setSelectedType] = useState("word"); 
  const [selectedCategory0, setSelectedCategory0] = useState("");
  const [selectedCategory1, setSelectedCategory1] = useState("");
  const [selectedCategory2, setSelectedCategory2] = useState("");
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // 중복 실행 방지
  const [recommendCategories, setRecommendCategories] = useState([]);

  const openCategoryModal = async () => {
    setIsCategoryModalOpen(true);
  
    // 추가할 단어 및 문장의 추천 카테고리 가져오기
    const res = await getRecommendCategory({text: inputText});
    
    if (res.success) {
      setRecommendCategories(res.data);
    } 
  }

  // 카테고리 선택 완료시 라벨 표시
  const handleCategorySelect = (cat0, cat1 = "", cat2 = "") => {
    setSelectedCategory0(cat0);
    setSelectedCategory1(cat1);
    setSelectedCategory2(cat2);

    // 표시용 라벨 설정
    let label = cat0;
    if (cat1) {
      label += ` > ${cat1}`;
      if (cat2) {
        label += ` > ${cat2}`;
      }
    }
    setSelectedCategoryLabel(label);
  };

  // 추가 버튼 클릭 
  const handleAdd = useCallback(async () => {
    if (isAdding) return; // 이미 실행 중이면 리턴
    
    if (inputText.trim() && selectedCategory0.trim()) {
      setIsAdding(true); // 실행 중 표시
      
      try {
        // 실제 카테고리에 추가
        const res = await onAdd(inputText, selectedType, selectedCategory0, selectedCategory1, selectedCategory2);
        
        if (res) {
          // 입력 초기화
          setInputText("");
          setSelectedCategory0("");
          setSelectedCategory1("");
          setSelectedCategory2("");
          setSelectedCategoryLabel("");
          onClose();
        }
      } finally {
        // 실행 완료 후 플래그 해제
        setTimeout(() => setIsAdding(false), 100);
      }
    }
  }, [isAdding, inputText, selectedType, selectedCategory0, selectedCategory1, selectedCategory2, onAdd]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>어휘추가</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>텍스트</label>
            <input
              type="text"
              placeholder="추가할 단어나 문장을 입력하세요"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>타입</label>
            <div className={styles.typeSelector}>
              <label className={`${styles.radioLabel} ${selectedType === "word" && styles.checked}`}>
                <input
                  type="radio"
                  name="type"
                  value="word"
                  checked={selectedType === "word"}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={`${styles.radioText} ${selectedType === "word" && styles.checked}`}>단어</span>
              </label>
              <label className={`${styles.radioLabel} ${selectedType === "sentence" && styles.checked}`}>
                <input
                  type="radio"
                  name="type"
                  value="sentence"
                  checked={selectedType === "sentence"}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={`${styles.radioText} ${selectedType === "sentence" && styles.checked}`}>문장</span>
              </label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>카테고리</label>
            <div 
              className={styles.categorySelectButton}
              onClick={openCategoryModal}
            >
              <span className={styles.categorySelectText}>
                {selectedCategoryLabel || "카테고리를 선택하세요"}
              </span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={isAdding || !inputText.trim() || !selectedCategory0.trim()}
            className={styles.addSubmitButton}
          >
            {isAdding ? "추가 중..." : "추가하기"}
          </button>
          <CategorySelectModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            categories={categories}
            onSelect={handleCategorySelect}
            recommendCategories={recommendCategories}
          />
        </div>
      </div>
    </div>
  )
}

export function ConversationCard({ item, onTextClick, isNotEnd, onAdd, categories }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // TTS 기능
  const handleTTS = (e) => {
    e.stopPropagation(); 
    
    // getTTS({text: item.text})
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

      <ConversationCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item.text}
        onAdd={onAdd}
        categories={categories}
      />
    </>
  );
}

// 카테고리 아이템 컴포넌트
export function CategoryItem({
  category,
  onCategoryClick,
  onEdit,
  onDelete,
  currentPath
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // 클릭 핸들러
  const handleClick = () => {
    if (!isLongPress.current && onCategoryClick) {
      onCategoryClick(category);
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
        className={styles.categoryItem}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="material-symbols-outlined">folder</span>
        <span className={styles.categoryName}>{category.name}</span>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={category}
        onEdit={onEdit}
        onDelete={onDelete}
        currentPath={currentPath}
      />
    </>
  );
}
