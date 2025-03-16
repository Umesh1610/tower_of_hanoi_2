// Game state variables
let pegs = [[], [], []]; // Stores discs on each peg
let numDiscs; // Number of discs
let selectedPeg = null; // Currently selected peg
let selectedDisc = null; // Disc chosen for movement
let stepCount = 0; // Move counter
let gameStarted = false; // Track if the game has started

// Ensure background music plays on page load
document.addEventListener('DOMContentLoaded', function () {
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.volume = 0.2;
    
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            document.body.addEventListener('click', function playOnInteraction() {
                backgroundMusic.play();
                document.body.removeEventListener('click', playOnInteraction);
            });
        });
    }

    // Attach event listeners to pegs on page load
    document.querySelectorAll('.peg').forEach((peg, index) => {
        peg.onclick = () => moveDisc(index);
        peg.ontouchstart = (e) => {
            e.preventDefault();
            moveDisc(index);
        };
    });
});

// Start the game
function startGame() {
    numDiscs = parseInt(document.getElementById('discs').value);
    if (numDiscs < 3 || numDiscs > 8) {
        alert("Please enter a number between 3 and 8.");
        return;
    }

    // Reset game state
    gameStarted = true;
    pegs = [[], [], []];
    stepCount = 0;
    document.getElementById('peg1').innerHTML = '';
    document.getElementById('peg2').innerHTML = '';
    document.getElementById('peg3').innerHTML = '';
    document.getElementById('status').textContent = "Game Started!";
    document.getElementById('step-counter').textContent = `Steps: 0`;
    document.getElementById('status').classList.remove('win');

    // Initialize discs on peg A (peg1)
    for (let i = numDiscs; i > 0; i--) {
        pegs[0].push(i);
        const disc = document.createElement('div');
        disc.className = 'disc';
        disc.style.width = `${40 + (i - 1) * 20}px`;
        disc.style.height = '20px';
        disc.style.bottom = `${(numDiscs - i) * 22}px`;
        disc.dataset.size = i;
        document.getElementById('peg1').appendChild(disc);
    }

    // Ensure music plays if autoplay was blocked
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }
}

// Handle disc movement
function moveDisc(targetPeg) {
    const status = document.getElementById('status');
    const stepCounter = document.getElementById('step-counter');
    const winAnimation = document.getElementById('win-animation');

    // Prevent movement if the game hasn't started
    if (!gameStarted) {
        status.textContent = "Please click 'Start Game' to begin!";
        return;
    }

    if (selectedPeg === null) {
        // Selecting a peg
        if (pegs[targetPeg].length > 0) {
            selectedPeg = targetPeg;
            const pegElement = document.getElementById(`peg${targetPeg + 1}`);
            pegElement.classList.add('selected');
            selectedDisc = pegElement.lastChild;
            selectedDisc.classList.add('selected-disc');
            status.textContent = `Selected peg ${String.fromCharCode(65 + targetPeg)}. Choose where to move the disc.`;
        } else {
            status.textContent = "No discs to select on this peg.";
        }
    } else {
        // Moving a disc
        const discSize = pegs[selectedPeg][pegs[selectedPeg].length - 1];
        const targetTop = pegs[targetPeg].length > 0 ? pegs[targetPeg][pegs[targetPeg].length - 1] : Infinity;

        if (discSize < targetTop) {
            // Valid move
            pegs[targetPeg].push(pegs[selectedPeg].pop());
            const disc = document.getElementById(`peg${selectedPeg + 1}`).lastChild;
            disc.style.bottom = `${(pegs[targetPeg].length - 1) * 22}px`;

            // Add bounce and trail animations
            disc.classList.add('bounce');
            disc.classList.add('trail');
            setTimeout(() => {
                disc.classList.remove('bounce');
            }, 500);

            document.getElementById(`peg${targetPeg + 1}`).appendChild(disc);
            stepCount++;
            stepCounter.textContent = `Steps: ${stepCount}`;
            status.textContent = `Moved disc from peg ${String.fromCharCode(65 + selectedPeg)} to peg ${String.fromCharCode(65 + targetPeg)}.`;

            // Check win condition
            if (pegs[2].length === numDiscs) {
                const minSteps = Math.pow(2, numDiscs) - 1;
                let message;
                if (stepCount === minSteps) {
                    message = "You’re a True Fan of Interstellar! Completed in the optimal " + minSteps + " steps!";
                } else {
                    message = "Good Effort! You can do it in " + minSteps + " steps with " + numDiscs + " discs. Try again!";
                }
                status.textContent = message;
                status.classList.add('win');

                // Trigger wormhole pull effect
                const wormhole = document.createElement('div');
                wormhole.className = 'wormhole';
                winAnimation.appendChild(wormhole);

                // Play win sound
                const winSound = document.getElementById('winSound');
                winSound.currentTime = 0;
                winSound.volume = 0.7;
                winSound.play();

                // Apply pull effect to discs on peg C and show travel
                const pegC = document.getElementById('peg3');
                const gameRect = document.getElementById('game').getBoundingClientRect();
                const discs = pegC.getElementsByClassName('disc');
                for (let disc of discs) {
                    const discRect = disc.getBoundingClientRect();
                    const startX = ((discRect.left + discRect.width / 2 - gameRect.left) / gameRect.width) * 100 + '%';
                    const startY = ((discRect.top + discRect.height / 2 - gameRect.top) / gameRect.height) * 100 + '%';
                    disc.style.setProperty('--start-x', startX);
                    disc.style.setProperty('--start-y', startY);
                    disc.classList.add('pullEffect');
                    // Move disc to wormhole container after animation starts
                    setTimeout(() => {
                        winAnimation.appendChild(disc);
                        disc.style.position = 'fixed';
                    }, 100); // Slight delay to sync with animation start
                }

                // Remove wormhole and discs after animation
                setTimeout(() => {
                    winAnimation.removeChild(wormhole);
                    while (winAnimation.firstChild) {
                        winAnimation.removeChild(winAnimation.firstChild);
                    }
                }, 10000); // 10 seconds
            }
        } else {
            // Invalid move
            status.textContent = "Invalid move! A larger disc cannot be placed on a smaller one.";
        }

        // Clear selection
        document.getElementById(`peg${selectedPeg + 1}`).classList.remove('selected');
        if (selectedDisc) {
            selectedDisc.classList.remove('selected-disc');
            selectedDisc = null;
        }
        selectedPeg = null;
    }
}

// Handle window resize for responsiveness
window.addEventListener('resize', () => {
    const game = document.getElementById('game');
    game.style.height = window.innerHeight * 0.5 + 'px';
});

// Background parallax effect
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById('cosmic-background');
    const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
    const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
    bg.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
});

// Enhanced Particle Animation (with comet trails)
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 150;

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        isComet: Math.random() < 0.2
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isComet ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        if (p.isComet) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.speedX * 20, p.y - p.speedY * 20);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animateParticles();

// Gravitational lensing on hover
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById('cosmic-background');
    const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
    const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
    bg.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
    const distortion = Math.min(10, Math.max(-10, (e.clientX / window.innerWidth - 0.5) * 20));
    bg.style.filter = `blur(${Math.abs(distortion / 10)}px) hue-rotate(${distortion}deg)`;
});