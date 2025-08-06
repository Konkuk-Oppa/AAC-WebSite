// AAC 웹사이트 JavaScript

// 전역 변수
let currentInput = [];
let currentCategory = '기본';
let currentContext = null; // 현재 선택된 맥락
let contextButtons = []; // 맥락별 버튼들
let recommendationIndex = 0; // 현재 추천 인덱스

// AAC 데이터 - 카테고리별 버튼 정보
const aacData = {
    '기본': [
        { text: '안녕하세요', audio: 'hello' },
        { text: '좋아요', audio: 'like' },
        { text: '기뻐요', audio: 'happy' },
        { text: '슬퍼요', audio: 'sad' },
        { text: '화나요', audio: 'angry' },
        { text: '생각해요', audio: 'think' },
        { text: '감사해요', audio: 'thank' },
        { text: '미안해요', audio: 'sorry' },
        { text: '도와주세요', audio: 'help' },
        { text: '안녕', audio: 'you' },
        { text: '....', audio: 'rice' }
    ],
    '음식': [
        { text: '밥', audio: 'rice' },
        { text: '국수', audio: 'noodle' },
        { text: '빵', audio: 'bread' },
        { text: '우유', audio: 'milk' },
        { text: '사과', audio: 'apple' },
        { text: '바나나', audio: 'banana' },
        { text: '피자', audio: 'pizza' },
        { text: '치킨', audio: 'chicken' },
        { text: '케이크', audio: 'cake' }
    ],
    '활동': [
        { text: '뛰기', audio: 'run' },
        { text: '걷기', audio: 'walk' },
        { text: '공부하기', audio: 'study' },
        { text: '게임하기', audio: 'game' },
        { text: '음악듣기', audio: 'music' },
        { text: 'TV보기', audio: 'tv' },
        { text: '자기', audio: 'sleep' },
        { text: '씻기', audio: 'wash' },
        { text: '청소하기', audio: 'clean' }
    ],
    '사람': [
        { text: '아빠', audio: 'dad' },
        { text: '엄마', audio: 'mom' },
        { text: '형/오빠', audio: 'brother' },
        { text: '언니/누나', audio: 'sister' },
        { text: '할아버지', audio: 'grandpa' },
        { text: '할머니', audio: 'grandma' },
        { text: '선생님', audio: 'teacher' },
        { text: '의사', audio: 'doctor' },
        { text: '경찰', audio: 'police' }
    ],
    '장소': [
        { text: '집', audio: 'home' },
        { text: '학교', audio: 'school' },
        { text: '병원', audio: 'hospital' },
        { text: '마트', audio: 'mart' },
        { text: '공원', audio: 'park' },
        { text: '버스', audio: 'bus' },
        { text: '차', audio: 'car' },
        { text: '비행기', audio: 'plane' },
        { text: '기차', audio: 'train' }
    ]
};

// 페이지 로드 시 초기화
$(document).ready(function() {
    initializeAAC();
});

// AAC 초기화
function initializeAAC() {
    createCategoryButtons();
    loadCategory('기본');
    setupEventListeners();
}

// 카테고리 버튼 생성
function createCategoryButtons() {
    const categoryDiv = $('#category');
    categoryDiv.empty();
    
    Object.keys(aacData).forEach(category => {
        const button = $(`
            <button class="category-btn ${category === currentCategory ? 'active' : ''}" 
                    data-category="${category}">
                ${category}
            </button>
        `);
        
        button.click(() => loadCategory(category));
        categoryDiv.append(button);
    });
}

// 카테고리 로드
function loadCategory(category) {
    currentCategory = category;
    
    // 카테고리 버튼 활성화 상태 업데이트
    $('.category-btn').removeClass('active');
    $(`.category-btn[data-category="${category}"]`).addClass('active');
    
    // 일반 AAC 버튼만 표시 (팝업은 별도로 관리)
    createAACButtons(aacData[category]);
}

// AAC 버튼 생성
function createAACButtons(buttons) {
    const buttonsDiv = $('#buttons');
    buttonsDiv.empty();
    
    buttons.forEach(buttonData => {
        const button = $(`
            <div class="aac-btn" data-text="${buttonData.text}" data-audio="${buttonData.audio}">
                <div class="aac-btn-text">${buttonData.text}</div>
            </div>
        `);
        
        button.click(() => handleAACButtonClick(buttonData));
        buttonsDiv.append(button);
    });
}

