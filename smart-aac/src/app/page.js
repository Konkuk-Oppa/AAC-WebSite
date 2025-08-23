'use client'
import styles from "./page.module.css";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Body from "./body";
import { addText, getRecommendCategory, getRecommends, updateBookmark, editText, deleteText, editCategory, deleteCategory, getTTS, addConversation, getCategories, addCategory, updateText, getConversations } from "./controller";
import { TextCard } from "./component";
import useStore from "./categoryID";

// 화면 상단 두개 보여주는 기록
function History({history, onClick}) {
  return (
    <div className={styles.history} onClick={onClick}>
      {history.length == 0 && "기록"}
      {history.slice(0, 2).map((item, index) => {
        return <div key={index}>{item.text}</div>
      })}
    </div>
  )
}

function HistoryModal({
  isOpen, 
  onClose, 
  history,
  onTextClick,
  onEdit,
  onDelete,
  onBookmark,
  onUpdate
}) {
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
            history.map((item, index) => (
              <TextCard 
                key={index} 
                item={item}
                isNotEnd={history.length != index + 1}
                onTextClick={onTextClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onBookmark={onBookmark}
                currentPath={[]}
                onUpdate={onUpdate}
              />
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

// 즐겨찾기 / 대화 / 카테고리
function MenuSelector({menu, onClick}) {
  return (
    <div className={styles.menuSelector}>
      <div className={`${styles.menuItem} ${menu === "bookmark" && styles.selected}`} onClick={() => onClick("bookmark")}>즐겨찾기</div>
      <div className={`${styles.menuItem} ${menu === "conversation" && styles.selected}`} onClick={() => onClick("conversation")}>대화</div>
      <div className={`${styles.menuItem} ${menu === "category" && styles.selected}`} onClick={() => onClick("category")}>카테고리</div>
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
function InputSection({
  openHistoryModal, 
  input, 
  onInputChange, 
  isRecommendOpen, 
  recommends, 
  openAddModal,
  orderType,
  setOrderType,
  onConversationAdd
}) {
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
            <button 
              className={styles.speakButton}
              onClick={(e) => {e.stopPropagation(); onConversationAdd(input);}}
            >
              말하기
            </button>
          </div>
          <div className={styles.bottomMenu}>
            <div className={styles.menuItem} onClick={openAddModal}>어휘추가</div>
            <div className={styles.menuItem} onClick={openHistoryModal}>최근기록</div>
            <div 
              className={styles.menuItem}
              onClick={
                orderType === "default" ? () => setOrderType("abc") : 
                orderType === "usageCount" ? () => setOrderType("default") :
                () => setOrderType("usageCount")}
            >
              {orderType === "default" ? "기본" : orderType === "usageCount" ? "빈도" : "가나다"} 정렬
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CategorySelectModal({isOpen, onClose, categories, onSelect, recommendCategories}) {
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
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "error" }); // 토스트 팝업 상태

  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "error" });
  };

  const openCategoryModal = async () => {
    if (!inputText.trim()) {
      setToast({ isVisible: true, message: "추가할 단어나 문장을 입력하세요", type: "error" });
      return;
    }
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
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
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
  const [orderType, setOrderType] = useState("default");          // 정렬 기능
  const [categories, setCategories] = useState([]); // 카테고리 목록
  const [conversation, setConversation] = useState([]);

  const debounceTimeoutRef = useRef(null);          // 너무 낮은 recommend 불러오기 방지용
  const openHistoryModal = () => setIsHistoryModalOpen(true);
  const closeHistoryModal = () => setIsHistoryModalOpen(false);
  const selectMenu = (menuName) => setMenu(menuName);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const { categoryID, setCategoryID } = useStore();

  const history = useMemo(() => {
    const allItems = [];
  
    categories.forEach(cat0 => {
      // cat0 list 처리
      if (cat0.list) {
        cat0.list.forEach(item => {
          if (item.usageCount > 0) {
            allItems.push({
              id:item.id,
              text: item.text,
              usageCount: item.usageCount,
              lastUseDate: item.lastUseDate,
              category0: cat0.name,
              category1: "",
              category2: "",
              bookmark: item.bookmark
            });
          }
        });
      }
      // cat1들 처리
      cat0.subcategories.forEach(cat1 => {
        if (cat1.list) {
          cat1.list.forEach(item => {
            if (item.usageCount > 0) {
              allItems.push({
                id:item.id,
                text: item.text,
                usageCount: item.usageCount,
                lastUseDate: item.lastUseDate,
                category0: cat0.name,
                category1: cat1.name,
                category2: "",
                bookmark: item.bookmark
              });
            }
          });
        }
      
        // cat2들 처리
        cat1.subcategories?.forEach(cat2 => {
          if (cat2.list) {
            cat2.list.forEach(item => {
              if (item.usageCount > 0) {
                allItems.push({
                  id:item.id,
                  text: item.text,
                  usageCount: item.usageCount,
                  lastUseDate: item.lastUseDate,
                  category0: cat0.name,
                  category1: cat1.name,
                  category2: cat2.name,
                  bookmark: item.bookmark
                });
              }
            });
          }
        });
      });
    });
  
    // lastUseDate 기준 내림차순 정렬
    return allItems.sort((a, b) => {
      const dateA = a.lastUseDate instanceof Date ? a.lastUseDate : new Date(a.lastUseDate || 0);
      const dateB = b.lastUseDate instanceof Date ? b.lastUseDate : new Date(b.lastUseDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [categories]);

  // (완료) 오류 팝업 표시 함수
  const showError = (message) => {
    setToast({ isVisible: true, message, type: "error" });
  };

  // (완료) 성공 팝업 표시 함수
  const showInfo = (message) => {
    setToast({ isVisible: true, message, type: "success" });
  };

  // (완료) 토스트 팝업 닫기 함수
  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "error" });
  };

  // 카테고리 편집 핸들러
  const handleCategoryEdit = async (currentPath, categoryName, newCategoryName, categoryID) => {
    try{
      // 빈 카테고리 명 검사
      if (!newCategoryName.trim()) {
        showError("카테고리명을 입력해주세요.");
        return false;
      }

      // 변경된 카테고리명 검사
      if (newCategoryName.trim() === categoryName.trim()) {
        showError("변경된 카테고리명이 없습니다.");
        return false;
      }

      const res = await editCategory(categoryID, newCategoryName);

      if (!res.success) {
        if (res.error === "중복") {
          showError("이미 존재하는 카테고리명입니다.");
        } else {
          showError("카테고리 수정에 실패했습니다.");
        }
        return false;
      }

      const level = currentPath.length;

      setCategories(prev => {
        const updatedCategories = prev.map(cat0 => {
          if (level === 0 && cat0.name === categoryName) {
            // 최상위 카테고리 편집
            return { ...cat0, name: newCategoryName };
          } else if (level === 1 && cat0.name === currentPath[0]) {
            // 두 번째 레벨 카테고리 편집
            return {
              ...cat0,
              subcategories: cat0.subcategories.map(cat1 => 
                cat1.name === categoryName ? { ...cat1, name: newCategoryName } : cat1
              )
            };
          } else if (level === 2 && cat0.name === currentPath[0]) {
            // 세 번째 레벨 카테고리 편집
            return {
              ...cat0,
              subcategories: cat0.subcategories.map(cat1 => 
                cat1.name === currentPath[1] ? {
                  ...cat1,
                  subcategories: cat1.subcategories.map(cat2 =>
                    cat2.name === categoryName ? { ...cat2, name: newCategoryName } : cat2
                  )
                } : cat1
              )
            };
          }
          return cat0;
        });
        
        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        return updatedCategories;
      });
      showInfo(`카테고리가 "${newCategoryName}"(으)로 변경되었습니다.`);
      return true; 
    } catch (error) {
      console.error("error: ", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  /**** 완료 **** 카테고리 삭제 핸들러 ****/
  const handleCategoryDelete = async (currentPath, categoryName, categoryID) => {
    try{
      const res = await deleteCategory(categoryID);

      if (!res.success) {
        showError("카테고리 삭제에 실패했습니다.");
        return false;
      }

      const level = currentPath.length;

      setCategories(prev => {
        const updatedCategories = prev.filter(cat0 => {
          if (level === 0 && cat0.name === categoryName) {
            return false; // 최상위 카테고리 삭제
          }
          return true;
        }).map(cat0 => {
          if (level === 1 && cat0.name === currentPath[0]) {
            // 두 번째 레벨 카테고리 삭제
            return {
              ...cat0,
              subcategories: cat0.subcategories.filter(cat1 => cat1.name !== categoryName)
            };
          } else if (level === 2 && cat0.name === currentPath[0]) {
            // 세 번째 레벨 카테고리 삭제
            return {
              ...cat0,
              subcategories: cat0.subcategories.map(cat1 => 
                cat1.name === currentPath[1] ? {
                  ...cat1,
                  subcategories: cat1.subcategories.filter(cat2 => cat2.name !== categoryName)
                } : cat1
              )
            };
          }
          return cat0;
        });
        
        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        return updatedCategories;
      });

      showInfo(`"${categoryName}" 카테고리가 삭제되었습니다.`);
      return true; 
    } catch (error) {
      console.error("error: ", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  // TextCard 클릭 핸들러 - input에 텍스트 설정
  const handleTextClick = async (text) => {
    setInput(text);
    const res = await getRecommends({ text });

    if (res.success) {
      setRecommends(res.data);
      setIsRecommendOpen(true);
    } else {
      showError("추천 기능에 오류가 발생했습니다.");
    }
  };

  /**** 완료 **** TextCard 수정 핸들러 ****/
  const handleTextEdit = async (textID, text, newText, cat0Name, cat1Name = "", cat2Name = "") => {
    try{
      // 빈 텍스트 검사
      if (newText.trim() === "") {
        showError("텍스트를 입력해주세요.");
        return false;
      }

      // 이전 텍스트와 동일한지 검사
      if (newText.trim() === text.trim()) {
        showError("변경된 텍스트가 없습니다.");
        return false;
      }

      const cat0ID = categoryID[cat0Name];
      const cat1ID = cat1Name ? categoryID[cat1Name] : null;
      const cat2ID = cat2Name ? categoryID[cat2Name] : null;
      const res = await editText(textID, newText, cat0ID, cat1ID, cat2ID);

      if (!res.success) {
        if (res.error === "중복") {
          showError("이미 존재하는 항목입니다.");
        } else {
          showError("수정에 실패했습니다.");
        }
        return false;
      }

      setCategories(prev => {
        const updatedCategories = prev.map(cat0 => {
          if (cat0.name === cat0Name) {
            if (cat1Name === "") {
              // category1이 ""면 cat0의 list에서 처리
              return {
                ...cat0,
                list: cat0.list ? cat0.list.map(textItem => 
                  textItem.text === text 
                    ? { ...textItem, text: newText, usageCount: 0, lastUseDate: new Date() }
                    : textItem
                ) : []
              };
            } else {
              return {
                ...cat0,
                subcategories: cat0.subcategories.map(cat1 => {
                  if (cat1.name === cat1Name) {
                    if (cat2Name === "") {
                      // category2가 ""면 cat1의 list에서 처리
                      return {
                        ...cat1,
                        list: cat1.list ? cat1.list.map(textItem => 
                          textItem.text === text 
                            ? { ...textItem, text: newText, usageCount: 0, lastUseDate: new Date() }
                            : textItem
                        ) : []
                      };
                    } else {
                      // category2가 있는 경우 cat2의 list에서 처리
                      return {
                        ...cat1,
                        subcategories: cat1.subcategories.map(cat2 => {
                          if (cat2.name === cat2Name) {
                            return {
                              ...cat2,
                              list: cat2.list ? cat2.list.map(textItem => 
                                textItem.text === text 
                                  ? { ...textItem, text: newText, usageCount: 0, lastUseDate: new Date() }
                                  : textItem
                              ) : []
                            };
                          }
                          return cat2;
                        })
                      };
                    }
                  }
                  return cat1;
                })
              };
            }
          }
          return cat0;
        });

        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        return updatedCategories;
      });

      showInfo(`"${text}"이(가) "${newText}"로 수정되었습니다.`);
      return true; 
    } catch (error) {
      console.error("error: ", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  /**** 완료 **** TextCard 삭제 핸들러 ****/
  const handleTextDelete = async (textID, text, cat0Name, cat1Name = "", cat2Name = "") => {
    try{
      const res = await deleteText(textID);

      if (!res.success) {
        showError("삭제에 실패했습니다.");
        return false;
      }

      const level = cat2Name === "" ? cat1Name === "" ? 0 : 1 : 2;

      setCategories(prev => {
        let updatedCategories;
        if (level === 0) {
          // category0의 list에서 직접 처리
          updatedCategories = prev.map(cat0 => {
            if (cat0.name === cat0Name) {
              return {
                ...cat0,
                list: cat0.list.filter(textItem => textItem.id !== textID)
              };
            }
            return cat0;
          });
        } else if (level === 1) {
          // category1의 list에서 처리
          updatedCategories = prev.map(cat0 => {
            if (cat0.name === cat0Name) {
              return {
                ...cat0,
                subcategories: cat0.subcategories.map(cat1 => {
                  if (cat1.name === cat1Name) {
                    return {
                      ...cat1,
                      list: cat1.list.filter(textItem => textItem.id !== textID)
                    };
                  }
                  return cat1;
                })
              };
            }
            return cat0;
          });
        } else if (level === 2) {
          // category2의 list에서 처리
          updatedCategories = prev.map(cat0 => {
            if (cat0.name === cat0Name) {
              return {
                ...cat0,
                subcategories: cat0.subcategories.map(cat1 => {
                  if (cat1.name === cat1Name) {
                    return {
                      ...cat1,
                      subcategories: cat1.subcategories.map(cat2 => {
                        if (cat2.name === cat2Name) {
                          return {
                            ...cat2,
                            list: cat2.list.filter(textItem => textItem.id !== textID)
                          };
                        }
                        return cat2;
                      })
                    };
                  }
                  return cat1;
                })
              };
            }
            return cat0;
          });
        }

        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        return updatedCategories;
      });

      showInfo(`"${text}"이(가) 삭제되었습니다.`);
      return true; 
    } catch (error) {
      console.error("error: ", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  /**** 완료 **** TextCard 즐겨찾기 토글 핸들러 ****/
  const handleTextBookmark = async (textID, text, cat0Name, cat1Name = "", cat2Name = "") => {
    try{
      const userID = JSON.parse(localStorage.getItem('user'));
      const res = await updateBookmark(Number(userID), textID);

      if (!res.success) {
        showError("즐겨찾기 업데이트에 실패했습니다.");
        return false;
      }

      const bookmark = res.data;

      setCategories(prev => {
        const updatedCategories = prev.map(cat0 => {
          if (cat0.name === cat0Name) {
            if (cat1Name === "") {
              // category1이 ""면 cat0의 list에서 직접 처리
              return {
                ...cat0,
                list: cat0.list ? cat0.list.map(textItem => {
                  if (textItem.text === text) {
                    return { ...textItem, bookmark: bookmark };
                  }
                  return textItem;
                }) : []
              };
            } else {
              // category1이 있는 경우
              return {
                ...cat0,
                subcategories: cat0.subcategories.map(cat1 => {
                  if (cat1.name === cat1Name) {
                    if (cat2Name === "") {
                      // category2가 ""면 cat1의 list에서 처리
                      return {
                        ...cat1,
                        list: cat1.list ? cat1.list.map(textItem => {
                          if (textItem.text === text) {
                            return { ...textItem, bookmark: bookmark };
                          }
                          return textItem;
                        }) : []
                      };
                    } else {
                      // category2가 있는 경우
                      return {
                        ...cat1,
                        subcategories: cat1.subcategories.map(cat2 => {
                          if (cat2.name === cat2Name) {
                            return {
                              ...cat2,
                              list: cat2.list ? cat2.list.map(textItem => {
                                if (textItem.text === text) {
                                  return { ...textItem, bookmark: bookmark };
                                }
                                return textItem;
                              }) : []
                            };
                          }
                          return cat2;
                        })
                      };
                    }
                  }
                  return cat1;
                })
              };
            }
          }
          return cat0;
        });
        
        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        return updatedCategories;
      });

      showInfo(`"${text}"의 즐겨찾기가 ${bookmark ? "추가" : "해제"}되었습니다.`);
      return true; 
    } catch (error) {
      console.error("error: ", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  /**** 완료 **** 카테고리에 새 단어/문장 추가하는 함수 ****/
  const handleTextAdd = async (text, type, cat0Name, cat1Name = "", cat2Name = "") => {
    try {
      const newCatNames = [];
  
      if (!categoryID?.[cat0Name]) newCatNames.push(cat0Name);
      if (cat1Name && !categoryID?.[cat1Name]) newCatNames.push(cat1Name);
      if (cat2Name && !categoryID?.[cat2Name]) newCatNames.push(cat2Name);

      if (newCatNames.length > 0) {
        const res = await addCategory({ catNames: newCatNames });
        if (!res.success) {
          showError("카테고리 추가에 실패했습니다.");
          return false;
        }

        for (const catName in res.data) {
          categoryID[catName] = res.data[catName];
        }
      }

      const cat0ID = categoryID[cat0Name];
      const cat1ID = cat1Name ? categoryID[cat1Name] : null;
      const cat2ID = cat2Name ? categoryID[cat2Name] : null;

      const textRes = await addText(text, type, cat0ID, cat1ID, cat2ID);
      if (!textRes.success) {
        if (textRes.error === "이미 존재") showError("이미 존재하는 어휘입니다.");
        else showError("어휘가 추가되지 않았습니다.");
        return false;
      }
      const textID = textRes.data.id;
      
      setCategories(prevCats => {
        const newCats = JSON.parse(JSON.stringify(prevCats));
        const newText = { id: textID, text, bookmark: false, usageCount: 0, lastUseDate: null };

        let cat0 = newCats.find(cat => cat.id === cat0ID);
        if (!cat0) {
          cat0 = { id: cat0ID, name: cat0Name, subcategories: [], list: [] };
          newCats.push(cat0);
        }

        // 1차 하위 카테고리에 추가
        if (cat1ID === null) {
          cat0.list.push(newText);
        } else {
          let cat1 = cat0.subcategories.find(cat => cat.id === cat1ID);
          if (!cat1) {
            cat1 = { id: cat1ID, name: cat1Name, subcategories: [], list: [] };
            cat0.subcategories.push(cat1);
          }

          // 2차 하위 카테고리에 추가
          if (cat2ID === null) {
            cat1.list.push(newText);
          } else {
            let cat2 = cat1.subcategories.find(cat => cat.id === cat2ID);
            if (!cat2) {
              cat2 = { id: cat2ID, name: cat2Name, list: [] };
              cat1.subcategories.push(cat2);
            }
            cat2.list.push(newText);
          }
        }
        
        // 최종적으로 계산된 새로운 상태를 로컬 스토리지에 저장하고 반환
        localStorage.setItem("categories", JSON.stringify(newCats));
        return newCats;
      });

      showInfo("어휘가 추가되었습니다.");
      return true; // 성공적으로 모든 작업 완료

    } catch (error) {
      console.error("An error occurred in handleTextAdd:", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  const handleTextUpdate = async (textID, cat0Name, cat1Name = "", cat2Name = "") => {
    try {
      const userID = JSON.parse(localStorage.getItem('user'));
      const res = await updateText(userID, textID);

      if (!res.success) {
        showError("업데이트에 실패했습니다.");
        return false;
      }

      setCategories(prev => {
        const updatedCategories = prev.map(cat0 => {
          if (cat0.name === cat0Name) {
            if (cat1Name === "") {
              // category1이 ""면 cat0의 list에서 직접 처리
              return {
                ...cat0,
                list: cat0.list ? cat0.list.map(textItem => 
                  textItem.id === textID ? { ...textItem, usageCount: textItem.usageCount + 1, lastUseDate: new Date() } : textItem
                ) : []
              };
            } else {
              return {
                ...cat0,
                subcategories: cat0.subcategories.map(cat1 => {
                  if (cat1.name === cat1Name) {
                    if (cat2Name === "") {
                      // category2가 ""면 cat1의 list에서 처리
                      return {
                        ...cat1,
                        list: cat1.list ? cat1.list.map(textItem => 
                          textItem.id === textID ? { ...textItem, usageCount: textItem.usageCount + 1, lastUseDate: new Date() } : textItem
                        ) : []
                      };
                    } else {
                      // category2가 있는 경우 cat2의 list에서 처리
                      return {
                        ...cat1,
                        subcategories: cat1.subcategories.map(cat2 => {
                          if (cat2.name === cat2Name) {
                            return {
                              ...cat2,
                              list: cat2.list ? cat2.list.map(textItem => 
                                textItem.id === textID ? { ...textItem, usageCount: textItem.usageCount + 1, lastUseDate: new Date() } : textItem
                              ) : []
                            };
                          }
                          return cat2;
                        })
                      };
                    }
                  }
                  return cat1;
                })
              };
            }
          }
          return cat0;
        });

        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        return updatedCategories;
      });

      return true; 
    } catch (error) {
      console.error("error: ", error);
      showError("작업 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 유저가 타이핑 한 후 0.2초 후 추천 목록 불러오기
  const handleInputChange = (newInput) => {
    setInput(newInput);
    
    // 기존 타이머가 있으면 취소
    if (debounceTimeoutRef.current) 
      clearTimeout(debounceTimeoutRef.current);
    
    // 새로운 타이머 설정 (0.2초 후 실행)
    debounceTimeoutRef.current = setTimeout(async () => {
      if (newInput.trim()) { 
        const res = await getRecommends({ text: newInput });
        
        if (res.success) {
          setRecommends(res.data);
          setIsRecommendOpen(true);
        } else {
          showError("추천 기능에 오류가 발생했습니다.");
        }
      }
    }, 200);
  };

  const handleConversationAdd = async (text) => {
    try{
      const res = await addConversation(Number(JSON.parse(localStorage.getItem('user'))), text);
      if (!res.success) {
        showError("대화 추가에 실패했습니다.");
        return;
      }
    } catch(error) {
      console.error("대화 추가 중 오류 발생:", error);
    }

    setConversation(prev => {
      if (prev.some(item => item.value === text)) {
        return prev.map(item => item.value === text ? { ...item, lastUseDate: new Date(), usageCount: item.usageCount + 1 } : item);
      }
      return [...prev, { value: text, lastUseDate: new Date(), usageCount: 1 }];
    });

    // getTTS({text: text});
    // TODO 더 자연스러운 TTS 구현하기
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR'; // 한국어 설정
      utterance.rate = 0.8; // 속도 조절
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    async function fetchCategories() {
      const res = await getCategories(Number(JSON.parse(localStorage.getItem('user'))));
      
      if (!res.success) {
        showError("카테고리 불러오기 실패");
        return;
      }

      setCategories(res.data);
      res.data.forEach(cat0 => {
        setCategoryID(cat0.name, cat0.id);
        cat0.subcategories.forEach(cat1 => {
          setCategoryID(cat1.name, cat1.id);
          cat1.subcategories.forEach(cat2 => {
            setCategoryID(cat2.name, cat2.id);
          });
        });
      });
    }

    async function fetchConversation() {
      const res = await getConversations();
      
      if (!res.success) {
        showError("대화 기록 불러오기 실패");
        return;
      }

      res.data.sort((a, b) => new Date(b.lastUseDate) - new Date(a.lastUseDate));
      setConversation(res.data);
    }

    fetchCategories();
    fetchConversation();

    // 여기에 사용자 어휘들 불러오는 컨트롤러
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
        onCategoryEdit={handleCategoryEdit}
        onCategoryDelete={handleCategoryDelete}
        orderType={orderType}
        conversation={conversation}
        onAdd={handleTextAdd}
        onUpdate={handleTextUpdate}
        onConversationAdd={handleConversationAdd}
      />
      <InputSection
        openHistoryModal={openHistoryModal}
        openAddModal={openAddModal}
        input={input}
        onInputChange={handleInputChange}
        isRecommendOpen={isRecommendOpen}
        recommends={recommends}
        orderType={orderType}
        setOrderType={setOrderType}
        onConversationAdd={handleConversationAdd}
      />
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={closeHistoryModal} 
        history={history}
        onTextClick={handleTextClick}
        onDelete={handleTextDelete}
        onBookmark={handleTextBookmark}
        onEdit={handleTextEdit}
        onUpdate={handleTextUpdate}
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
