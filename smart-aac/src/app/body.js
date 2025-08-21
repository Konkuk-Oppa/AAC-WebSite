import { ConversationCard, TextCard, CategoryItem } from "./component";
import styles from "./page.module.css";
import { useState, useEffect } from "react";


function Bookmark({
  categories, 
  onTextClick, 
  onEdit, 
  onDelete, 
  onBookmark,
  orderType       // usageCount, abc, default
}) {
  const [sentences, setSentences] = useState([]);
  const [originalSentences, setOriginalSentences] = useState([]);

  const setOrder = (list) => {
    if (orderType === "usageCount") {
      setSentences([...list].sort((a, b) => b.usageCount - a.usageCount) || []);
    } else if (orderType === "abc") {
      setSentences([...list].sort((a, b) => a.text.localeCompare(b.text)) || []);
    } else {
      setSentences([...list] || []);
    }
  }

  // list는 {text: string, category0: string, category1: string, category2: string, usageCount: int} 형태
  useEffect(() => {
    const list = [];
    categories.map((cat0)=> {
      cat0.subcategories.map((cat1) => {
        cat1.subcategories.map((cat2) => {
          cat2.list.map((item) => {
            if (item.bookmark) {
              list.push({
                text: item.text,
                category0: cat0.name,
                category1: cat1.name,
                category2: cat2.name,
                usageCount: item.usageCount || 0,
                bookmark: item.bookmark
              });
            }
          });
        });
        if (!cat1.list) return;
        cat1.list.map((item) => {
          if (item.bookmark) {
            list.push({
              text: item.text,
              category0: cat0.name,
              category1: cat1.name,
              category2: '',
              usageCount: item.usageCount || 0,
              bookmark: item.bookmark
            });
          }
        });
      });
      if (!cat0.list) return;
      cat0.list.map((item) => {
        if (item.bookmark) {
          list.push({
            text: item.text,
            category0: cat0.name,
            category1: '',
            category2: '',
            usageCount: item.usageCount || 0,
            bookmark: item.bookmark
          });
        }
      });
    });
    
    setOrder(list);
    setOriginalSentences(list);
  }, [categories]);

  // 정렬 변경
  useEffect(() => {
    setOrder(originalSentences);
  }, [orderType, originalSentences]);

  return (
    <div>
      {sentences.map((item, index) => {
        return (
          <TextCard
            key={index}
            item={item}
            isNotEnd={sentences.length != index+1}
            onTextClick={onTextClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onBookmark={onBookmark}
            currentPath={[]}
            categories={categories}
          />
        )
      })}
    </div>
  )
}

function Conversation({conversation, onTextClick, onAdd, categories, orderType}) {
  const [currentList, setCurrentList] = useState(conversation);
  const setOrder = (list) => {
    if (orderType === "usageCount") {
      setCurrentList([...list].sort((a, b) => b.usageCount - a.usageCount) || []);
    } else if (orderType === "abc") {
      setCurrentList([...list].sort((a, b) => a.text.localeCompare(b.text)) || []);
    } else {
      setCurrentList([...list].sort((a, b) => b.lastUseDate - a.lastUseDate) || []);
    }
  }

  useEffect(() => {
    setOrder(conversation);
  }, [orderType]);

  useEffect(() => {
    setOrder(conversation);
  }, [conversation]);

  return (
    <div>
      {currentList.map((item, index) => (
        <ConversationCard 
          key={index} 
          item={item} 
          onTextClick={onTextClick}
          isNotEnd={currentList.length != index+1}
          onAdd={onAdd}
          categories={categories}
        />
      ))}
    </div>
  )
}

function Category({categories, onTextClick, onEdit, onDelete, onBookmark, onCategoryEdit, onCategoryDelete, orderType}) {
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(categories);
  const [currentList, setCurrentList] = useState([]);
  const [originalCurrentList, setOriginalCurrentList] = useState([]);

  const setOrder = (list) => {
    if (orderType === "usageCount") {
      setCurrentList([...list].sort((a, b) => b.usageCount - a.usageCount) || []);
    } else if (orderType === "abc") {
      setCurrentList([...list].sort((a, b) => a.text.localeCompare(b.text)) || []);
    } else {
      setCurrentList([...list] || []);
    }
  }

  // (완성) 카테고리 클릭 시 하위 카테고리로 이동
  const handleCategoryClick = (category) => {
    setCurrentPath([...currentPath, category.name]);
    setOriginalCurrentList(category.list || []);
    setOrder(category.list || []);

    if (category.subcategories && category.subcategories.length > 0) {
      setCurrentCategory(category.subcategories);
    } else {
      setCurrentCategory([]);
    }
  };

  // (완성) 경로 클릭 시 해당 카테고리로 이동
  const handlePathClick = (index) => {    
    if (index === -1) {
      // 루트 카테고리로 이동
      setCurrentPath([]);
      setCurrentCategory(categories);
      setOriginalCurrentList([]);
      setOrder([]);
    } else {
      // 특정 경로로 이동
      const newPath = currentPath.slice(0, index + 1);
      setCurrentPath(newPath);
      
      // 해당 경로의 카테고리와 list 찾기
      let targetCategory = categories;
      let currentCat = null;
      
      for (let i = 0; i <= index; i++) {
        const categoryName = newPath[i];
        currentCat = targetCategory.find(cat => cat.name === categoryName);
        if (currentCat && currentCat.subcategories) {
          targetCategory = currentCat.subcategories;
        }
      }
      
      setCurrentCategory(targetCategory);
      
      // 현재 카테고리의 list 설정
      if (currentCat && currentCat.list) {
        setOriginalCurrentList(currentCat.list);
        setOrder(currentCat.list);
      } else {
        setOriginalCurrentList([]);
        setOrder([]);
      }
    }
  };

  useEffect(() => {
    setOrder(originalCurrentList);
  }, [orderType]);

  // categories가 변경될 때 현재 경로를 기준으로 카테고리 상태 재설정
  useEffect(() => {
    if (currentPath.length === 0) {
      setCurrentCategory(categories);
      setOriginalCurrentList([]);
      setOrder([]);
    } else {
      // 현재 경로를 기준으로 올바른 카테고리와 list 찾기
      let targetCategory = categories;
      let currentCat = null;
      
      for (let i = 0; i < currentPath.length; i++) {
        const categoryName = currentPath[i];
        currentCat = targetCategory.find(cat => cat.name === categoryName);
        if (currentCat) {
          if (i === currentPath.length - 1) {
            // 마지막 경로인 경우
            if (currentCat.subcategories && currentCat.subcategories.length > 0) {
              setCurrentCategory(currentCat.subcategories);
            } else {
              setCurrentCategory([]);
            }
            setOriginalCurrentList(currentCat.list || []);
            setOrder(currentCat.list || []);
          } else {
            // 중간 경로인 경우
            targetCategory = currentCat.subcategories || [];
          }
        } else {
          // 경로가 유효하지 않은 경우 루트로 돌아가기
          setCurrentPath([]);
          setCurrentCategory(categories);
          setOriginalCurrentList([]);
          setOrder([]);
          break;
        }
      }
    }
  }, [categories]);

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
        {currentCategory.map((category, index) => {
          return (
            <CategoryItem
              key={index}
              category={category}
              onCategoryClick={handleCategoryClick}
              onEdit={onCategoryEdit}
              onDelete={onCategoryDelete}
              currentPath={currentPath}
            />
          )
        })}
        {currentList.map((item, index) => {
          return (
            <TextCard 
              key={index} 
              item={item} 
              isNotEnd={currentList.length != index+1}
              onTextClick={onTextClick}
              onEdit={onEdit}
              onDelete={onDelete}
              onBookmark={onBookmark}
              currentPath={currentPath}
              categories={categories}
            />
          )
        })}
      </div>
    </div>
  )
}


export default function Body({
  menu, 
  categories, 
  onTextClick, 
  onEdit, 
  onDelete, 
  onBookmark,
  onCategoryEdit,
  onCategoryDelete,
  orderType,
  conversation,
  onAdd
}) {
  return (
    <div className={styles.bodyContainer}>
      {menu === "bookmark" && (
        <Bookmark 
          categories={categories}
          onTextClick={onTextClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onBookmark={onBookmark}
          orderType={orderType}
        />
      )}
      {menu === "conversation" && (
        <Conversation 
          conversation={conversation}
          onAdd={onAdd}
          onTextClick={onTextClick} 
          categories={categories}
          orderType={orderType}
        />
      )}
      {menu === "category" && (
        <Category 
          categories={categories}
          onTextClick={onTextClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onBookmark={onBookmark}
          onCategoryEdit={onCategoryEdit}
          onCategoryDelete={onCategoryDelete}
          orderType={orderType}
        />
      )}
    </div>
  );
}
