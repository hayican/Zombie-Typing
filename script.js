const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const gameArea = document.getElementById('game-area');
const typingDisplay = document.getElementById('typing-display');
const lanes = [
    document.getElementById('lane-1'),
    document.getElementById('lane-2'),
    document.getElementById('lane-3'),
    document.getElementById('lane-4')
];

// UI
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartOverlayBtn = document.getElementById('restart-overlay-btn');
const resumeOverlayBtn = document.getElementById('resume-overlay-btn');

const wordList = [
    "pensil", "penghapus", "buku", "kantin", "upacara", "kelas", "penggaris", "razia", 
    "guru", "tugas", "ujian", "bebek", "spidol", "topi", "teknologi", "seragam", "ketidaksalahpahaman", "ayam", "ekstrakurikuler", 
    "perpustakaan", "komputer", "internet", "matematika", "blackbox", "kimia", "biologi", "cursor", "claude", "musik", "olahraga", 
    "laptop", "proyektor", "kantor", "laboratorium", "fiber", "server", "anomali","password", "wifi", "wireless", "jabodetabek", 
    "kumar", "akun", "metamorfosis",
];

let currentTarget = null; 
let score = 0;  
let totalScore = 0; 
let hp = 100;
let isGameOver = false;
let isPaused = false; 

let spawnDelay = 3000; 
let zombieDamage = 10; 

// SISTEM PELURU & PARTIKEL 
function fireBullet(targetZombie) {
    const bullet = document.createElement('div');
    bullet.classList.add('water-bullet');
    gameArea.appendChild(bullet);

    const playerRect = player.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    const startX = playerRect.left - gameAreaRect.left + (playerRect.width * 0.8); 
    const startY = playerRect.top - gameAreaRect.top + (playerRect.height * 0.2); 

    bullet.style.left = startX + 'px';
    bullet.style.top = startY + 'px';

    bullet.getBoundingClientRect();

    const targetRect = targetZombie.getBoundingClientRect();
    const endX = targetRect.left - gameAreaRect.left + (targetRect.width * 0.2);
    const endY = targetRect.top - gameAreaRect.top + (targetRect.height * 0.5);

    bullet.style.left = endX + 'px';
    bullet.style.top = endY + 'px';

    setTimeout(() => {
        bullet.remove(); 

        const splash = document.createElement('div');
        splash.classList.add('water-splash');
        splash.style.left = endX + 'px';
        splash.style.top = endY + 'px';
        gameArea.appendChild(splash);

        setTimeout(() => splash.remove(), 200);
    }, 150); 
}

// SISTEM TOMBOL KONTROL
function togglePause() {
    if (isGameOver) return; 

    isPaused = !isPaused; 
    
    if (isPaused) {
        pauseScreen.classList.remove('hidden'); 
        pauseBtn.innerText = 'Resume';
    } else {
        pauseScreen.classList.add('hidden'); 
        pauseBtn.innerText = 'Pause';
    }
}
pauseBtn.addEventListener('click', togglePause);
resumeOverlayBtn.addEventListener('click', togglePause); 

function restartGame() { location.reload(); }
restartBtn.addEventListener('click', restartGame);
restartOverlayBtn.addEventListener('click', restartGame);

// SISTEM LEVEL 
function checkLevel() {
    if (score < 120) { spawnDelay = 3000; zombieDamage = 10; } 
    else if (score < 220) { spawnDelay = 1800; zombieDamage = 15; } 
    else { spawnDelay = 1000; zombieDamage = 20; }
}

// SISTEM AUTO TARGET
function updateTarget() {
    if (isGameOver) return;
    
    const allZombies = Array.from(document.querySelectorAll('.zombie:not(.dead):not(.dying)'));
    
    if (allZombies.length === 0) {
        currentTarget = null;
        renderTypingDisplay();
        return;
    }
    allZombies.sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left));
    currentTarget = allZombies[0];
    renderTypingDisplay();
}

