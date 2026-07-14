// ===============================
// SETUP AWAL
// ===============================
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const gameArea = document.getElementById('game-area');
const lanes = [
    document.getElementById('lane-1'),
    document.getElementById('lane-2'),
    document.getElementById('lane-3'),
    document.getElementById('lane-4')
];

const wordList = [
    "pensil", "penghapus", "buku", "kantin", 
    "upacara", "kelas", "penggaris", "razia", 
    "guru", "tugas", "ujian", "mading"
];

let currentTarget = null; 
let score = 0;

// ===============================
// SISTEM ZOMBI (SPAWN & JALAN)
// ===============================
function spawnZombie() {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

    const zombie = document.createElement('div');
    zombie.classList.add('zombie');
    
    zombie.dataset.word = randomWord; 
    zombie.dataset.typedIndex = 0;    
    
    let zombieX = 1000; 
    zombie.style.left = zombieX + 'px';

    const wordElement = document.createElement('div');
    wordElement.classList.add('word');
    wordElement.innerHTML = randomWord; 
    zombie.appendChild(wordElement);
    randomLane.appendChild(zombie);

    const moveInterval = setInterval(function() {
        zombieX -= 1.5; 
        zombie.style.left = zombieX + 'px';

        // Kalau zombi nyentuh ujung kiri (PLAYER KENA DAMAGE)
        if (zombieX < 80) {
            clearInterval(moveInterval);
            
            if (currentTarget === zombie) {
                currentTarget = null; 
                player.classList.remove('shoot');
            }
            
            zombie.remove(); 
            
            // 1. Kasih efek gelap ke player
            player.classList.add('damaged');
            setTimeout(() => player.classList.remove('damaged'), 300); // Gelap selama 0.3 detik

            // 2. Munculkan teks animasi -5
            const damageText = document.createElement('div');
            damageText.classList.add('damage-text');
            damageText.innerText = '-5';
            gameArea.appendChild(damageText);
            
            // Hapus teks dari HTML setelah animasinya selesai (1 detik)
            setTimeout(() => damageText.remove(), 1000);

            // 3. Kurangi skor sebanyak 5 poin
            score -= 5;
            scoreElement.innerText = score;
        }
    }, 20);
}

setInterval(spawnZombie, 3000);

// ===============================
// SISTEM PENGETIKAN & TEMBAKAN
// ===============================
document.addEventListener('keydown', function(event) {
    const typedLetter = event.key.toLowerCase();
    if (!/^[a-z]$/.test(typedLetter)) return;

    const allZombies = document.querySelectorAll('.zombie');

    if (!currentTarget) {
        for (let zombie of allZombies) {
            // Abaikan zombi yang sedang mati (punya class 'dead')
            if (zombie.classList.contains('dead')) continue;

            const word = zombie.dataset.word;
            if (word[0] === typedLetter) {
                currentTarget = zombie; 
                currentTarget.dataset.typedIndex = 1; 
                updateWordDisplay(currentTarget);
                player.classList.add('shoot'); 
                break; 
            }
        }
    } 
    else {
        const word = currentTarget.dataset.word;
        let typedIndex = parseInt(currentTarget.dataset.typedIndex);

        if (word[typedIndex] === typedLetter) {
            typedIndex++; 
            currentTarget.dataset.typedIndex = typedIndex;
            updateWordDisplay(currentTarget);

            // KALAU KATA SELESAI DIKETIK (ZOMBI MATI)
            if (typedIndex === word.length) {
                let killedZombie = currentTarget; // Simpan ke variabel lokal
                
                // 1. Sembunyikan teks di atas kepalanya biar rapi
                killedZombie.querySelector('.word').style.display = 'none';
                
                // 2. Tambahkan class .dead buat pemicu efek transisi CSS
                killedZombie.classList.add('dead');
                
                // 3. Hapus elemen fisiknya setelah transisi CSS selesai (0.3 detik)
                setTimeout(() => killedZombie.remove(), 300);

                // Lepas kuncian target & turunkan senjata
                currentTarget = null;   
                player.classList.remove('shoot'); 
                
                // Tambah skor 10
                score += 10;
                scoreElement.innerText = score;
            }
        }
    }
});

function updateWordDisplay(zombie) {
    const word = zombie.dataset.word;
    const index = parseInt(zombie.dataset.typedIndex);
    
    const typedPart = `<span style="color: yellow;">${word.substring(0, index)}</span>`;
    const untypedPart = word.substring(index);
    
    zombie.querySelector('.word').innerHTML = typedPart + untypedPart;
}