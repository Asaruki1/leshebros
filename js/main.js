// DOM
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
const startBtn=document.getElementById('startBtn');
const chat=document.getElementById('chat');
const chatInput=document.getElementById('chatInput');
const sendChat=document.getElementById('sendChat');
const handImg=document.getElementById('handImg');

// Профиль и настройки
let playerProfile = {name:'Игрок', avatar:'assets/default_bot.png', selectedSound:'slap'};

// Игра
let leftScore=0, rightScore=0;
let roundActive=false;
let isSingle=false;
let roomId=null;
let playerSide='left';

// Фразы
const phrases=["щовель","пикми","абаюдно","тунг тунг сахур","ой ой халепа","киси киси мяу мяу","воглод",
"флекс","чиль","топчик","лол","сай","краш","дроп","чел","зашквар","зумерский вайб",
"чекни","глитч","френд","гопник","треш","кринж","хаус","мемчик","патимейкер","тюн","чилл","ба","шаришь",
"open the door"];

// === Меню ===
singleBtn.onclick=()=>{
    isSingle=true;
    menuHide();
    setupSingle();
};
multiBtn.onclick=()=>{
    isSingle=false;
    menuHide();
    multiLobby.style.display='block';
};
backBtn.onclick=()=>{multiLobby.style.display='none'; menuShow();}
function menuHide(){document.getElementById('menu').style.display='none';}
function menuShow(){document.getElementById('menu').style.display='block';}

// === Профиль всегда доступен ===
profileBtn.onclick=()=>{profile.style.display='block';}
homeBtn.onclick=()=>{
    gameArea.style.display='none';
    profile.style.display='none';
    multiLobby.style.display='none';
    menuShow();
};
playerAvatar.onchange=e=>avatarPreview.src=URL.createObjectURL(e.target.files[0]);
saveProfile.onclick=()=>{
    playerProfile.name=playerName.value||'Игрок';
    playerProfile.avatar=avatarPreview.src;
    playerProfile.selectedSound=soundSelect.value;
    leftNameDisplay.textContent=playerProfile.name;
    leftImg.src=playerProfile.avatar;
    profile.style.display='none';
    gameArea.style.display='block';
};

// === Одиночная игра ===
function setupSingle(){
    rightNameDisplay.textContent='Бот';
    rightImg.src='assets/default_bot.png';
}

// Начало игры
startBtn.onclick=()=>{startBtn.style.display='none'; roundActive=true;}

// Клик по аватару = удар
leftImg.onclick=()=>{if(roundActive) performHit('left');}
rightImg.onclick=()=>{if(roundActive && isSingle) performHit('right');}

// Удар
function performHit(side){
    if(!roundActive) return;
    const audio=new Audio(playerProfile.selectedSound==='slap'?'assets/slap.mp3':'assets/slap2.mp3');
    audio.play();

    // координаты
    let rect = side==='left'?leftImg.getBoundingClientRect():rightImg.getBoundingClientRect();
    const hitX = rect.left + rect.width/2;
    const hitY = rect.top + rect.height/2;

    handImg.style.top=hitY+'px';
    handImg.style.left=hitX+'px';
    handImg.style.display='block';
    setTimeout(()=>handImg.style.display='none',400);

    // очки
    if(side==='left'){ leftScore++; leftScoreDisplay.textContent=`Очки: ${leftScore}`;}
    else{ rightScore++; rightScoreDisplay.textContent=`Очки: ${rightScore}`;}

    // фраза
    const phrase=phrases[Math.floor(Math.random()*phrases.length)];
    chat.innerHTML+=`<p>${side==='left'?leftNameDisplay.textContent:rightNameDisplay.textContent}: ${phrase}</p>`;
    chat.scrollTop=chat.scrollHeight;

    roundActive=false;

    // Бот
    if(isSingle && side==='left'){
        setTimeout(()=>{roundActive=true; const botSide='right'; performHit(botSide);}, Math.random()*2000+1000);
    } else roundActive=true;
}

// Чат
sendChat.onclick=()=>{
    const msg=chatInput.value.trim();
    if(!msg) return;
    chat.innerHTML+=`<p>${playerProfile.name}: ${msg}</p>`;
    chatInput.value='';
    chat.scrollTop=chat.scrollHeight;
}

// === Мультиплеер ===
// Создание комнаты
createRoom.onclick=()=>{
    roomId=Math.random().toString(36).substr(2,6);
    playerSide='left';
    db.ref('rooms/'+roomId+'/players/left').set(playerProfile);
    alert(`Комната создана. Код: ${roomId}`);
    multiLobby.style.display='none';
    gameArea.style.display='block';
    leftNameDisplay.textContent=playerProfile.name;
    leftImg.src=playerProfile.avatar;
    rightNameDisplay.textContent='Ждем игрока...';
};

// Присоединение к комнате
joinRoomBtn.onclick=()=>{
    roomId=document.getElementById('joinCode').value.trim();
    if(!roomId) return alert('Введите код комнаты');
    playerSide='right';
    db.ref('rooms/'+roomId+'/players/right').set(playerProfile);
    multiLobby.style.display='none';
    gameArea.style.display='block';
    rightNameDisplay.textContent=playerProfile.name;
    rightImg.src=playerProfile.avatar;
};

// Слушаем изменения комнаты
db.ref('rooms/').on('value',snap=>{
    const rooms=snap.val();
    if(!roomId || !rooms || !rooms[roomId]) return;
    const room=rooms[roomId];
    if(room.players.left) {
        leftNameDisplay.textContent=room.players.left.name;
        leftImg.src=room.players.left.avatar;
    }
    if(room.players.right){
        rightNameDisplay.textContent=room.players.right.name;
        rightImg.src=room.players.right.avatar;
    }
});
