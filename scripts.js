// Game state variables
let pegs = [[], [], []]; // Arrays to store discs on each peg
let numDiscs; // Number of discs
let selectedPeg = null; // Currently selected peg (null if none)
let selectedDisc = null; // Selected disc for moving
let stepCount = 0; // Track number of moves

document.addEventListener('DOMContentLoaded', function () {
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Try playing music on page load
    backgroundMusic.volume = 0.2;
    const playPromise = backgroundMusic.play();

    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay blocked - Play on first user interaction
            console.log("Autoplay blocked. Waiting for user interaction...");
            document.body.addEventListener('click', function playOnInteraction() {
                backgroundMusic.play();
                document.body.removeEventListener('click', playOnInteraction);
            });
        });
    }
});

// Start the game
function startGame() {
    numDiscs = parseInt(document.getElementById('discs').value);
    if (numDiscs < 3 || numDiscs > 8) {
        alert("Please enter a number between 3 and 8.");
        return;
    }

    // Reset game state
    pegs = [[], [], []];
    stepCount = 0; // Reset step counter
    document.getElementById('peg1').innerHTML = '';
    document.getElementById('peg2').innerHTML = '';
    document.getElementById('peg3').innerHTML = '';
    document.getElementById('status').textContent = "Game Started!";
    document.getElementById('step-counter').textContent = `Steps: 0`;

    // Initialize discs on peg A (peg1)
    for (let i = numDiscs; i > 0; i--) {
        pegs[0].push(i);
        const disc = document.createElement('div');
        disc.className = 'disc';
        disc.style.width = `${40 + (i - 1) * 20}px`; // Scale width with size
        disc.style.height = '20px';
        disc.style.bottom = `${50 + (numDiscs - i) * 22}px`; // Position above base
        disc.dataset.size = i;
        document.getElementById('peg1').appendChild(disc);
    }

    // Add click handlers to pegs
    document.querySelectorAll('.peg').forEach((peg, index) => {
        peg.onclick = () => moveDisc(index);
    });

    // Ensure background music plays if autoplay was blocked
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic.paused) {
        backgroundMusic.volume = 0.2;
        backgroundMusic.play();
    }
}

// Handle disc movement
function moveDisc(targetPeg) {
    const status = document.getElementById('status');
    const stepCounter = document.getElementById('step-counter');

    if (selectedPeg === null) {
        // Selecting a peg
        if (pegs[targetPeg].length > 0) {
            selectedPeg = targetPeg;
            const pegElement = document.getElementById(`peg${targetPeg + 1}`);
            pegElement.classList.add('selected');
            selectedDisc = pegElement.lastChild;
            selectedDisc.classList.add('selected-disc');
            status.textContent = `Selected peg ${targetPeg + 1}. Choose where to move the disc.`;
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
            disc.style.bottom = `${50 + (pegs[targetPeg].length - 1) * 22}px`;

            // Add bounce animation
            disc.classList.add('bounce');
            setTimeout(() => {
                disc.classList.remove('bounce');
            }, 500);

            document.getElementById(`peg${targetPeg + 1}`).appendChild(disc);
            stepCount++; // Increment step counter
            stepCounter.textContent = `Steps: ${stepCount}`;
            status.textContent = `Moved disc from peg ${selectedPeg + 1} to peg ${targetPeg + 1}.`;

            // Check win condition
            if (pegs[2].length === numDiscs) {
                const minSteps = Math.pow(2, numDiscs) - 1; // Minimum steps = 2^n - 1
                const message = stepCount === minSteps
                    ? "You’ve Conquered the Cosmos! Completed in the minimum steps!"
                    : `You’ve Conquered the Cosmos! Completed in ${stepCount} steps (Minimum: ${minSteps}).`;
                status.textContent = message;
                document.body.style.background = "url('./background.jpg') no-repeat center center fixed";
                document.body.style.backgroundSize = "cover";
                // Trigger wormhole animation
                const winAnimation = document.getElementById('win-animation');
                const wormhole = document.createElement('div');
                wormhole.className = 'wormhole';
                winAnimation.appendChild(wormhole);
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

// Handle window resize for starfield
window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
