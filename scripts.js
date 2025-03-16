document.addEventListener('DOMContentLoaded', function () {
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Try to play the music automatically when the page loads
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
    const numDiscs = parseInt(document.getElementById('discs').value);
    if (numDiscs < 3 || numDiscs > 8) {
        alert("Please enter a number between 3 and 8.");
        return;
    }

    document.getElementById('status').textContent = "Game Started!";
    document.getElementById('step-counter').textContent = `Steps: 0`;

    // Ensure background music plays if autoplay was blocked
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic.paused) {
        backgroundMusic.volume = 0.2;
        backgroundMusic.play();
    }
}

// Handle disc movement (basic)
function moveDisc(targetPeg) {
    const status = document.getElementById('status');
    const stepCounter = document.getElementById('step-counter');

    if (selectedPeg === null) {
        selectedPeg = targetPeg;
        status.textContent = `Selected peg ${targetPeg + 1}. Choose where to move the disc.`;
    } else {
        stepCount++;
        stepCounter.textContent = `Steps: ${stepCount}`;
        status.textContent = `Moved disc from peg ${selectedPeg + 1} to peg ${targetPeg + 1}.`;
        selectedPeg = null;
    }
}