// AAC 버튼 클릭 처리
function handleAACButtonClick(buttonData) {
    const button = $(`.aac-btn[data-text="${buttonData.text}"]`);
    
    // 클릭 애니메이션
    button.addClass('clicked');
    setTimeout(() => button.removeClass('clicked'), 600);
    
    // 텍스트 추가
    addToCurrentInput(buttonData.text);
    
    // 음성 재생 (추천 버튼이 아닌 경우에만)
    if (!buttonData.isContext) {
        playAudio(buttonData.text);
    }
    
    // 햅틱 피드백 (모바일에서)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// 현재 입력에 텍스트 추가
function addToCurrentInput(text) {
    currentInput.push(text);
    updateCurrentInputDisplay();
}

// 현재 입력 화면 업데이트
function updateCurrentInputDisplay() {
    const inputDiv = $('#current_input');
    const clearBtn = $('.clear-btn');
    
    if (currentInput.length > 0) {
        inputDiv.text(currentInput.join(' '));
        clearBtn.addClass('show');
    } else {
        inputDiv.empty();
        clearBtn.removeClass('show');
    }
}

// 입력 내용 지우기
function clearInput() {
    currentInput = [];
    updateCurrentInputDisplay();
}

// 음성 재생 (Web Speech API 사용)
function playAudio(text) {
    if ('speechSynthesis' in window) {
        // 기존 음성 중지
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        speechSynthesis.speak(utterance);
    } else {
        console.log('음성 합성을 지원하지 않는 브라우저입니다.');
    }
}

// 설정 창 열기
function openSettings() {
    alert('설정 기능은 개발 중입니다.\n\n추가 예정 기능:\n- 음성 속도 조절\n- 버튼 크기 조절\n- 사용자 정의 버튼 추가\n- 테마 변경');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 키보드 지원
    $(document).keydown(function(e) {
        switch(e.keyCode) {
            case 32: // 스페이스바 - 현재 포커스된 버튼 클릭 또는 맥락듣기
                if (document.activeElement.classList.contains('aac-btn')) {
                    e.preventDefault();
                    document.activeElement.click();
                } else {
                    e.preventDefault();
                    playContext();
                }
                break;
            case 27: // ESC - 입력 지우기 또는 추천 팝업 닫기
                if (currentContext && $('#recommendationPopup').hasClass('show')) {
                    closeRecommendationPopup();
                } else {
                    clearInput();
                }
                break;
            case 37: // 왼쪽 화살표 - 이전 카테고리
                if (!document.activeElement.classList.contains('aac-btn')) {
                    navigateCategory(-1);
                }
                break;
            case 39: // 오른쪽 화살표 - 다음 카테고리
                if (!document.activeElement.classList.contains('aac-btn')) {
                    navigateCategory(1);
                }
                break;
            case 13: // Enter - 현재 포커스된 요소 활성화
                if (document.activeElement.classList.contains('aac-btn')) {
                    e.preventDefault();
                    document.activeElement.click();
                }
                break;
        }
    });
    
    // 터치 이벤트 최적화 (모바일)
    if ('ontouchstart' in window) {
        $('body').on('touchstart', '.aac-btn', function() {
            $(this).addClass('touch-active');
        });
        
        $('body').on('touchend', '.aac-btn', function() {
            $(this).removeClass('touch-active');
        });
    }
    
    // 화면 크기 변경 감지
    $(window).resize(function() {
        adjustButtonLayout();
    });
}

// 카테고리 네비게이션
function navigateCategory(direction) {
    const categories = Object.keys(aacData);
    const currentIndex = categories.indexOf(currentCategory);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = categories.length - 1;
    if (newIndex >= categories.length) newIndex = 0;
    
    loadCategory(categories[newIndex]);
}

// 버튼 레이아웃 조정
function adjustButtonLayout() {
    const screenWidth = $(window).width();
    const buttonsContainer = $('#buttons');
    
    // 화면 크기에 따른 동적 조정
    if (screenWidth <= 480) {
        // 매우 작은 화면: 버튼 크기 축소
        buttonsContainer.addClass('compact-mode');
    } else {
        buttonsContainer.removeClass('compact-mode');
    }
}

// 사용자 정의 버튼 추가 (확장 기능)
function addCustomButton(category, text) {
    if (!aacData[category]) {
        aacData[category] = [];
    }
    
    aacData[category].push({
        text: text,
        audio: text
    });
    
    // 현재 카테고리가 업데이트된 카테고리와 같으면 새로고침
    if (currentCategory === category) {
        loadCategory(category);
    }
}

// 접근성 개선: 포커스 관리
function manageFocus() {
    $('.aac-btn').each(function(index) {
        $(this).attr('tabindex', index + 1);
    });
}

// 초기 레이아웃 조정
$(window).on('load', function() {
    adjustButtonLayout();
    manageFocus();
});

// ===== 통합 맥락듣기/추천 기능 =====

// 맥락듣기 시작
function playContext() {
    console.log('playContext 함수 호출됨');
    
    // 맥락듣기 버튼에 클릭 피드백 제공
    const contextButton = document.querySelector('.context-btn');
    if (contextButton) {
        contextButton.style.transform = 'scale(0.95)';
        contextButton.style.background = '#0984e3';
        setTimeout(() => {
            contextButton.style.transform = '';
            contextButton.style.background = '';
        }, 150);
    }
    
    // 즉시 통합 팝업 표시 (맥락 듣기 화면) - 지연 없이 바로 표시
    console.log('showIntegratedPopup 호출 전');
    showIntegratedPopup('listening');
    console.log('showIntegratedPopup 호출 후');
    
    // 팝업이 확실히 표시되도록 강제로 다시 한번 체크
    setTimeout(() => {
        const popup = document.getElementById('recommendationPopup');
        console.log('팝업 요소:', popup);
        console.log('팝업 클래스:', popup ? popup.classList : 'null');
        if (!popup.classList.contains('show')) {
            console.log('팝업에 show 클래스 추가');
            popup.classList.add('show');
        }
    }, 50);
    
    // 실제 음성 인식 및 서버 통신은 여기서 처리
    // 예시: 3초 후 결과 표시 (실제로는 서버 응답을 기다림)
    setTimeout(() => {
        showContextResults([
            '카페에서 주문하는 상황',
            '친구와 대화하는 상황',
            '식당에서 식사하는 상황'
        ]);
    }, 3000);
}

// 통합 팝업 표시 (맥락듣기, 맥락선택, 추천버튼 모든 상태)
function showIntegratedPopup(mode, context = null, buttons = []) {
    console.log('showIntegratedPopup 함수 호출됨, mode:', mode);
    
    const popup = document.getElementById('recommendationPopup');
    const title = document.getElementById('contextTitle');
    const buttonsContainer = document.getElementById('recommendationButtons');
    const prevBtn = document.getElementById('prevContextBtn');
    const nextBtn = document.getElementById('nextContextBtn');
    
    console.log('팝업 요소들:', { popup, title, buttonsContainer, prevBtn, nextBtn });
    
    if (!popup) {
        console.error('recommendationPopup 요소를 찾을 수 없습니다!');
        return;
    }
    
    // 네비게이션 버튼 초기 숨김
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // 버튼 컨테이너 초기화
    buttonsContainer.innerHTML = '';
    
    switch(mode) {
        case 'listening':
            title.textContent = '🎤 맥락듣기';
            buttonsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div class="listening-icon" style="margin: 0 auto 20px; width: 60px; height: 60px; border-radius: 50%; background: #4CAF50; display: flex; align-items: center; justify-content: center; animation: pulse 1.5s infinite;">
                        <span style="color: white; font-size: 24px;">🎤</span>
                    </div>
                    <div style="font-size: 20px; color: #4CAF50; margin-bottom: 10px;">
                        맥락을 듣고 있습니다...
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        주변 소리를 분석하여 상황을 파악하고 있습니다
                    </div>
                </div>
            `;
            break;
            
        case 'context-selection':
            title.textContent = '🎯 상황 선택';
            buttonsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 15px; color: #666; font-size: 16px; border-bottom: 1px solid #eee; margin-bottom: 15px;">
                    상황을 선택하면 맞춤 버튼들을 보여드립니다
                </div>
            `;
            
            // 맥락 선택 버튼들 추가
            buttons.forEach((contextName, index) => {
                const contextButton = document.createElement('div');
                contextButton.className = 'context-selection-btn';
                contextButton.style.cssText = `
                    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                    border: 2px solid #4CAF50;
                    border-radius: 15px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    font-size: 18px;
                    font-weight: 600;
                    color: #2e7d32;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                contextButton.textContent = contextName;
                contextButton.tabIndex = 0;
                contextButton.onclick = () => selectContext(contextName);
                
                // 키보드 접근성
                contextButton.onkeydown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectContext(contextName);
                    }
                };
                
                // 호버 효과
                contextButton.onmouseenter = () => {
                    contextButton.style.background = 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)';
                    contextButton.style.transform = 'translateY(-2px)';
                };
                contextButton.onmouseleave = () => {
                    contextButton.style.background = 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)';
                    contextButton.style.transform = 'translateY(0)';
                };
                
                buttonsContainer.appendChild(contextButton);
            });
            break;
            
        case 'recommendations':
            title.textContent = `🎯 ${context}`;
            
            // 네비게이션 버튼 표시
            prevBtn.style.display = 'inline-block';
            nextBtn.style.display = 'inline-block';
            prevBtn.disabled = recommendationIndex <= 0;
            nextBtn.disabled = false;
            
            if (buttons.length === 0) {
                // 로딩 상태
                buttonsContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 30px;">
                        <div style="font-size: 18px; color: #4CAF50; margin-bottom: 15px;">
                            ${recommendationIndex > 0 ? '새로운 ' : ''}추천 버튼을 준비하고 있습니다...
                        </div>
                        <div class="loading" style="display: inline-block; width: 40px; height: 40px;"></div>
                    </div>
                `;
            } else {
                // 추천 버튼들 생성
                buttons.forEach(buttonData => {
                    const button = document.createElement('div');
                    button.className = 'recommendation-btn';
                    button.tabIndex = 0;
                    button.innerHTML = `
                        <div class="recommendation-btn-badge">⭐</div>
                        <div class="recommendation-btn-text">${buttonData.text}</div>
                    `;
                    
                    // 클릭 이벤트
                    button.onclick = () => {
                        handleAACButtonClick(buttonData);
                    };
                    
                    // 키보드 접근성
                    button.onkeydown = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            button.click();
                        }
                        // 화살표 키로 추천 버튼 간 이동
                        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                            e.preventDefault();
                            navigateRecommendationButtons(e.key);
                        }
                    };
                    
                    buttonsContainer.appendChild(button);
                });
                
                // 추천 버튼 표시 시에는 TTS 없음 (조용히 표시)
            }
            break;
    }
    
    // 팝업을 확실히 표시 (즉시 표시되도록 강제)
    console.log('팝업 표시 전 클래스:', popup.classList);
    popup.classList.add('show');
    console.log('팝업 표시 후 클래스:', popup.classList);
    
    // 브라우저 렌더링 강제 후 다시 한번 체크 (확실한 표시를 위해)
    setTimeout(() => {
        console.log('10ms 후 팝업 클래스 재확인:', popup.classList);
        if (!popup.classList.contains('show')) {
            console.log('다시 show 클래스 추가');
            popup.classList.add('show');
        }
    }, 10);
    
    // 첫 번째 버튼에 포커스 (맥락 선택 또는 추천 버튼)
    if (mode === 'context-selection' || mode === 'recommendations') {
        setTimeout(() => {
            const firstButton = buttonsContainer.querySelector('.context-selection-btn, .recommendation-btn');
            if (firstButton) {
                firstButton.focus();
            }
        }, 100);
    }
}

