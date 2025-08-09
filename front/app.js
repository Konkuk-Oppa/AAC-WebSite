// Minimal interactivity for the mock design
(function(){
  const list = document.getElementById('list');
  const tabs = document.querySelectorAll('.segmented-item');
  const log = document.getElementById('logContent');
  const input = document.getElementById('textInput');
  const actionBtn = document.getElementById('actionBtn');
  const kbAssist = document.getElementById('kbAssist');
  const overlayLine = document.getElementById('overlayLine');
  const rec1 = document.getElementById('rec1');
  const rec2 = document.getElementById('rec2');

  const data = {
    menu1:['문장 및 단어 1','문장 및 단어 2','문장 및 단어 3','문장 및 단어 4'],
    menu2:['항목 A','항목 B','항목 C','항목 D'],
    menu3:['아이템 α','아이템 β','아이템 γ','아이템 δ']
  };

  function appendLog(text){
    if(!text) return;
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = text;
    log.appendChild(line);
    // 최신 항목이 보이도록 스크롤 하단으로
    log.scrollTop = log.scrollHeight;
  }

  function renderItems(key){
    list.innerHTML = data[key].map(t=>`<div class="list-item">${t}</div>`).join('');
  }

  tabs.forEach(btn=>{
    btn.addEventListener('click',()=>{
      tabs.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderItems(btn.dataset.tab);
    });
  });

  // 리스트 클릭 → 로그에 추가 (이벤트 위임)
  list.addEventListener('click', (e)=>{
    const item = e.target.closest('.list-item');
    if(!item) return;
    const t = item.textContent.trim();
    appendLog(t);
    overlayLine.textContent = `${t}`;
    rec1.textContent = `얼마나 걸리나요.`;
    rec2.textContent = `늦었어요.`;
  });

  // 입력 버튼 → 입력 포커스 + 보조 영역 표시 토글
  actionBtn.addEventListener('click', ()=>{
    input.focus();
    kbAssist.classList.remove('hidden');
  });

  // 입력 포커스 시 보조영역 보이기, 블러 시 유지(원하면 숨김으로 변경 가능)
  input.addEventListener('focus', ()=> kbAssist.classList.remove('hidden'));

  // initial
  renderItems('menu1');
})();
