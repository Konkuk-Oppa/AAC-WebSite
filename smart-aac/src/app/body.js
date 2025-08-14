import styles from "./page.module.css";
import { useState } from "react";

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
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryArrow}>→</span>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

function Add() {
  return(
    <div>

    </div>
  )
}

export default function Body({menu, bookmarkSentences, categories}) {

  return (
    <div className={styles.bodyContainer}>
      {menu == "bookmark" && <Bookmark sentences={bookmarkSentences}/>}
      {menu == "category" && <Category categories={categories}/>}
      {menu == "add" && <Add/>}
    </div>
  );
}
