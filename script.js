
const gameContainer = document.getElementById('game-container');
const playerElement = document.getElementById('player');
const backgroundLayers = document.querySelectorAll('.layer');

const gameState = {
    player: {
        x: 100,
        y: 880, // Start on the ground
        dx: 0,
        dy: 0,
        onGround: true,
        onBike: true
    },
    camera: {
        x: 0,
        y: 0
    },
    keys: {},
    gravity: 0.5,
    ground: 880,
    worldWidth: 5000,
    baseWidth: 1920,
    baseHeight: 1080
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

document.addEventListener('keydown', (event) => {
    gameState.keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    gameState.keys[event.key] = false;
});

function gameLoop() {
    // Player movement
    if (gameState.keys['ArrowRight']) {
        gameState.player.dx = 5;
    } else if (gameState.keys['ArrowLeft']) {
        gameState.player.dx = -5;
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

    // Update camera
    gameState.camera.x = gameState.player.x - (gameState.baseWidth / 2);

    // Clamp camera to world boundaries
    if (gameState.camera.x < 0) {
        gameState.camera.x = 0;
    }
    if (gameState.camera.x > gameState.worldWidth - gameState.baseWidth) {
        gameState.camera.x = gameState.worldWidth - gameState.baseWidth;
    }

    // Apply transformations
    const playerScreenX = gameState.player.x - gameState.camera.x;
    playerElement.style.transform = `translateX(${playerScreenX}px) translateY(${gameState.player.y - gameState.ground}px)`;

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