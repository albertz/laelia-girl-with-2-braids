
const gameContainer = document.getElementById('game-container');
const playerElement = document.getElementById('player');
const bikeElement = document.getElementById('bike');
const horseElement = document.getElementById('horse');

function initializeAnimatedElements() {
    const elements = [
        { id: 'cloud1', speedX: 20, parallaxFactor: 0.1 },
        { id: 'cloud2', speedX: -30, parallaxFactor: 0.15 },
        { id: 'cloud3', speedX: 25, parallaxFactor: 0.2 },
        { id: 'cloud4', speedX: -35, parallaxFactor: 0.25 },
        { id: 'bird1', speedX: 100, parallaxFactor: 0.1 },
        { id: 'bird2', speedX: -120, parallaxFactor: 0.15 },
        { id: 'bird3', speedX: 110, parallaxFactor: 0.1 },
        { id: 'bird4', speedX: -130, parallaxFactor: 0.2 },
        { id: 'bird5', speedX: 140, parallaxFactor: 0.25 },
        { id: 'bird6', speedX: -150, parallaxFactor: 0.2 },
        { id: 'animal1', speedX: 10, parallaxFactor: 0.4 },
        { id: 'animal2', speedX: 15, parallaxFactor: 0.4 },
    ];

    elements.forEach(el => {
        const element = document.getElementById(el.id);
        if (element) {
            const transform = element.getAttribute('transform');
            const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
            const initialX = match ? parseFloat(match[1]) : 0;
            const initialY = match ? parseFloat(match[2]) : 0;

            gameState.animatedElements.push({
                element,
                initialX,
                initialY,
                currentX: initialX,
                speedX: el.speedX,
                parallaxFactor: el.parallaxFactor,
                initialTransform: transform
            });
        }
    });
}

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
    debugMode: false,
    animatedElements: []
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

    // Update animated elements
    gameState.animatedElements.forEach(el => {
        el.currentX += el.speedX * deltaTime;

        const screenX = el.currentX - gameState.camera.x * el.parallaxFactor;

        if (el.speedX > 0 && screenX > gameState.baseWidth) {
            el.currentX -= (gameState.worldWidth + 200);
        } else if (el.speedX < 0 && screenX < -200) {
            el.currentX += (gameState.worldWidth + 200);
        }

        el.element.setAttribute('transform', `translate(${screenX}, ${el.initialY}) ${el.initialTransform.replace(/translate\([^)]+\)/, '')}`.trim());
    });

    // Debug mode visual indicator
    if (gameState.debugMode) {
        playerElement.classList.add('debug-mode');
    } else {
        playerElement.classList.remove('debug-mode');
    }

    requestAnimationFrame(gameLoop);
}

// Initial setup
handleResize();
initializeAnimatedElements();
requestAnimationFrame(gameLoop);