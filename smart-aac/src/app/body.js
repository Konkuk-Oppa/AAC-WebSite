import { ConversationCard, TextCard } from "./component";
import { getRecommendCategory } from "./controller";
import styles from "./page.module.css";
import { useState, useEffect, useCallback } from "react";


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

function Conversation({conversation, onTextClick}) {
  return (
    <div>
      {conversation.map((item, index) => (
        <ConversationCard 
          key={index} 
          item={item} 
          onTextClick={onTextClick}
          isNotEnd={conversation.length != index+1}
        />
      ))}
    </div>
  )
}

function Category({categories, onTextClick, onEdit, onDelete, onBookmark, orderType}) {
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
    if (category.subcategories && category.subcategories.length > 0) {
      setCurrentPath([...currentPath, category.name]);
      setCurrentCategory(category.subcategories);

      setOriginalCurrentList(category.list);
      setOrder(category.list);
    } 
  };

  // (완성) 경로 클릭 시 해당 카테고리로 이동
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

  useEffect(() => {
    setOrder(originalCurrentList);
  }, [orderType, categories]);

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
            <div key={index} className={styles.categoryItem} onClick={() => handleCategoryClick(category)}>
              <span className="material-symbols-outlined">folder</span>
              <span className={styles.categoryName}>{category.name}</span>
            </div>
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
  orderType,
  conversation
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
          onTextClick={onTextClick} 
        />
      )}
      {menu === "category" && (
        <Category 
          categories={categories}
          onTextClick={onTextClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onBookmark={onBookmark}
          orderType={orderType}
        />
      )}
    </div>
  );
}
