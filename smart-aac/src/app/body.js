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
  orderType       // frequency, abc, default
}) {
  const [sentences, setSentences] = useState([]);
  const [originalSentences, setOriginalSentences] = useState([]);

  // list는 {text: string, category0: string, category1: string, category2: string, frequency: int} 형태
  useEffect(() => {
    const list = [];
    categories.map((cat0)=> {
      const cat0Name = cat0.name;
      cat0.subcategories.map((cat1) => {
        if (Array.isArray(cat1)) {
          cat1.map((item) => {
            if (item.bookmark) {
              list.push({
                text: item.text,
                category0: cat0Name,
                category1: '',
                category2: '',
                frequency: item.frequency || 0,
                bookmark: item.bookmark || false
              });
            }
          });
        } else {
          const cat1Name = cat1.name;
          cat1.subcategories.map((cat2) => {
            if (Array.isArray(cat2)) {
              cat2.map((item) => {
                if (item.bookmark) {
                  list.push({
                    text: item.text,
                    category0: cat0Name,
                    category1: cat1Name,
                    category2: '',
                    frequency: item.frequency || 0,
                    bookmark: item.bookmark || false
                  });
                }
              });
            } else {
              cat2.subcategories.map((item) => {
                if (item.bookmark) {
                  list.push({
                    text: item.text,
                    category0: cat0Name,
                    category1: cat1Name,
                    category2: cat2.name,
                    frequency: item.frequency || 0,
                    bookmark: item.bookmark || false
                  });
                }
              });
            }
          });
        }
      });
    });
    
    if (orderType === "frequency") {
      setSentences([...list].sort((a, b) => b.frequency - a.frequency));
    } else if (orderType === "abc") {
      setSentences([...list].sort((a, b) => a.text.localeCompare(b.text)));
    } else {
      setSentences(list);
    }
    setOriginalSentences([...list]);
  }, [categories]);

  // 정렬 변경
  useEffect(() => {
    if (orderType === "frequency") {
      setSentences([...originalSentences].sort((a, b) => b.frequency - a.frequency));
    } else if (orderType === "abc") {
      setSentences([...originalSentences].sort((a, b) => a.text.localeCompare(b.text)));
    } else {
      setSentences(originalSentences);
    }
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

function Category({categories, onTextClick, onEdit, onDelete, onBookmark}) {
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
        {(currentCategory.length > 0 && currentCategory[0].hasOwnProperty('text'))
        ? <div>
            {currentCategory.map((item, index) => {
              return (
                <TextCard 
                  key={index} 
                  item={item} 
                  isNotEnd={currentCategory.length != index+1}
                  onTextClick={onTextClick}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onBookmark={onBookmark}
                />
              )
            })}
          </div>
        : currentCategory.map((category, index) => {
          if (Array.isArray(category)) {
            return (<div key={index}>
              {category.map((item, idx)=> {
                return (
                  <TextCard 
                    key={idx} 
                    item={item} 
                    isNotEnd={category.length != idx+1}
                    onTextClick={onTextClick}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onBookmark={onBookmark}
                  />
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
        />
      )}
    </div>
  );
}
