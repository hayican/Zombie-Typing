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

// Elemen Baru UI & Tombol
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartOverlayBtn = document.getElementById('restart-overlay-btn');
const resumeOverlayBtn = document.getElementById('resume-overlay-btn'); // Tangkap tombol Start baru

const wordList = [
    "pensil", "penghapus", "buku", "kantin", 
    "upacara", "kelas", "penggaris", "razia", 
    "guru", "tugas", "ujian", "mading"
];

let currentTarget = null; 
let score = 0;       // Skor saat ini (bisa naik turun)
let totalScore = 0;  // Skor murni (hanya naik saat bunuh zombi)
let hp = 100;
let isGameOver = false;
let isPaused = false; 

let spawnDelay = 3000; 
let zombieDamage = 10; 

// ===============================
// SISTEM TOMBOL KONTROL
// ===============================

// Fungsi Tombol Pause (Bisa dipanggil dari tombol pojok atau layar tengah)
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

// Pasang fungsi pause ke kedua tombol
pauseBtn.addEventListener('click', togglePause);
resumeOverlayBtn.addEventListener('click', togglePause); // Tombol "Start" di tengah layar

// Fungsi Tombol Restart
function restartGame() {
    location.reload(); 
}
restartBtn.addEventListener('click', restartGame);
restartOverlayBtn.addEventListener('click', restartGame);


// ===============================
// SISTEM LEVEL 
// ===============================
function checkLevel() {
    if (score < 120) {
        spawnDelay = 3000;
        zombieDamage = 10;
    } else if (score < 220) {
        spawnDelay = 1800; 
        zombieDamage = 15;
    } else {
        spawnDelay = 1000; 
        zombieDamage = 20;
    }
}

function updateTarget() {
    if (isGameOver) return;
    
    const allZombies = Array.from(document.querySelectorAll('.zombie:not(.dead)'));
    
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

    if (index > 0) {
        player.classList.add('shoot');
    } else {
        player.classList.remove('shoot');
    }

    const typedPart = `<span style="color: yellow;">${word.substring(0, index)}</span>`;
    const untypedPart = word.substring(index);
    
    typingDisplay.innerHTML = typedPart + untypedPart;
}

// ===============================
// SISTEM ZOMBI 
// ===============================
function spawnZombie() {
    if (isGameOver) return;

    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    const zombieTypes = ['zombie-1', 'zombie-2', 'zombie-3', 'zombie-4', 'zombie-5', 'zombie-6'];
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
        if (isGameOver || zombie.classList.contains('dead')) {
            clearInterval(moveInterval);
            return;
        }

        if (isPaused) return; 

        zombieX -= 1.5; 
        zombie.style.left = zombieX + 'px';

        if (zombieX < 80) {
            clearInterval(moveInterval);
            
            if (currentTarget === zombie) {
                currentTarget = null; 
            }
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

            // Cek Game Over
            if (hp <= 0) {
                isGameOver = true;
                typingDisplay.innerHTML = 'GAME OVER!';
                
                // Menampilkan total skor murni yang didapat selama hidup!
                finalScoreElement.innerText = totalScore; 
                gameOverScreen.classList.remove('hidden');
            }
        }
    }, 20);
}

function scheduleNextZombie() {
    if (isGameOver) return;
    
    if (!isPaused) {
        spawnZombie();
    }
    
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
            killedZombie.classList.add('dead');
            
            setTimeout(() => killedZombie.remove(), 300);

            // Zombi mati: Poin masuk ke Skor Utama dan Skor Total
            score += 20;
            totalScore += 20; // Variabel ini ga bakal pernah ngurang!
            scoreElement.innerText = score;

            checkLevel();

            currentTarget = null;   
            updateTarget(); 
        }
    }
});