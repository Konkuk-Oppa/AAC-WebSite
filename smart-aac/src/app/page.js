'use client'
import styles from "./page.module.css";
import { useState, useEffect, useRef, useCallback } from "react";
import Body from "./body";
import { addText, getRecommendCategory, getRecommends } from "./controller";

// 화면 상단 두개 보여주는 기록
function History({history, onClick}) {
  return (
    <div className={styles.history} onClick={onClick}>
      {history.length == 0 && "기록"}
      {history.slice(-2).map((text, index) => {
        return <div key={index}>{text}</div>
      })}
    </div>
  )
}

function HistoryModal({isOpen, onClose, history}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>전체 기록</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          {history.length === 0 ? (
            <p>기록이 없습니다.</p>
          ) : (
            history.map((text, index) => (
              <div key={index} className={styles.historyModalItem}>
                {text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// 토스트 팝업 컴포넌트 (오류/성공 메시지)
function Toast({isVisible, message, type = "error", onClose}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3초 후 자동으로 사라짐
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const toastClass = type === "success" ? styles.successToast : styles.errorToast;
  const contentClass = type === "success" ? styles.successToastContent : styles.errorToastContent;
  const closeClass = type === "success" ? styles.successToastClose : styles.errorToastClose;

  return (
    <div className={toastClass}>
      <div className={contentClass}>
        <span>{message}</span>
        <button className={closeClass} onClick={onClose}>×</button>
      </div>
    </div>
  );
}

// 즐겨찾기 / 카테고리 / 어휘추가
function MenuSelector({menu, onClick}) {
  return (
    <div className={styles.menuSelector}>
      <div className={`${styles.menuItem} ${menu == "bookmark" && styles.selected}`} onClick={() => onClick("bookmark")}>즐겨찾기</div>
      <div className={`${styles.menuItem} ${menu == "category" && styles.selected}`} onClick={() => onClick("category")}>카테고리</div>
      <div className={`${styles.menuItem} ${menu == "add" && styles.selected}`} onClick={() => onClick("add")}>어휘추가</div>
    </div>
  )
}

// ai 추천 팝업
function Recommend({recommends}) {
  return (
    <div className={styles.recommend}>
      {recommends.map((recommend, index)=> {
        return <div key={index} className={styles.recommendItem}>
          <p>{recommend}</p>
          {recommends.length != index+1 && <hr/>}
        </div>
      })}
    </div>
  )
}

// ai 추천 팜업 + input + 최근 기록
function InputSection({openHistoryModal, input, onInputChange, isRecommendOpen, recommends, openAddModal}) {
  return(
    <div className={styles.bottomSection}>
      <div>
        {(isRecommendOpen && recommends.length != 0) && <Recommend recommends={recommends}/>}
        <div className={styles.inputSection}>
          <div className={styles.inputContainer}>
            <input 
              className={styles.textInput} 
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
            />
            <button className={styles.speakButton}>말하기</button>
          </div>
          <div className={styles.bottomMenu}>
            <div className={styles.menuItem} onClick={openAddModal}>어휘추가</div>
            <div className={styles.menuItem} onClick={openHistoryModal}>최근기록</div>
            <div className={styles.menuItem}>메뉴3</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategorySelectModal({isOpen, onClose, categories, onSelect, recommendCategories}) {
  const [selectedCategory0, setSelectedCategory0] = useState("");
  const [selectedCategory1, setSelectedCategory1] = useState("");
  const [selectedCategory2, setSelectedCategory2] = useState("");
  const [isNewCategory0, setIsNewCategory0] = useState(false);
  const [isNewCategory1, setIsNewCategory1] = useState(false);
  const [isNewCategory2, setIsNewCategory2] = useState(false);
  const [newCategory0Name, setNewCategory0Name] = useState("");
  const [newCategory1Name, setNewCategory1Name] = useState("");
  const [newCategory2Name, setNewCategory2Name] = useState("");

  if (!isOpen) return null;

  // 카테고리0 옵션 생성
  const getCategory0Options = () => {
    const options = [];
    categories.forEach(category => {
      options.push({
        value: category.name,
        label: category.name,
        subcategories: category.subcategories
      });
    });
    return options;
  };

  // 카테고리1 옵션 생성
  const getCategory1Options = () => {
    if (!selectedCategory0) return [];

    const cat0 = categories.find(cat => cat.name === selectedCategory0);
    if (!cat0) return [];

    const options = [];
    cat0.subcategories.forEach((subcat) => {
      if (!Array.isArray(subcat)) {
        options.push({
          value: subcat.name,
          label: subcat.name,
          subcategories: subcat.subcategories || []
        });
      }
    });
    return options;
  };

  // 카테고리2 옵션 생성
  const getCategory2Options = () => {
    if (!selectedCategory1) return [];

    const cat0 = categories.find(cat => cat.name === selectedCategory0);
    if (!cat0) return [];
    const cat1 = cat0.subcategories.find(cat => cat.name === selectedCategory1);
    if (!cat1) return [];

    const options = [];
    cat1.subcategories.forEach((sentence) => {
      if (!Array.isArray(sentence)) {
        options.push({
          value: sentence.name,
          label: sentence.name,
        });
      }
    });
    return options;
  };

  // 카테고리0 선택
  const handleCategory0Select = (value) => {
    setSelectedCategory0(value);
    setSelectedCategory1("");
    setSelectedCategory2("");
  };

  // 카테고리1 선택
  const handleSubcategory1Select = (value) => {
    setSelectedCategory1(value);
    setSelectedCategory2("");
  };

  // 카테고리2 선택
  const handleSubcategory2Select = (value) => {
    setSelectedCategory2(value);
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    const category0ToUse = isNewCategory0 ? newCategory0Name : selectedCategory0;
    const category1ToUse = isNewCategory1 ? newCategory1Name : selectedCategory1;
    const category2ToUse = isNewCategory2 ? newCategory2Name : selectedCategory2;
    
    onSelect(category0ToUse, category1ToUse, category2ToUse, {
      isNewCategory0,
      isNewCategory1,
      isNewCategory2
    });

    onClose();
  };

  // 새 카테고리0 토글
  const toggleNewCategory0 = () => {
    if (!isNewCategory0) {
      setIsNewCategory1(true);
      setIsNewCategory2(true);
    } else {
      setIsNewCategory1(false);
      setIsNewCategory2(false);
    }
    setIsNewCategory0(!isNewCategory0);
    setSelectedCategory0("");
    setSelectedCategory1("");
    setSelectedCategory2("");
    setNewCategory0Name("");
    setNewCategory1Name("");
    setNewCategory2Name("");
  };

  // 새 카테고리1 토글
  const toggleNewCategory1 = () => {
    if (!isNewCategory1) {
      setIsNewCategory2(true);
    } else {
      setIsNewCategory2(false);
    }
    setIsNewCategory1(!isNewCategory1);
    setSelectedCategory1("");
    setSelectedCategory2("");
    setNewCategory1Name("");
    setNewCategory2Name("");
  };

  // 새 카테고리2 토글
  const toggleNewCategory2 = () => {
    setIsNewCategory2(!isNewCategory2);
    setSelectedCategory2("");
    setNewCategory2Name("");
  };

  // 추천 카테고리 적용
  const setReccomendCategory = (category) => {
    setIsNewCategory0(false);
    setIsNewCategory1(false);
    setIsNewCategory2(false);
    setSelectedCategory0(category.category0);
    setSelectedCategory1(category.category1);
    setSelectedCategory2(category.category2);
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.categoryModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>카테고리 선택</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.categoryModalBody}>
          {/* 추천 카테고리 표시 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>추천 카테고리</label>
            <div className={styles.recommendCategories}>
              {recommendCategories.map((category, index) => (
                <div key={index}>
                  <div className={styles.recommendCategoryItem} onClick={()=> setReccomendCategory(category)}>
                    {category.category0} {category.category1 != "" && ">"}
                    {category.category1 != "" && category.category1} {category.category2 != "" && ">"}
                    {category.category2 != "" && category.category2}
                  </div>
                  {index < recommendCategories.length - 1 && <hr className={styles.recommendCategoryDivider} />}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.categoryHeader}>
              <label className={styles.formLabel}>카테고리</label>
              <button
                type="button"
                onClick={toggleNewCategory0}
                className={`${styles.toggleButton} ${isNewCategory0 ? styles.active : ''}`}
              >
                {isNewCategory0 ? "기존 선택" : "새로 만들기"}
              </button>
            </div>
            
            {isNewCategory0 ? (
              <input
                type="text"
                placeholder="새 메인 카테고리 이름을 입력하세요"
                value={newCategory0Name}
                onChange={(e) => setNewCategory0Name(e.target.value)}
                className={styles.formInput}
              />
            ) : (
              <select
                value={selectedCategory0}
                onChange={(e) => handleCategory0Select(e.target.value)}
                className={styles.formInput}
              >
                <option value="">메인 카테고리를 선택하세요</option>
                {getCategory0Options().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 카테고리 1 선택 (카테고리 0이 선택된 경우에만 표시) */}
          {(selectedCategory0 || newCategory0Name) && (
            <div className={styles.formGroup}>
              <div className={styles.categoryHeader}>
                <label className={styles.formLabel}>세부 카테고리 1 (선택사항)</label>
                  {!isNewCategory0 && <button
                    type="button"
                    onClick={toggleNewCategory1}
                    className={`${styles.toggleButton} ${isNewCategory1 ? styles.active : ''}`}
                  >
                    {isNewCategory1  ? "기존 선택" : "새로 만들기"}
                  </button>}
              </div>

              {isNewCategory1 ? (
                <input
                  type="text"
                  placeholder="새 서브 카테고리 이름을 입력하세요"
                  value={newCategory1Name}
                  onChange={(e) => setNewCategory1Name(e.target.value)}
                  className={styles.formInput}
                />
              ) : (
                <select
                  value={selectedCategory1}
                  onChange={(e) => handleSubcategory1Select(e.target.value)}
                  className={styles.formInput}
                  disabled={isNewCategory0}
                >
                  <option value="">서브 카테고리를 선택하세요</option>
                  {!isNewCategory0 && getCategory1Options().map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* 카테고리 2 선택 (카테고리 1이 선택된 경우에만 표시) */}
          {(selectedCategory1 || newCategory1Name) && (
            <div className={styles.formGroup}>
              <div className={styles.categoryHeader}>
                <label className={styles.formLabel}>세부 카테고리 2 (선택사항)</label>
                {!isNewCategory0 && !isNewCategory1 && (
                  <button
                    type="button"
                    onClick={toggleNewCategory2}
                    className={`${styles.toggleButton} ${isNewCategory2 ? styles.active : ''}`}
                  >
                    {isNewCategory2 ? "기존 선택" : "새로 만들기"}
                  </button>
                )}
              </div>
              
              {isNewCategory2 ? (
                <input
                  type="text"
                  placeholder="새 세부 카테고리 이름을 입력하세요"
                  value={newCategory2Name}
                  onChange={(e) => setNewCategory2Name(e.target.value)}
                  className={styles.formInput}
                />
              ) : (
                <select
                  value={selectedCategory2}
                  onChange={(e) => handleSubcategory2Select(e.target.value)}
                  className={styles.formInput}
                  disabled={isNewCategory1}
                >
                  <option value="">세부 카테고리를 선택하세요</option>
                  {!isNewCategory1 && getCategory2Options().map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              onClick={onClose}
              className={styles.cancelButton}
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={(!selectedCategory0 && !newCategory0Name.trim())}
              className={styles.confirmButton}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddModal({isOpen, onClose, categories, onAdd}) {
  if (!isOpen) return null;

  const [inputText, setInputText] = useState("");
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
        }
      } finally {
        // 실행 완료 후 플래그 해제
        setTimeout(() => setIsAdding(false), 100);
        onClose();
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

export default function Home() {
  const [menu, setMenu] = useState("bookmark");     // 현재 선택된 메뉴
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);  // 최근 기록 모달창 열림 여부
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 어휘 추가 모달창 열림 여부
  const [input, setInput] = useState("");           // input태그의 내용
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);  // recommend창 열림 여부
  const [recommends, setRecommends] = useState([]);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "error" }); // 토스트 팝업 상태
  const debounceTimeoutRef = useRef(null);          // 너무 낮은 recommend 불러오기 방지용
  const addingRef = useRef(false);                  // 추가 중 여부 체크용

  const openHistoryModal = () => setIsHistoryModalOpen(true);
  const closeHistoryModal = () => setIsHistoryModalOpen(false);
  const selectMenu = (menuName) => setMenu(menuName);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  // 오류 팝업 표시 함수
  const showError = (message) => {
    setToast({ isVisible: true, message, type: "error" });
  };

  // 성공 팝업 표시 함수
  const showInfo = (message) => {
    setToast({ isVisible: true, message, type: "success" });
  };

  // 토스트 팝업 닫기 함수
  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "error" });
  };

  // TextCard 클릭 핸들러 - input에 텍스트 설정
  const handleTextClick = (text) => {
    setInput(text);
    setIsRecommendOpen(false); // 추천창 닫기
  };

  // TextCard 수정 핸들러 TODO
  const handleTextEdit = (text) => {
    const newText = prompt("텍스트를 수정하세요:", text);
    if (newText && newText.trim() && newText !== text) {
      // 여기서 실제 수정 로직 구현 (서버 업데이트 등)
      showInfo(`"${text}"이(가) "${newText}"로 수정되었습니다.`);
      // TODO: 실제 데이터 업데이트 로직 구현 필요
    }
  };

  // TextCard 삭제 핸들러 TODO
  const handleTextDelete = (text) => {
    if (confirm(`"${text}"을(를) 정말 삭제하시겠습니까?`)) {
      // 여기서 실제 삭제 로직 구현
      showInfo(`"${text}"이(가) 삭제되었습니다.`);
      // TODO: 실제 데이터 삭제 로직 구현 필요
    }
  };

  // TextCard 즐겨찾기 토글 핸들러
  const handleTextBookmark = (item) => {
    setCategories(prev => {
      const updatedCategories = prev.map(cat0 => {
        if (cat0.name === item.category0) {
          return {
            ...cat0,
            subcategories: cat0.subcategories.map(cat1 => {
              // category1이 ""면 categories 바로 안의 리스트
              if (item.category1 === "") {
                if (Array.isArray(cat1)) {
                  return cat1.map(textItem => {
                    if (textItem.text === item.text) {
                      return { ...textItem, bookmark: !textItem.bookmark };
                    }
                    return textItem;
                  });
                }
                return cat1;
              }
              // category2가 ""면 cat1 안의 리스트
              else if (item.category2 === "") {
                if (cat1.name === item.category1) {
                  return {
                    ...cat1,
                    subcategories: cat1.subcategories.map(cat2 => {
                      if (Array.isArray(cat2)) {
                        return cat2.map(textItem => {
                          if (textItem.text === item.text) {
                            return { ...textItem, bookmark: !textItem.bookmark };
                          }
                          return textItem;
                        });
                      }
                      return cat2;
                    })
                  };
                }
                return cat1;
              }
              // category2가 있는 경우 (3단계 깊이)
              else {
                if (cat1.name === item.category1) {
                  return {
                    ...cat1,
                    subcategories: cat1.subcategories.map(cat2 => {
                      if (cat2.name === item.category2) {
                        return {
                          ...cat2,
                          subcategories: cat2.subcategories.map(textItem => {
                            if (textItem.text === item.text) {
                              return { ...textItem, bookmark: !textItem.bookmark };
                            }
                            return textItem;
                          })
                        };
                      }
                      return cat2;
                    })
                  };
                }
                return cat1;
              }
            })
          };
        }
        return cat0;
      });
      
      return updatedCategories;
    });

    // 북마크 상태 변경 메시지 표시
    setTimeout(() => {
      // categories가 업데이트된 후 실행되도록 setTimeout 사용
      setCategories(currentCategories => {
        const currentItem = currentCategories.find(cat0 => cat0.name === item.category0);
        let isCurrentlyBookmarked = false;
        
        if (item.category1 === "") {
          // cat0의 배열에서 찾기
          const arrayInCat0 = currentItem?.subcategories.find(cat1 => Array.isArray(cat1));
          const foundItem = arrayInCat0?.find(textItem => textItem.text === item.text);
          isCurrentlyBookmarked = foundItem?.bookmark || false;
        } else if (item.category2 === "") {
          // cat1의 배열에서 찾기
          const cat1 = currentItem?.subcategories.find(cat1 => cat1.name === item.category1);
          const arrayInCat1 = cat1?.subcategories.find(cat2 => Array.isArray(cat2));
          const foundItem = arrayInCat1?.find(textItem => textItem.text === item.text);
          isCurrentlyBookmarked = foundItem?.bookmark || false;
        } else {
          // cat2의 배열에서 찾기
          const cat1 = currentItem?.subcategories.find(cat1 => cat1.name === item.category1);
          const cat2 = cat1?.subcategories.find(cat2 => cat2.name === item.category2);
          const foundItem = cat2?.subcategories.find(textItem => textItem.text === item.text);
          isCurrentlyBookmarked = foundItem?.bookmark || false;
        }

        if (isCurrentlyBookmarked) {
          showInfo(`"${item.text}"이(가) 즐겨찾기에 추가되었습니다.`);
        } else {
          showInfo(`"${item.text}"이(가) 즐겨찾기에서 제거되었습니다.`);
        }
        
        return currentCategories; // 상태 변경 없이 그대로 반환
      });
    }, 0);
  };

  // 카테고리에 새 단어/문장 추가하는 함수
  const handleTextAdd = async (text, type, cat0Name, cat1Name = "", cat2Name = "") => {
    // 이미 실행 중이면 무시
    if (addingRef.current) return;
    addingRef.current = true;

    let updateSuccess = false;

    setCategories(prevCats => {
      // 중복 추가 방지 - 이미 같은 텍스트가 있는지 확인
      const isDuplicate = prevCats.some(cat0 => {
        if (cat0.name === cat0Name) {
          return cat0.subcategories.some(cat1 => {
            if (Array.isArray(cat1) && cat1Name === "") {
              return cat1.some(item => item.text === text);
            } else if (cat1.name === cat1Name) {
              return cat1.subcategories.some(cat2 => {
                if (Array.isArray(cat2) && cat2Name === "") {
                  return cat2.some(item => item.text === text);
                } else if (cat2.name === cat2Name) {
                  return cat2.subcategories.some(item => item.text === text);
                }
                return false;
              })
            }
            return false;
          });
        }
        return false;
      });
      
      if (isDuplicate) {
        showError("이미 존재하는 항목입니다.");
        addingRef.current = false; 
        return prevCats; 
      }

      const newCats = [...prevCats];
      
      // 메인 카테고리 찾기 또는 생성
      let cat0Index = newCats.findIndex(cat => cat.name === cat0Name);
      
      // 카테고리가 없으면 새로 생성
      if (cat0Index === -1) {
        newCats.push({name: cat0Name, subcategories: []});
        cat0Index = newCats.length-1;
      }

      // category1이 설정되지 않은 경우
      if (cat1Name === "") {
        const cat1s = newCats[cat0Index].subcategories;
        const cat1ArrIndex = cat1s.findIndex(cat1 => Array.isArray(cat1));
        
        // 배열이 없는 경우
        if (cat1ArrIndex === -1) cat1s.push([{text:text, bookmark:false, frequency: 0}])
        // 배열이 있는 경우
        else cat1s[cat1ArrIndex] = [...cat1s[cat1ArrIndex], {text:text, bookmark:false, frequency: 0}];

        addingRef.current = false; // 플래그 리셋
        updateSuccess = true;
        return newCats;
      }

      // category1 리스트에 추가
      const cat1s = newCats[cat0Index].subcategories;
      let cat1Index = cat1s.findIndex(cat => cat.name === cat1Name);

      // 카테고리 없으면 새로 생성
      if (cat1Index === -1) {
        const lastIndex = cat1s.length-1;
        const isLastElementArray = lastIndex >= 0 && Array.isArray(cat1s[lastIndex]);

        if (isLastElementArray) {
          // 마지막 요소가 배열이면 그 앞에 삽입
          cat1s.splice(lastIndex, 0, {name: cat1Name, subcategories: []});
          cat1Index = lastIndex;
        } else {
          // 마지막 요소가 배열이 아니면 맨 뒤에 추가
          cat1s.push({name: cat1Name, subcategories: []});
          cat1Index = cat1s.length - 1;
        }
      }

      // category2가 설정되지 않은 경우
      if (cat2Name === "") {
        const cat2s = cat1s[cat1Index].subcategories;
        const cat2ArrIndex = cat2s.findIndex(cat2 => Array.isArray(cat2));

        // 배열이 없는 경우
        if (cat2ArrIndex === -1) cat2s.push([{text:text, bookmark:false, frequency: 0}])
        // 배열이 있는 경우
        else cat2s[cat2ArrIndex] = [...cat2s[cat2ArrIndex], {text:text, bookmark:false, frequency: 0}];

        addingRef.current = false; // 플래그 리셋
        updateSuccess = true;
        return newCats;
      }

      // category2 리스트에 추가
      const cat2s = cat1s[cat1Index].subcategories;
      let cat2Index = cat2s.findIndex(cat => cat.name === cat2Name);

      // 카테고리 없으면 새로 생성
      if (cat2Index === -1) {
        const lastIndex = cat2s.length-1;
        const isLastElementArray = lastIndex >= 0 && Array.isArray(cat2s[lastIndex]);

        if (isLastElementArray) {
          // 마지막 요소가 배열이면 그 앞에 삽입
          cat2s.splice(lastIndex, 0, {name: cat2Name, subcategories: []});
          cat2Index = lastIndex;
        } else {
          // 마지막 요소가 배열이 아니면 맨 뒤에 추가
          cat2s.push({name: cat2Name, subcategories: []});
          cat2Index = cat2s.length - 1;
        }
      }

      // category2에 텍스트 추가
      const cat2 = cat2s[cat2Index];
       cat2.subcategories.push({text:text, bookmark:false, frequency: 0})

      addingRef.current = false; // 플래그 리셋
      updateSuccess = true;
      return newCats;
    });

    // 서버에 반영
    if (updateSuccess) {
      const res = await addText(text, type, cat0Name, cat1Name, cat2Name);

      if (res.success) {
        showInfo("항목 추가 성공");
        return true;
      }
      else showError("서버 업로드 실패"); 
      return false;
    }
    return false;
  };

  // 유저가 타이핑 한 후 0.2초 후 추천 목록 불러오기
  const handleInputChange = (newInput) => {
    setInput(newInput);
    
    // 기존 타이머가 있으면 취소
    console.log(debounceTimeoutRef.current);
    if (debounceTimeoutRef.current) 
      clearTimeout(debounceTimeoutRef.current);
    
    // 새로운 타이머 설정 (0.2초 후 실행)
    debounceTimeoutRef.current = setTimeout(async () => {
      if (newInput.trim()) { 
        const res = await getRecommends(newInput);
        
        if (res.success) {
          setRecommends(res.data);
          setIsRecommendOpen(true);
        } else {
          showError("추천 기능에 오류가 발생했습니다.");
        }
      }
    }, 200);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    // 여기에 사용자 어휘들 불러오는 컨트롤러
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /* 목업 데이터 */
  const [history, setHistory] = useState([
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
  ]);

  const [categories, setCategories] = useState([
    {
      name: "인사",
      subcategories: [
        {
          name: "안녕",
          subcategories: [
            { name: "안녕하세요", subcategories: [{text:"안녕하세요", bookmark:false, frequency:1}, {text: "반갑습니다", bookmark:true, frequency:2}] },
            { name: "안녕히 가세요", subcategories: [{text:"안녕히 가세요", bookmark:false, frequency:1}, {text: "다음에 봐요", bookmark:true, frequency:2}] },
            [{text:"안녕", bookmark:false, frequency:1}, {text:"하이", bookmark:true, frequency:2}, {text:"헬로우", bookmark:false, frequency:1}]
          ]
        },
        {
          name: "감사",
          subcategories: [
            { name: "고맙습니다", subcategories: [{text:"고맙습니다", bookmark:false, frequency:1}, {text: "감사해요", bookmark:true, frequency:2}] },
            { name: "죄송합니다", subcategories: [{text:"죄송합니다", bookmark:false, frequency:1}, {text: "미안해요", bookmark:true, frequency:2}] },
            [{text:"빠른 감사", bookmark:false, frequency:1}, {text:"정말 감사합니다", bookmark:true, frequency:2}]
          ]
        },
        [{text:"빠른 인사", bookmark:false, frequency:1}, {text:"안녕", bookmark:true, frequency:2}]
      ],
    },
    {
      name: "음식",
      subcategories: [
        {
          name: "한식",
          subcategories: [
            { name: "밥류", subcategories: [{text:"밥 주세요", bookmark:false, frequency:1}, {text:"비빔밥 주세요", bookmark:true, frequency:2}] },
            { name: "국물", subcategories: [{text:"김치찌개 주세요", bookmark:false, frequency:1}, {text:"된장찌개 주세요", bookmark:true, frequency:2}] }
          ]
        },
        {
          name: "양식",
          subcategories: [
            { name: "파스타", subcategories: [{text:"스파게티 주세요", bookmark:false, frequency:1}, {text:"카르보나라 주세요", bookmark:true, frequency:2}] },
            { name: "피자", subcategories: [{text:"피자 주세요", bookmark:false, frequency:1}, {text:"치즈피자 주세요", bookmark:true, frequency:2}] }
          ]
        },
        [{text:"음식 주문", bookmark:false, frequency:1}, {text:"메뉴 추천해주세요", bookmark:true, frequency:2}]
      ],
    },
    {
      name: "일상",
      subcategories: [
        {
          name: "병원",
          subcategories: [
            { name: "증상", subcategories: [{text:"아파요", bookmark:false}, {text:"열이 나요", bookmark:true}, {text:"머리가 아파요", bookmark:false}] },
            { name: "예약", subcategories: [{text:"예약하고 싶어요", bookmark:false}, {text:"진료 받고 싶어요", bookmark:true}] },
            [{text:"괜찮아요", bookmark:false}, {text:"별일 아니에요", bookmark:true}]
          ]
        }
      ]
    }
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <History history={history} onClick={openHistoryModal}/>
        <MenuSelector menu={menu} onClick={selectMenu}/>
      </div>
      <Body 
        menu={menu}
        categories={categories}
        onTextClick={handleTextClick}
        onEdit={handleTextEdit}
        onDelete={handleTextDelete}
        onBookmark={handleTextBookmark}
      />
      <InputSection
        openHistoryModal={openHistoryModal}
        openAddModal={openAddModal}
        input={input}
        onInputChange={handleInputChange}
        isRecommendOpen={isRecommendOpen}
        recommends={recommends}
      />
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={closeHistoryModal} 
        history={history}
      />
      <AddModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        categories={categories}
        onAdd={handleTextAdd}
      />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}