function renderTypingDisplay() {
    if (isGameOver) return;
    if (!currentTarget) {
        typingDisplay.innerHTML = 'MENUNGGU TARGET...';
        player.classList.remove('shoot');
        return;
    }
    const word = currentTarget.dataset.word;
    const index = parseInt(currentTarget.dataset.typedIndex);
    
    if (index > 0) { player.classList.add('shoot'); } 
    else { player.classList.remove('shoot'); }
    
    const typedPart = `<span style="color: yellow;">${word.substring(0, index)}</span>`;
    const untypedPart = word.substring(index);
    typingDisplay.innerHTML = typedPart + untypedPart;
}

// SISTEM ZOMBI 
function spawnZombie() {
    if (isGameOver) return;
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    const zombieTypes = ['zombie-1', 'zombie-2', 'zombie-3', 'zombie-4', 'zombie-5'];
    const randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];

    const zombie = document.createElement('div');
    zombie.classList.add('zombie', randomType);
    zombie.dataset.word = randomWord; 
    zombie.dataset.typedIndex = 0;    
    
    let zombieX = 1000; 
    zombie.style.left = zombieX + 'px';
    randomLane.appendChild(zombie);
    updateTarget();

    const moveInterval = setInterval(function() {
        // FIX BUG: Hentikan langkah zombi kalau dia udah ditandai mati (.dead) atau sedang sekarat nunggu peluru (.dying)
        if (isGameOver || zombie.classList.contains('dead') || zombie.classList.contains('dying')) {
            clearInterval(moveInterval);
            return;
        }
        if (isPaused) return; 

        zombieX -= 1.5; 
        zombie.style.left = zombieX + 'px';

        if (zombieX < 80) {
            clearInterval(moveInterval);
            if (currentTarget === zombie) { currentTarget = null; }
            zombie.remove(); 
            
            hp -= zombieDamage;
            if (hp < 0) hp = 0; 
            healthElement.innerText = hp;

            score -= 30;
            if (score < 0) score = 0; 
            scoreElement.innerText = score;
            checkLevel(); 

            player.classList.add('damaged');
            setTimeout(() => player.classList.remove('damaged'), 300);

            const damageText = document.createElement('div');
            damageText.classList.add('damage-text');
            damageText.innerText = `-${zombieDamage}`; 
            gameArea.appendChild(damageText);
            setTimeout(() => damageText.remove(), 1000);

            updateTarget();
            if (hp <= 0) {
                isGameOver = true;
                typingDisplay.innerHTML = 'GAME OVER!';
                finalScoreElement.innerText = totalScore; 
                gameOverScreen.classList.remove('hidden');
            }
        }
    }, 20);
}

function scheduleNextZombie() {
    if (isGameOver) return;
    if (!isPaused) { spawnZombie(); }
    setTimeout(scheduleNextZombie, spawnDelay); 
}
setTimeout(scheduleNextZombie, 1000); 

// ===============================
// SISTEM PENGETIKAN
// ===============================
document.addEventListener('keydown', function(event) {
    if (isGameOver || isPaused) return; 

    const typedLetter = event.key.toLowerCase();
    if (!/^[a-z]$/.test(typedLetter)) return;
    if (!currentTarget) return;

    const word = currentTarget.dataset.word;
    let typedIndex = parseInt(currentTarget.dataset.typedIndex);

    if (word[typedIndex] === typedLetter) {
        typedIndex++; 
        currentTarget.dataset.typedIndex = typedIndex;
        
        renderTypingDisplay();

        if (typedIndex === word.length) {
            let killedZombie = currentTarget; 
            
            // FIX BUG: Langsung kasih status "sekarat" saat kata selesai biar diabaikan oleh sistem target
            killedZombie.classList.add('dying'); 
            
            fireBullet(killedZombie);
            
            setTimeout(() => {
                killedZombie.classList.add('dead');
                setTimeout(() => killedZombie.remove(), 300);
            }, 150); 

            score += 20;
            totalScore += 20;
            scoreElement.innerText = score;

            checkLevel();
            
            // Cari target baru SECARA INSTAN, tanpa delay dan tanpa nge-bug ke zombi yang baru mati!
            currentTarget = null;   
            updateTarget(); 
        }
    }
});