// 맥락 결과 표시
function showContextResults(contexts) {
    showIntegratedPopup('context-selection', null, contexts);
    
    // 맥락듣기에서는 TTS 없이 진행
}

// 맥락 선택
function selectContext(context) {
    // 전역 상태 업데이트
    currentContext = context;
    
    // 맥락에 맞는 AAC 버튼들을 서버에서 받아오기
    loadContextButtons(context);
}

// 맥락에 맞는 AAC 버튼들 로드
function loadContextButtons(context) {
    // 추천 인덱스 초기화
    recommendationIndex = 0;
    
    // 팝업에 로딩 상태 표시
    showIntegratedPopup('recommendations', context, []);
    
    // 실제로는 서버에서 맥락별 버튼들을 받아옴
    // 예시 데이터 (실제로는 서버 API 호출)
    setTimeout(() => {
        contextButtons = getContextButtons(context, recommendationIndex); // 전역 변수에 저장
        
        // 추천 버튼 팝업에 표시
        showIntegratedPopup('recommendations', context, contextButtons);
        
    }, 1500); // 서버 응답 시뮬레이션
}

// 다른 추천 요청
function requestNewRecommendations(direction) {
    if (!currentContext) return;
    
    // 인덱스 업데이트
    if (direction === 'next') {
        recommendationIndex++;
    } else if (direction === 'previous') {
        recommendationIndex = Math.max(0, recommendationIndex - 1);
    }
    
    // 로딩 상태 표시
    showIntegratedPopup('recommendations', currentContext, []);
    
    // 새로운 추천 데이터 요청 (실제로는 서버 API 호출)
    setTimeout(() => {
        contextButtons = getContextButtons(currentContext, recommendationIndex);
        
        // 추천 버튼 팝업에 표시
        showIntegratedPopup('recommendations', currentContext, contextButtons);
        
        // 다른 추천 요청 시에도 TTS 없음 (조용히 표시)
        
    }, 1000); // 서버 응답 시뮬레이션
}

