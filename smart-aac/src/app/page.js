'use client'
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import Body from "./body";
import { addText, getRecommends } from "./controller";

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
function InputSection({openHistoryModal, input, onInputChange, isRecommendOpen, recommends}) {
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
  const [menu, setMenu] = useState("bookmark");     // 현재 선택된 메뉴
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);  // 최근 기록 모달창 열림 여부
  const [input, setInput] = useState("");           // input태그의 내용
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);  // recommend창 열림 여부
  const [recommends, setRecommends] = useState([]);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "error" }); // 토스트 팝업 상태
  const debounceTimeoutRef = useRef(null);          // 너무 낮은 recommend 불러오기 방지용
  const addingRef = useRef(false);                  // 추가 중 여부 체크용

  const openHistoryModal = () => setIsHistoryModalOpen(true);
  const closeHistoryModal = () => setIsHistoryModalOpen(false);
  const selectMenu = (menuName) => setMenu(menuName);

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

  // 카테고리에 새 단어/문장 추가하는 함수
  const addToCategory = async (text, type, cat0Name, cat1Name = "", cat2Name = "") => {
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
              return cat1.includes(text);
            } else if (cat1.name === cat1Name) {
              return cat1.subcategories.some(cat2 => {
                if (Array.isArray(cat2) && cat2Name === "") {
                  return cat2.includes(text);
                } else if (cat2.name === cat2Name) {
                  return cat2.subcategories[0].includes(text);
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
        if (cat1ArrIndex === -1) cat1s.push([text])
        // 배열이 있는 경우
        else cat1s[cat1ArrIndex] = [...cat1s[cat1ArrIndex], text];
        
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
        if (cat2ArrIndex === -1) cat2s.push([text])
        // 배열이 있는 경우
        else cat2s[cat2ArrIndex] = [...cat2s[cat2ArrIndex], text];

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
      const cat2TextIndex = cat2.subcategories.findIndex(arr => Array.isArray(arr));

      // 배열이 없는 경우
      if (cat2TextIndex === -1) cat2.subcategories.push([text])
      // 배열이 있는 경우
      else cat2.subcategories[cat2TextIndex] = [...cat2.subcategories[cat2TextIndex], text];

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

  const [bookmarkSentences, setBookmarkSentences] = useState([
    "안녕하세요",
    "권구현입니다",
    "북마크",
    "안녕하세요",
    "권구현입니다",
    "북마크",
    "안녕하세요",
    "권구현입니다",
    "북마크",
    "안녕하세요",
    "권구현입니다",
    "북마크",
    "안녕하세요",
    "권구현입니다",
    "북마크",
    "안녕하세요",
    "권구현입니다",
    "북마크",
  ])

  const [categories, setCategories] = useState([
    {
      name: "인사",
      subcategories: [
        {
          name: "안녕",
          subcategories: [
            { name: "안녕하세요", subcategories: ["안녕하세요", "반갑습니다"] },
            { name: "안녕히 가세요", subcategories: ["안녕히 가세요", "다음에 봐요"] },
            ["안녕", "하이", "헬로우"]
          ]
        },
        {
          name: "감사",
          subcategories: [
            { name: "고맙습니다", subcategories: ["고맙습니다", "감사해요"] },
            { name: "죄송합니다", subcategories: ["죄송합니다", "미안해요"] },
            ["빠른 감사", "정말 감사합니다"]
          ]
        },
        ["빠른 인사", "안녕"]
      ],
    },
    {
      name: "음식",
      subcategories: [
        {
          name: "한식",
          subcategories: [
            { name: "밥류", subcategories: [["밥 주세요", "비빔밥 주세요"]] },
            { name: "국물", subcategories: [["김치찌개 주세요", "된장찌개 주세요"]] }
          ]
        },
        {
          name: "양식",
          subcategories: [
            { name: "파스타", subcategories: [["스파게티 주세요", "카르보나라 주세요"]] },
            { name: "피자", subcategories: [["피자 주세요", "치즈피자 주세요"]] }
          ]
        },
        ["음식 주문", "메뉴 추천해주세요"]
      ],
    },
    {
      name: "일상",
      subcategories: [
        {
          name: "병원",
          subcategories: [
            { name: "증상", subcategories: [["아파요", "열이 나요", "머리가 아파요"]] },
            { name: "예약", subcategories: [["예약하고 싶어요", "진료 받고 싶어요"]] },
            ["괜찮아요", "별일 아니에요"]
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
        bookmarkSentences={bookmarkSentences}
        categories={categories}
        addToCategory={addToCategory}
      />
      <InputSection
        openHistoryModal={openHistoryModal}
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
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}
