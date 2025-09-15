// DOM
const singleBtn=document.getElementById('singleBtn');
const multiBtn=document.getElementById('multiBtn');
const multiLobby=document.getElementById('multiLobby');
const createRoom=document.getElementById('createRoom');
const joinRoomBtn=document.getElementById('joinRoom');
const backBtn=document.getElementById('backBtn');
const profile=document.getElementById('profile');
const playerName=document.getElementById('playerName');
const playerAvatar=document.getElementById('playerAvatar');
const avatarPreview=document.getElementById('avatarPreview');
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
const slapSound=document.getElementById('slapSound');

// Состояния
let leftScore=0,rightScore=0;
let roundActive=false;
let isSingle=false;
let playerSide='left'; // или 'right'
const phrases=[
"щовель","пикми","абаюдно","тунг тунг сахур","ой ой халепа","киси киси мяу мяу","воглод",
"флекс","чиль","топчик","лол","сай","краш","дроп","чел","зашквар","зумерский вайб",
"чекни","глитч","френд","гопник","треш","кринж","хаус","мемчик","патимейкер","тюн","чилл","ба","шаришь",
"open the door"
];

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
backBtn.onclick=()=>{
    multiLobby.style.display='none';
    profile.style.display='none';
    menuShow();
};
function menuHide(){document.getElementById('menu').style.display='none';}
function menuShow(){document.getElementById('menu').style.display='block';}

// === Профиль ===
playerAvatar.onchange=e=>{
    avatarPreview.src=URL.createObjectURL(e.target.files[0]);
};
saveProfile.onclick=()=>{
    leftNameDisplay.textContent=playerName.value||'Игрок';
    leftImg.src=avatarPreview.src;
    profile.style.display='none';
    gameArea.style.display='block';
};

// === Одиночный режим ===
function setupSingle(){
    profile.style.display='block';
    rightNameDisplay.textContent='Бот';
    rightImg.src='assets/default_bot.png';
}

startBtn.onclick=()=>{
    startBtn.style.display='none';
    roundActive=true;
};

// Клик по аватару — удар
leftImg.onclick=()=>{if(isSingle&&roundActive) performHit(true);}
rightImg.onclick=()=>{if(isSingle&&roundActive) performHit(false);}

// Удар
function performHit(isLeft){
    if(!roundActive) return;
    slapSound.currentTime=0; slapSound.play();

    // координаты
    const leftRect=leftImg.getBoundingClientRect();
    const rightRect=rightImg.getBoundingClientRect();
    const topY=isLeft?leftRect.top+leftRect.height/2:rightRect.top+rightRect.height/2;
    const startX=isLeft?leftRect.right:rightRect.left;
    const endX=isLeft?rightRect.left:leftRect.right+leftRect.width*0.1;

    // фраза
    const phrase=phrases[Math.floor(Math.random()*phrases.length)];
    chat.innerHTML+=`<p>${isLeft?leftNameDisplay.textContent:rightNameDisplay.textContent}: ${phrase}</p>`;
    chat.scrollTop=chat.scrollHeight;

    // очки
    if(isLeft){ leftScore++; leftScoreDisplay.textContent=`Очки: ${leftScore}`;}
    else{ rightScore++; rightScoreDisplay.textContent=`Очки: ${rightScore}`;}

    // анимация руки
    handImg.style.top=topY+'px';
    handImg.style.left=startX+'px';
    handImg.style.display='block';
    handImg.animate([
        {transform:"translate(0,-50%) rotate(-45deg) scale(0)"},
        {transform:`translate(${endX-startX}px,-50%) rotate(-45deg) scale(1.2)`},
        {transform:`translate(${endX-startX}px,-50%) rotate(-45deg) scale(1)`}
    ],{duration:400,fill:"forwards"});

    roundActive=false;
    // бот отвечает через 1-3 секунды
    if(isSingle){
        setTimeout(()=>{
            roundActive=true;
            const botLeft=Math.random()>0.5;
            performHit(botLeft);
        }, Math.random()*2000+1000);
    } else roundActive=true;
}

// === Чат ===
sendChat.onclick=()=>{
    const msg=chatInput.value.trim();
    if(!msg) return;
    chat.innerHTML+=`<p>${playerName.value||'Игрок'}: ${msg}</p>`;
    chatInput.value='';
    chat.scrollTop=chat.scrollHeight;
}
