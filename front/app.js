// Minimal interactivity for the mock design
(function(){
  const list = document.getElementById('list');
  const tabs = document.querySelectorAll('.segmented-item');

  const data = {
    menu1:['문장 및 단어 1','문장 및 단어 2','문장 및 단어 3','문장 및 단어 4'],
    menu2:['항목 A','항목 B','항목 C','항목 D'],
    menu3:['아이템 α','아이템 β','아이템 γ','아이템 δ']
  };

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

  // initial
  renderItems('menu1');
})();
