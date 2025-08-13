import styles from "./page.module.css";

function Bookmark({sentences}) {
  return (
    <div>
      {sentences.map((sentence, index) => {
        return (
          <div className={styles.sentenceItem}>
            <p>{sentence}</p>
            {sentences.length != index+1 && <hr/>}
          </div>
        )
      })}
    </div>
  )
}

function Category() {
  return(
    <div>

    </div>
  )
}

function Add() {
  return(
    <div>

    </div>
  )
}

export default function Body({menu, bookmarkSentences}) {

  return (
    <div className={styles.bodyContainer}>
      {menu == "bookmark" && <Bookmark sentences={bookmarkSentences}/>}
      {menu == "category" && <Category/>}
      {menu == "add" && <Add/>}
    </div>
  );
}
