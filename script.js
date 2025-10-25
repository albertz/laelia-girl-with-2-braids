
const player = document.getElementById('player');
const backgroundLayers = document.querySelectorAll('.layer');
const wheels = document.querySelectorAll('.wheel svg');

let speed = 1;

function updateAnimationSpeed() {
    backgroundLayers.forEach((layer, index) => {
        const baseDuration = [20, 15, 10];
        layer.style.animationDuration = `${baseDuration[index] / speed}s`;
    });

    wheels.forEach(wheel => {
        wheel.style.animationDuration = `${1 / speed}s`;
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        speed = Math.min(speed + 0.2, 5);
    } else if (event.key === 'ArrowLeft') {
        speed = Math.max(speed - 0.2, 0.2);
    }
    updateAnimationSpeed();
});

// Initial setup to apply the base speed.
updateAnimationSpeed();