window.onload=()=>{

// ====== DOM ======
const singleBtn=document.getElementById('singleBtn');
const multiBtn=document.getElementById('multiBtn');
const multiLobby=document.getElementById('multiLobby');
const createRoom=document.getElementById('createRoom');
const joinRoomBtn=document.getElementById('joinRoom');
const backBtn=document.getElementById('backBtn');
const profile=document.getElementById('profile');
const profileBtn=document.getElementById('profileBtn');
const homeBtn=document.getElementById('homeBtn');

const playerName=document.getElementById('playerName');
const playerAvatar=document.getElementById('playerAvatar');
const avatarPreview=document.getElementById('avatarPreview');
const soundSelect=document.getElementById('soundSelect');
const saveProfile=document.getElementById('saveProfile');

const gameArea=document.getElementById('gameArea');
const leftImg=document.getElementById('leftImg');
const rightImg=document.getElementById('rightImg');
const leftNameDisplay=document.getElementById('leftNameDisplay');
const rightNameDisplay=document.getElementById('rightNameDisplay');
const leftScoreDisplay=document.getElementById('leftScore');
const rightScoreDisplay=document.getElementById('rightScore');
const roundMsg=document.getElementById('roundMsg');
const chat=document.getElementById('chat');
const chatInput=document.getElementById('chatInput');
const sendChat=document.getElementById('sendChat');
const handImg=document.getElementById('handImg');

// ====== Переменные ======
let playerProfile={name:'Игрок',avatar:'assets/default_bot.png',selectedSound:'slap'};
let playerSide='left';
let roomId=null;
let leftScore=0,rightScore=0;
let roundActive=false;
let consecutiveHitsLeft=0,consecutiveHitsRight=0;
const maxConsecutive=3;
const phrases=["щовель","пикми","абаюдно","тунг тунг сахур","ой ой халепа","киси киси мяу мяу","воглод",
"флекс","чиль","топчик","лол","сай","краш","дроп","чел","зашквар","зумерский вайб",
"чекни","глитч","френд","гопник","треш","кринж","хаус","мемчик","патимейкер","тюн","чилл","ба","шаришь",
"open the door"];
let isSingle=false;

// ====== Меню ======
singleBtn.onclick=()=>{
  isSingle=true;
  document.getElementById('menu').style.display='none';
  setupSingle();
  startRound();
};
multiBtn.onclick=()=>{
  isSingle=false;
  document.getElementById('menu').style.display='none';
  multiLobby.style.display='block';
};
backBtn.onclick=()=>{
  multiLobby.style.display='none';
  document.getElementById('menu').style.display='block';
};

// ====== Профиль ======
profileBtn.onclick=()=>{profile.style.display='block';};
homeBtn.onclick=()=>{
  gameArea.style.display='none';
  profile.style.display='none';
  multiLobby.style.display='none';
  document.getElementById('menu').style.display='block';
};
playerAvatar.onchange=e=>{
  const file=e.target.files[0];
  avatarPreview.src=URL.createObjectURL(file);
  const storageRef=storage.ref('avatars/'+file.name);
  storageRef.put(file).then(snap=>snap.ref.getDownloadURL().then(url=>{
    playerProfile.avatar=url;
    if(playerSide==='left') leftImg.src=url; else rightImg.src=url;
    if(roomId) db.ref('rooms/'+roomId+'/players/'+playerSide+'/avatar').set(url);
  }));
};
saveProfile.onclick=()=>{
  playerProfile.name=playerName.value||'Игрок';
  playerProfile.selectedSound=soundSelect.value;
  if(playerSide==='left') leftNameDisplay.textContent=playerProfile.name;
  else rightNameDisplay.textContent=playerProfile.name;
  profile.style.display='none';
  gameArea.style.display='block';
};

// ====== Одиночка ======
function setupSingle(){
  rightNameDisplay.textContent='Бот';
  rightImg.src='assets/default_bot.png';
}

// ====== Рунд ======
async function startRound(){
  roundActive=false;
  roundMsg.textContent="Внимание…";
  await new Promise(r=>setTimeout(r,1000));
  roundMsg.textContent="УДАР!";
  roundActive=true;
}

// ====== Удар ======
function performHit(side,x=null,y=null){
  if(!roundActive) return;

  const audio=new Audio(playerProfile.selectedSound==='slap'?'assets/slap.mp3':'assets/slap2.mp3');
  audio.play();

  if(!x||!y){
    const rect=side==='left'?leftImg.getBoundingClientRect():rightImg.getBoundingClientRect();
    x=rect.left+rect.width/2;
    y=rect.top+rect.height/2;
  }

  handImg.style.left=x+'px';
  handImg.style.top=y+'px';
  handImg.style.display='block';
  setTimeout(()=>handImg.style.display='none',400);

  if(side==='left'){leftScore++; leftScoreDisplay.textContent=`Очки: ${leftScore}`; consecutiveHitsLeft++; consecutiveHitsRight=0;}
  else {rightScore++; rightScoreDisplay.textContent=`Очки: ${rightScore}`; consecutiveHitsRight++; consecutiveHitsLeft=0;}

  const phrase=phrases[Math.floor(Math.random()*phrases.length)];
  chat.innerHTML+=`<p>${side==='left'?leftNameDisplay.textContent:rightNameDisplay.textContent}: ${phrase}</p>`;
  chat.scrollTop=chat.scrollHeight;

  if(consecutiveHitsLeft>=maxConsecutive){triggerFatality('left'); return;}
  if(consecutiveHitsRight>=maxConsecutive){triggerFatality('right'); return;}

  roundActive=false;

  if(isSingle && side==='left'){
    setTimeout(()=>performHit('right'),Math.random()*2000+1000);
  } else roundActive=true;
}

// ====== Фаталити ======
function triggerFatality(side){
  roundActive=false;
  roundMsg.textContent="ФАТАЛИТИ!";
  const specialPhrases=["БАБАХ!!!","КРИК!","УДАР В ЖИВОТ!","ПОБЕДА!"];
  chat.innerHTML+=`<p>${side==='left'?leftNameDisplay.textContent:rightNameDisplay.textContent}: ${specialPhrases[Math.floor(Math.random()*specialPhrases.length)]}</p>`;
  chat.scrollTop=chat.scrollHeight;

  handImg.style.transform='scale(2) rotate(-45deg)';
  handImg.style.display='block';
  setTimeout(()=>{
    handImg.style.display='none';
    handImg.style.transform='translate(-50%,-50%) rotate(-45deg)';
    consecutiveHitsLeft=0; consecutiveHitsRight=0;
    startRound();
  },1500);
}

// ====== Клик по сопернику ======
leftImg.onclick=()=>{if(playerSide==='right') performHit('left');};
rightImg.onclick=()=>{if(playerSide==='left' || isSingle) performHit('right');};

// ====== Чат ======
sendChat.onclick=()=>{
  const msg=chatInput.value.trim();
  if(!msg) return;
  chat.innerHTML+=`<p>${playerProfile.name}: ${msg}</p>`;
  chatInput.value='';
  chatInput.focus();
  chat.scrollTop=chat.scrollHeight;
};
chatInput.addEventListener("keypress",e=>{if(e.key==='Enter') sendChat.onclick();});

// ====== Мультиплеер (упрощённо) ======
createRoom.onclick=()=>{
  roomId=Math.random().toString(36).substr(2,6);
  playerSide='left';
  db.ref('rooms/'+roomId+'/players/left').set(playerProfile);
  alert(`Комната создана. Код: ${roomId}`);
  multiLobby.style.display='none';
  gameArea.style.display='block';
};
joinRoomBtn.onclick=()=>{
  roomId=document.getElementById('joinCode').value.trim();
  if(!roomId) return alert('Введите код комнаты');
  playerSide='right';
  db.ref('rooms/'+roomId+'/players/right').set(playerProfile);
  multiLobby.style.display='none';
  gameArea.style.display='block';
};

// ====== Слушаем комнату ======
db.ref('rooms/').on('value',snap=>{
  if(!roomId) return;
  const roomData=snap.val()[roomId];
  if(!roomData) return;
  if(roomData.players.left && roomData.players.left.avatar) leftImg.src=roomData.players.left.avatar;
  if(roomData.players.right && roomData.players.right.avatar) rightImg.src=roomData.players.right.avatar;
  if(roomData.players.left && roomData.players.left.name) leftNameDisplay.textContent=roomData.players.left.name;
  if(roomData.players.right && roomData.players.right.name) rightNameDisplay.textContent=roomData.players.right.name;
});
};
