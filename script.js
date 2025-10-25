
const playerElement = document.getElementById('player');
const backgroundLayers = document.querySelectorAll('.layer');

const gameState = {
    player: {
        x: 100,
        y: 0,
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
    ground: 0,
    worldWidth: 5000 // Increased world width
};

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
        gameState.player.dy = -12; // Jump up
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
    // Use a fixed player width for boundary check for now
    if (gameState.player.x > gameState.worldWidth - 100) {
        gameState.player.x = gameState.worldWidth - 100;
    }

    // Update camera
    const cameraDeadZone = 300;
    if (gameState.player.x > gameState.camera.x + window.innerWidth - cameraDeadZone) {
        gameState.camera.x = gameState.player.x - window.innerWidth + cameraDeadZone;
    }
    if (gameState.player.x < gameState.camera.x + cameraDeadZone) {
        gameState.camera.x = gameState.player.x - cameraDeadZone;
    }

    // Clamp camera to world boundaries
    if (gameState.camera.x < 0) {
        gameState.camera.x = 0;
    }
    if (gameState.camera.x > gameState.worldWidth - window.innerWidth) {
        gameState.camera.x = gameState.worldWidth - window.innerWidth;
    }

    // Apply transformations (fixed translateY)
    playerElement.style.transform = `translateX(${gameState.player.x - gameState.camera.x}px) translateY(${gameState.player.y}px)`;

    backgroundLayers.forEach((layer, index) => {
        const parallaxFactor = (index + 1) * 0.2;
        const backgroundOffset = -gameState.camera.x * parallaxFactor;
        layer.style.backgroundPositionX = `${backgroundOffset}px`;
    });

    requestAnimationFrame(gameLoop);
}

// Initial setup
gameLoop();