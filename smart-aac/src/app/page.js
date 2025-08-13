'use client'
import styles from "./page.module.css";
import { useState } from "react";
import Body from "./body";

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

function MenuSelector({menu, onClick}) {
  return (
    <div className={styles.menuSelector}>
      <div className={`${styles.menuItem} ${menu == "bookmark" && styles.selected}`} onClick={() => onClick("bookmark")}>즐겨찾기</div>
      <div className={`${styles.menuItem} ${menu == "category" && styles.selected}`} onClick={() => onClick("category")}>카테고리</div>
      <div className={`${styles.menuItem} ${menu == "add" && styles.selected}`} onClick={() => onClick("add")}>어휘추가</div>
    </div>
  )
}

function Recommend() {
  return (
    <div className={styles.recommend}>
      {/* 추천 컨텐츠가 여기 들어갑니다 */}
    </div>
  )
}

function InputSection({openHistoryModal}) {
  return(
    <div className={styles.bottomSection}>
      <div>
        <Recommend/>
        <div className={styles.inputSection}>
          <div className={styles.inputContainer}>
            <input className={styles.textInput} placeholder="메시지를 입력하세요..."></input>
            <button className={styles.speakButton}>말하기</button>
          </div>
          <div className={styles.bottomMenu}>
            <div className={styles.menuItem}>즐겨찾기</div>
            <div className={styles.menuItem} onClick={openHistoryModal}>최근기록</div>
            <div className={styles.menuItem}>메뉴3</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [menu, setMenu] = useState("bookmark");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const openHistoryModal = () => setIsHistoryModalOpen(true);
  const closeHistoryModal = () => setIsHistoryModalOpen(false);
  const selectMenu = (menuName) => setMenu(menuName);

  /* 목업 데이터 */
  const [history, setHistory] = useState([
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
    "안녕하세요", "권구현",
  ]);

  const [bookmarkSentences, setBookmarkSentences] = useState([
    "안녕하세요",
    "권구현입니다",
    "북마크"
  ])

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <History history={history} onClick={openHistoryModal}/>
        <MenuSelector menu={menu} onClick={selectMenu}/>
      </div>
      <Body 
        menu={menu}
        bookmarkSentences={bookmarkSentences}
      />
      <InputSection
        openHistoryModal={openHistoryModal}
      />
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={closeHistoryModal} 
        history={history}
      />
    </div>
  );
}
