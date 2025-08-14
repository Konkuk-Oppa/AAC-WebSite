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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  if (!isOpen) return null;

  // 카테고리 옵션 생성
  const getCategoryOptions = () => {
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

  // 서브카테고리 옵션 생성
  const getSubcategoryOptions = () => {
    if (!selectedCategory) return [];
    
    const category = categories.find(cat => cat.name === selectedCategory);
    if (!category) return [];

    const options = [];
    category.subcategories.forEach((subcat, index) => {
      if (Array.isArray(subcat)) {
        options.push({
          value: `array_${index}`,
          label: `문장 그룹 ${index + 1}`
        });
      } else {
        options.push({
          value: subcat.name,
          label: subcat.name
        });
      }
    });
    return options;
  };

  // 카테고리 선택
  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    setSelectedSubcategory(""); // 카테고리 변경시 서브카테고리 초기화
  };

  // 서브카테고리 선택
  const handleSubcategorySelect = (value) => {
    setSelectedSubcategory(value);
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    const categoryToUse = isNewCategory ? newCategoryName : selectedCategory;
    onSelect(categoryToUse, selectedSubcategory, isNewCategory);
    
    // 초기화
    setSelectedCategory("");
    setSelectedSubcategory("");
    setIsNewCategory(false);
    setNewCategoryName("");
    onClose();
  };

  // 새 카테고리 토글
  const toggleNewCategory = () => {
    setIsNewCategory(!isNewCategory);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setNewCategoryName("");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.categoryModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>카테고리 선택</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.categoryModalBody}>
          <div className={styles.formGroup}>
            <div className={styles.categoryToggle}>
              <button
                type="button"
                onClick={toggleNewCategory}
                className={`${styles.toggleButton} ${isNewCategory ? styles.active : ''}`}
              >
                {isNewCategory ? "기존 카테고리 선택" : "새 카테고리 만들기"}
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>추천 카테고리</label>
            
          </div>

          {isNewCategory ? (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>새 카테고리 이름</label>
              <input
                type="text"
                placeholder="새 카테고리 이름을 입력하세요"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={styles.formInput}
              />
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>카테고리</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className={styles.formInput}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {getCategoryOptions().map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 서브카테고리 선택 */}
              {selectedCategory && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>세부 카테고리 (선택사항)</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => handleSubcategorySelect(e.target.value)}
                    className={styles.formInput}
                  >
                    <option value="">세부 카테고리를 선택하세요</option>
                    {getSubcategoryOptions().map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
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
              disabled={!selectedCategory && !newCategoryName.trim()}
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
  const [selectedType, setSelectedType] = useState("word"); // word or sentence
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // 중복 실행 방지
  const [recommendCategories, setRecommendCategories] = useState([]);

  const openCategoryModal = async () => {
    setIsCategoryModalOpen(true);

    // 추가할 단어 및 문장의 추천 카테고리 가져오기
    const res = await getRecommendCategory(text=inputText);
    
    if (res.success) {
      setRecommendCategories(res.data);
    } 
  }

  // 카테고리 선택 완료
  const handleCategorySelect = (category, subcategory, isNew) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    
    // 표시용 라벨 설정
    let label = category;
    if (subcategory && !isNew) {
      const subcategoryOption = getSubcategoryOptions(category).find(opt => opt.value === subcategory);
      if (subcategoryOption) {
        label += ` > ${subcategoryOption.label}`;
      }
    }
    setSelectedCategoryLabel(label);
  };

  // 서브카테고리 옵션 생성 (라벨 표시용)
  const getSubcategoryOptions = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return [];

    const options = [];
    category.subcategories.forEach((subcat, index) => {
      if (Array.isArray(subcat)) {
        options.push({
          value: `array_${index}`,
          label: `문장 그룹 ${index + 1}`
        });
      } else {
        options.push({
          value: subcat.name,
          label: subcat.name
        });
      }
    });
    return options;
  };

  // 추가 버튼 클릭
  const handleAdd = useCallback(() => {
    if (isAdding) return; // 이미 실행 중이면 리턴
    
    if (inputText.trim() && selectedCategory.trim()) {
      setIsAdding(true); // 실행 중 표시
      
      try {
        // 실제 카테고리에 추가
        addToCategory(inputText, selectedType, selectedCategory, selectedSubcategory);
        
        // 입력 초기화
        setInputText("");
        setSelectedCategory("");
        setSelectedSubcategory("");
        setSelectedCategoryLabel("");
      } finally {
        // 실행 완료 후 플래그 해제 (약간의 딜레이 추가)
        setTimeout(() => setIsAdding(false), 100);
      }
    }
  }, [isAdding, inputText, selectedType, selectedCategory, selectedSubcategory, addToCategory]);

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
          disabled={isAdding || !inputText.trim() || !selectedCategory.trim()}
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
