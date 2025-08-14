import { getRecommendCategory } from "./controller";
import styles from "./page.module.css";
import { useState, useEffect, useCallback } from "react";

function Bookmark({sentences}) {
  return (
    <div>
      {sentences.map((sentence, index) => {
        return (
          <div key={index} className={styles.sentenceItem}>
            <p>{sentence}</p>
            {sentences.length != index+1 && <hr/>}
          </div>
        )
      })}
    </div>
  )
}

function Category({categories}) {
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(categories);

  // 카테고리 클릭 시 하위 카테고리로 이동
  const handleCategoryClick = (category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setCurrentPath([...currentPath, category.name]);
      setCurrentCategory(category.subcategories);
    } 
  };

  // 경로 클릭 시 해당 카테고리로 이동
  const handlePathClick = (index) => {    
    if (index === -1) {
      // 루트 카테고리로 이동
      setCurrentPath([]);
      setCurrentCategory(categories);
    } else {
      // 특정 경로로 이동
      const newPath = currentPath.slice(0, index + 1);
      setCurrentPath(newPath);
      
      // 해당 경로의 카테고리 찾기
      let targetCategory = categories;
      for (let i = 0; i <= index; i++) {
        const categoryName = newPath[i];
        targetCategory = targetCategory.find(cat => cat.name === categoryName)?.subcategories || [];
      }
      setCurrentCategory(targetCategory);
    }
  };

  return(
    <div className={styles.categoryContainer}>
      <div className={styles.categoryPath}>
        <span 
          className={styles.pathItem} 
          onClick={() => handlePathClick(-1)}
        >
          카테고리
        </span>
        {currentPath.map((pathName, index) => (
          <span key={index}>
            <span className={styles.pathSeparator}> &gt; </span>
            <span 
              className={styles.pathItem}
              onClick={() => handlePathClick(index)}
            >
              {pathName}
            </span>
          </span>
        ))}
      </div>
      {/* 카테고리 */}
      <div className={styles.categoryList}>
        {(currentCategory.length > 0 && typeof currentCategory[0] == 'string')
        ? <div>
            {currentCategory.map((sentence, index) => {
              return (<div
                  key={index}
                  className={styles.sentenceItem}
                >
                  <p>{sentence}</p>
                  {currentCategory.length != index+1 && <hr/>}
                </div>
              )
            })}
          </div>
        : currentCategory.map((category, index) => {
          if (Array.isArray(category)) {
            return (<div key={index}>
              {category.map((sentence, idx)=> {
                return (<div
                    key={idx}
                    className={styles.sentenceItem}
                  >
                    <p>{sentence}</p>
                    {category.length != idx+1 && <hr/>}
                  </div>
                )
              })}
            </div>)
          } else {
            return (<div 
                key={"category"+index} 
                className={styles.categoryItem}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="material-symbols-outlined">folder</span>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            )
          }
        })}
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

function Add({categories, addToCategory}) {
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
        const res = await addToCategory(inputText, selectedType, selectedCategory0, selectedCategory1, selectedCategory2);
        
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
      }
    }
  }, [isAdding, inputText, selectedType, selectedCategory0, selectedCategory1, selectedCategory2, addToCategory]);

  return(
    <div className={styles.addContainer}>
      <div className={styles.addForm}>
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
      </div>

      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelect={handleCategorySelect}
        recommendCategories={recommendCategories}
      />
    </div>
  )
}

export default function Body({menu, bookmarkSentences, categories, addToCategory}) {
  return (
    <div className={styles.bodyContainer}>
      {menu == "bookmark" && <Bookmark sentences={bookmarkSentences}/>}
      {menu == "category" && <Category categories={categories}/>}
      {menu == "add" && <Add categories={categories} addToCategory={addToCategory}/>}
    </div>
  );
}
