// JavaScript to handle the 3D visualization
// You can add more functionality here, such as animations or interactions

document.addEventListener('DOMContentLoaded', () => {
    // Example of animating the planets
    const mercury = document.querySelector('#mercury');
    let angle = 0;

    function animate() {
        angle += 0.01;
        const x = 5 * Math.cos(angle);
        const z = 5 * Math.sin(angle);
        mercury.setAttribute('translation', `${x} 0 ${z}`);
        requestAnimationFrame(animate);
    }

    animate();
});