// 추천 버튼 간 네비게이션
function navigateRecommendationButtons(direction) {
    const buttons = $('.recommendation-btn');
    const currentIndex = buttons.index(document.activeElement);
    
    let newIndex;
    if (direction === 'ArrowRight') {
        newIndex = (currentIndex + 1) % buttons.length;
    } else if (direction === 'ArrowLeft') {
        newIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
    }
    
    buttons.eq(newIndex).focus();
}

// 추천 버튼 팝업 닫기
function closeRecommendationPopup() {
    const popup = document.getElementById('recommendationPopup');
    popup.classList.remove('show');
    
    // 맥락 상태 해제
    currentContext = null;
    contextButtons = [];
    recommendationIndex = 0; // 추천 인덱스 초기화
    
    // 팝업 닫을 때도 조용히 (TTS 없음)
}

// 맥락 해제 함수 (더 이상 필요없음 - 팝업 닫기로 대체)
function clearContext() {
    closeRecommendationPopup();
}

// 맥락별 AAC 버튼 데이터 (실제로는 서버에서 받아옴)
function getContextButtons(context, index = 0) {
    const contextData = {
        '카페에서 주문하는 상황': [
            // 첫 번째 추천 세트
            [
                { text: '아메리카노 주세요', audio: 'americano_please', isContext: true },
                { text: '라떼 주세요', audio: 'latte_please', isContext: true },
                { text: '얼마예요?', audio: 'how_much', isContext: true },
                { text: '카드로 결제할게요', audio: 'card_payment', isContext: true },
                { text: '포장해 주세요', audio: 'takeout_please', isContext: true },
                { text: '여기서 먹을게요', audio: 'eat_here', isContext: true }
            ],
            // 두 번째 추천 세트
            [
                { text: '카푸치노 주세요', audio: 'cappuccino_please', isContext: true },
                { text: '사이즈 업 가능해요?', audio: 'size_up', isContext: true },
                { text: '현금으로 결제할게요', audio: 'cash_payment', isContext: true },
                { text: '디카페인으로 주세요', audio: 'decaf_please', isContext: true },
                { text: '테이크아웃 컵 주세요', audio: 'takeout_cup', isContext: true },
                { text: '와이파이 비밀번호 알려주세요', audio: 'wifi_password', isContext: true }
            ],
            // 세 번째 추천 세트
            [
                { text: '메뉴 추천해 주세요', audio: 'recommend_menu', isContext: true },
                { text: '시럽 빼주세요', audio: 'no_syrup', isContext: true },
                { text: '영수증 주세요', audio: 'receipt_please', isContext: true },
                { text: '좌석 어디 앉을까요?', audio: 'where_sit', isContext: true },
                { text: '화장실 어디에요?', audio: 'where_bathroom', isContext: true },
                { text: '일회용컵 말고 머그컵 주세요', audio: 'mug_cup', isContext: true }
            ]
        ],
        '친구와 대화하는 상황': [
            // 첫 번째 추천 세트
            [
                { text: '안녕!', audio: 'hi_friend', isContext: true },
                { text: '오늘 뭐 해?', audio: 'what_today', isContext: true },
                { text: '같이 놀자', audio: 'lets_play', isContext: true },
                { text: '영화 볼래?', audio: 'watch_movie', isContext: true },
                { text: '밥 먹었어?', audio: 'did_eat', isContext: true },
                { text: '나중에 봐', audio: 'see_later', isContext: true }
            ],
            // 두 번째 추천 세트
            [
                { text: '요즘 어때?', audio: 'how_recently', isContext: true },
                { text: '게임 할래?', audio: 'want_game', isContext: true },
                { text: '카페 갈래?', audio: 'go_cafe', isContext: true },
                { text: '쇼핑 가자', audio: 'go_shopping', isContext: true },
                { text: '전화할게', audio: 'will_call', isContext: true },
                { text: '내일 만나자', audio: 'meet_tomorrow', isContext: true }
            ],
            // 세 번째 추천 세트
            [
                { text: '좀 바빠', audio: 'bit_busy', isContext: true },
                { text: '시간 있어?', audio: 'have_time', isContext: true },
                { text: '뭐 먹을까?', audio: 'what_eat', isContext: true },
                { text: '재미있었어', audio: 'was_fun', isContext: true },
                { text: '고마워', audio: 'thanks', isContext: true },
                { text: '미안해', audio: 'sorry', isContext: true }
            ]
        ],
        '식당에서 식사하는 상황': [
            // 첫 번째 추천 세트
            [
                { text: '메뉴 주세요', audio: 'menu_please', isContext: true },
                { text: '이걸로 주세요', audio: 'this_please', isContext: true },
                { text: '맵지 않게 해주세요', audio: 'not_spicy', isContext: true },
                { text: '물 주세요', audio: 'water_please', isContext: true },
                { text: '계산서 주세요', audio: 'bill_please', isContext: true },
                { text: '맛있어요', audio: 'delicious', isContext: true }
            ],
            // 두 번째 추천 세트
            [
                { text: '추천 메뉴 있어요?', audio: 'recommend_dish', isContext: true },
                { text: '얼마나 걸려요?', audio: 'how_long', isContext: true },
                { text: '포장 가능해요?', audio: 'takeout_possible', isContext: true },
                { text: '반찬 더 주세요', audio: 'more_banchan', isContext: true },
                { text: '영수증 주세요', audio: 'receipt_please', isContext: true },
                { text: '잘 먹었습니다', audio: 'finished_eating', isContext: true }
            ],
            // 세 번째 추천 세트
            [
                { text: '테이블 예약했어요', audio: 'table_reserved', isContext: true },
                { text: '몇 명이세요?', audio: 'how_many_people', isContext: true },
                { text: '카드 결제 돼요?', audio: 'card_payment_ok', isContext: true },
                { text: '서비스 좋아요', audio: 'good_service', isContext: true },
                { text: '화장실 어디에요?', audio: 'where_restroom', isContext: true },
                { text: '다음에 또 올게요', audio: 'come_again', isContext: true }
            ]
        ]
    };
    
    const contextSets = contextData[context] || [[]];
    const setIndex = Math.min(index, contextSets.length - 1);
    return contextSets[setIndex] || [];
}

