const player = document.getElementById('player');
const backgroundLayers = document.querySelectorAll('.layer');
const wheels = document.querySelectorAll('.wheel svg');

let speed = 1;
let baseSpeed = 1;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        baseSpeed = Math.min(baseSpeed + 0.1, 3);
    } else if (event.key === 'ArrowLeft') {
        baseSpeed = Math.max(baseSpeed - 0.1, 0.5);
    }
});

function update() {
    speed = baseSpeed;

    backgroundLayers.forEach((layer, index) => {
        const duration = 20 - (index * 5);
        layer.style.animationDuration = `${duration / speed}s`;
    });

    wheels.forEach(wheel => {
        wheel.style.animationDuration = `${1 / speed}s`;
    });

    requestAnimationFrame(update);
}

update();