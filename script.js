
const gameContainer = document.getElementById('game-container');
const playerElement = document.getElementById('player');
const bikeElement = document.getElementById('bike');
const backgroundLayers = document.querySelectorAll('.layer');

const gameState = {
    player: {
        x: 100,
        y: 0, // Start on the ground
        dx: 0,
        dy: 0,
        onGround: true,
        onBike: false // Start as walking girl
    },
    bike: {
        x: 200,
        y: 0,
    },
    camera: {
        x: 0,
        y: 0
    },
    keys: {},
    gravity: 0.5,
    ground: 0,
    worldWidth: 5000,
    baseWidth: 1920,
    baseHeight: 1080,
    debugMode: false
};

function handleResize() {
    const scaleX = window.innerWidth / gameState.baseWidth;
    const scaleY = window.innerHeight / gameState.baseHeight;
    const scale = Math.min(scaleX, scaleY);

    const newWidth = gameState.baseWidth * scale;
    const newHeight = gameState.baseHeight * scale;

    const offsetX = (window.innerWidth - newWidth) / 2;
    const offsetY = (window.innerHeight - newHeight) / 2;

    gameContainer.style.transform = `scale(${scale})`;
    gameContainer.style.left = `${offsetX}px`;
    gameContainer.style.top = `${offsetY}px`;
}

window.addEventListener('resize', handleResize);

function toggleBike() {
    if (gameState.player.onBike) {
        gameState.player.onBike = false;
    } else {
        const distance = Math.abs(gameState.player.x - gameState.bike.x);
        if (distance < 100) { // Only get on if close to the bike
            gameState.player.onBike = true;
        }
    }
}

document.addEventListener('keydown', (event) => {
    gameState.keys[event.key] = true;
    if (event.key === 'd') {
        gameState.debugMode = !gameState.debugMode;
    }
    if (event.key === ' ') { // Space key
        toggleBike();
    }
});

document.addEventListener('keyup', (event) => {
    gameState.keys[event.key] = false;
});

function gameLoop() {
    // Player speed
    const speed = gameState.debugMode ? 20 : 5;

    // Player movement
    if (gameState.keys['ArrowRight']) {
        gameState.player.dx = speed;
    } else if (gameState.keys['ArrowLeft']) {
        gameState.player.dx = -speed;
    } else {
        gameState.player.dx = 0;
    }

    if (gameState.keys['ArrowUp'] && gameState.player.onGround) {
        gameState.player.dy = -15; // Jump up
        gameState.player.onGround = false;
    }

    // Update player position
    gameState.player.x += gameState.player.dx;
    gameState.player.y += gameState.player.dy;

    // Apply gravity
    if (!gameState.player.onGround) {
        gameState.player.dy += gameState.gravity;
    }

    // Collision with ground
    if (gameState.player.y > gameState.ground) {
        gameState.player.y = gameState.ground;
        gameState.player.dy = 0;
        gameState.player.onGround = true;
    }

    // World boundaries
    if (gameState.player.x < 0) {
        gameState.player.x = 0;
    }
    if (gameState.player.x > gameState.worldWidth - 100) { // Use a fixed player width for now
        gameState.player.x = gameState.worldWidth - 100;
    }

    // Update bike position
    if (gameState.player.onBike) {
        gameState.bike.x = gameState.player.x;
        gameState.bike.y = gameState.player.y;
    }

    // Update camera with smoothing
    const playerWidth = 80; // Corrected player width (100 * 0.8 scale)
    const targetCameraX = gameState.player.x - (gameState.baseWidth / 2) + (playerWidth / 2);
    const smoothing = 0.05; // Lower value for smoother camera
    gameState.camera.x += (targetCameraX - gameState.camera.x) * smoothing;

    // Clamp camera to world boundaries
    if (gameState.camera.x < 0) {
        gameState.camera.x = 0;
    }
    if (gameState.camera.x > gameState.worldWidth - gameState.baseWidth) {
        gameState.camera.x = gameState.worldWidth - gameState.baseWidth;
    }

    // Apply transformations
    const playerScreenX = gameState.player.x - gameState.camera.x;
    playerElement.style.transform = `translateX(${playerScreenX}px) translateY(${gameState.player.y}px)`;

    const bikeScreenX = gameState.bike.x - gameState.camera.x;
    bikeElement.style.transform = `translateX(${bikeScreenX}px) translateY(${gameState.bike.y}px)`;

    // Debug mode visual indicator
    if (gameState.debugMode) {
        playerElement.classList.add('debug-mode');
    } else {
        playerElement.classList.remove('debug-mode');
    }

    backgroundLayers.forEach((layer, index) => {
        const parallaxFactor = (index + 1) * 0.2;
        const backgroundOffset = -gameState.camera.x * parallaxFactor;
        layer.style.backgroundPositionX = `${backgroundOffset}px`;
    });

    requestAnimationFrame(gameLoop);
}

// Initial setup
handleResize();
gameLoop();