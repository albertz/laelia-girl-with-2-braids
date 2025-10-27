
const gameContainer = document.getElementById('game-container');
const playerElement = document.getElementById('player');
const bikeElement = document.getElementById('bike');
const horseElement = document.getElementById('horse');
const backgroundLayers = document.querySelectorAll('.layer');

const gameState = {
    player: {
        x: 100,
        y: 0, // Start on the ground
        dx: 0, // pixels per second
        dy: 0, // pixels per second
        onGround: true,
        onBike: false, // Start as walking girl
        onHorse: false
    },
    bike: {
        x: 200,
        y: 0,
    },
    horse: {
        x: 400,
        y: 0,
    },
    camera: {
        x: 0,
        y: 0
    },
    keys: {},
    gravity: 1800, // pixels per second^2
    ground: 0,
    worldWidth: 5000,
    baseWidth: 1920,
    baseHeight: 1080,
    debugMode: false
};

function handleResize() {
    const scale = Math.min(window.innerWidth / gameState.baseWidth, window.innerHeight / gameState.baseHeight);
    gameContainer.style.transform = `scale(${scale})`;
    gameContainer.style.left = `${(window.innerWidth - gameState.baseWidth * scale) / 2}px`;
    gameContainer.style.top = `${(window.innerHeight - gameState.baseHeight * scale) / 2}px`;
}

window.addEventListener('resize', handleResize);

function toggleMount() {
    if (gameState.player.onBike || gameState.player.onHorse) {
        gameState.player.onBike = false;
        gameState.player.onHorse = false;
    } else {
        const distToBike = Math.abs(gameState.player.x - gameState.bike.x);
        const distToHorse = Math.abs(gameState.player.x - gameState.horse.x);

        if (distToBike < 100 && distToBike < distToHorse) {
            gameState.player.onBike = true;
        } else if (distToHorse < 100) {
            gameState.player.onHorse = true;
        }
    }
}

document.addEventListener('keydown', (event) => {
    gameState.keys[event.key] = true;
    if (event.key === 'd') {
        gameState.debugMode = !gameState.debugMode;
    }
    if (event.key === ' ') { // Space key
        toggleMount();
    }
});

document.addEventListener('keyup', (event) => {
    gameState.keys[event.key] = false;
});

let lastTime = 0;

function gameLoop(currentTime) {
    if (!lastTime) {
        lastTime = currentTime;
    }
    const deltaTime = (currentTime - lastTime) / 1000; // Delta time in seconds
    lastTime = currentTime;
    // Player speed
    let speed = gameState.debugMode ? 1200 : 300;
    if (gameState.player.onBike || gameState.player.onHorse) {
        speed *= 2; // Double the speed when on a mount
    }

    // Player movement
    if (gameState.keys['ArrowRight']) {
        gameState.player.dx = speed;
    } else if (gameState.keys['ArrowLeft']) {
        gameState.player.dx = -speed;
    } else {
        gameState.player.dx = 0;
    }

    if (gameState.keys['ArrowUp'] && gameState.player.onGround) {
        gameState.player.dy = -900; // Jump up
        gameState.player.onGround = false;
    }

    // Update player position
    gameState.player.x += gameState.player.dx * deltaTime;
    gameState.player.y += gameState.player.dy * deltaTime;

    // Apply gravity
    if (!gameState.player.onGround) {
        gameState.player.dy += gameState.gravity * deltaTime;
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

    // Update horse position
    if (gameState.player.onHorse) {
        gameState.horse.x = gameState.player.x;
        gameState.horse.y = gameState.player.y;
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

    // Show/hide player graphics and position on bike or horse
    let playerX = gameState.player.x;
    let playerY = gameState.player.y;
    if (gameState.player.onBike) {
        playerElement.innerHTML = `<img src="assets/girl.svg" alt="Girl on a bicycle">`;
        playerX += 40; // Adjust to center the girl on the bike
        playerY -= 80; // Adjust to make her sit on the bike
    } else if (gameState.player.onHorse) {
        playerElement.innerHTML = `<img src="assets/girl.svg" alt="Girl on a horse">`;
        playerX += 50; // Adjust to center the girl on the horse
        playerY -= 80; // Adjust to make her sit on the horse
    } else {
        playerElement.innerHTML = `<img src="assets/walking-girl.svg" alt="Walking girl">`;
    }

    // Apply transformations
    const playerScreenX = playerX - gameState.camera.x;
    playerElement.style.transform = `translateX(${playerScreenX}px) translateY(${playerY}px)`;

    const bikeScreenX = gameState.bike.x - gameState.camera.x;
    bikeElement.style.transform = `translateX(${bikeScreenX}px) translateY(${gameState.bike.y}px)`;

    const horseScreenX = gameState.horse.x - gameState.camera.x;
    horseElement.style.transform = `translateX(${horseScreenX}px) translateY(${gameState.horse.y}px)`;

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
requestAnimationFrame(gameLoop);

// Touch controls
const touchLeft = document.getElementById('touch-left');
const touchRight = document.getElementById('touch-right');
const touchJump = document.getElementById('touch-jump');
const touchMount = document.getElementById('touch-mount');
const fullscreenBtn = document.getElementById('fullscreen-btn');

fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    setTimeout(handleResize, 100);
});

touchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); gameState.keys['ArrowLeft'] = true; });
touchLeft.addEventListener('touchend', () => { gameState.keys['ArrowLeft'] = false; });

touchRight.addEventListener('touchstart', (e) => { e.preventDefault(); gameState.keys['ArrowRight'] = true; });
touchRight.addEventListener('touchend', () => { gameState.keys['ArrowRight'] = false; });

touchJump.addEventListener('touchstart', (e) => { e.preventDefault(); gameState.keys['ArrowUp'] = true; });
touchJump.addEventListener('touchend', () => { gameState.keys['ArrowUp'] = false; });

touchMount.addEventListener('touchstart', (e) => { e.preventDefault(); toggleMount(); });

function checkOrientation() {
    const orientationMessage = document.getElementById('orientation-message');
    const gameContainer = document.getElementById('game-container');
    if (!orientationMessage) {
        const message = document.createElement('div');
        message.id = 'orientation-message';
        message.innerHTML = 'Please rotate your device to landscape mode for the best experience.';
        message.style.position = 'fixed';
        message.style.top = '0';
        message.style.left = '0';
        message.style.width = '100%';
        message.style.height = '100%';
        message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        message.style.color = 'white';
        message.style.display = 'flex';
        message.style.justifyContent = 'center';
        message.style.alignItems = 'center';
        message.style.zIndex = '100';
        document.body.appendChild(message);
    }

    if (window.innerHeight > window.innerWidth) {
        document.getElementById('orientation-message').style.display = 'flex';
        gameContainer.style.display = 'none';
    } else {
        document.getElementById('orientation-message').style.display = 'none';
        gameContainer.style.display = 'block';
    }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('load', () => {
    handleResize();
    checkOrientation();
});