// 키보드 네비게이션 처리 (접근성)
function handleKeyboardNavigation(e, buttonData) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAACButtonClick(buttonData);
    }
    
    // 화살표 키로 버튼 간 이동
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateButtons(e.key);
    }
}

// 버튼 간 네비게이션
function navigateButtons(direction) {
    const buttons = $('.aac-btn');
    const currentIndex = buttons.index(document.activeElement);
    let newIndex;
    
    const cols = getGridColumns();
    
    switch(direction) {
        case 'ArrowRight':
            newIndex = (currentIndex + 1) % buttons.length;
            break;
        case 'ArrowLeft':
            newIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
            break;
        case 'ArrowDown':
            newIndex = currentIndex + cols;
            if (newIndex >= buttons.length) newIndex = currentIndex;
            break;
        case 'ArrowUp':
            newIndex = currentIndex - cols;
            if (newIndex < 0) newIndex = currentIndex;
            break;
        default:
            return;
    }
    
    buttons.eq(newIndex).focus();
}

// 현재 그리드 컬럼 수 가져오기
function getGridColumns() {
    const screenWidth = $(window).width();
    if (screenWidth <= 768) return 3; // 모바일
    if (screenWidth <= 1024) return 4; // 태블릿
    return 5; // 데스크톱
}

// 팝업 외부 클릭시 닫기
document.addEventListener('click', function(event) {
    // 추천 팝업 외부 클릭시 닫기 (단, AAC 버튼이나 카테고리 버튼은 제외)
    const popup = document.getElementById('recommendationPopup');
    
    if (popup.classList.contains('show') && 
        !popup.contains(event.target) && 
        !event.target.closest('.recommendation-popup') &&
        !event.target.closest('.aac-btn') &&
        !event.target.closest('.category-btn') &&
        !event.target.closest('#buttons') &&
        !event.target.closest('#category')) {
        closeRecommendationPopup();
    }
});

// ESC 키로 팝업 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popup = document.getElementById('recommendationPopup');
        
        if (popup.classList.contains('show')) {
            closeRecommendationPopup();
        }
    }
});
