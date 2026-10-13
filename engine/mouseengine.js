
const canvas = document.getElementById("sex");

export let mouse = {
    x: 0,
    y: 0,
    mouseDown: false
}

if (canvas) {
    canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener("mouseleave", () => {
        mouse.x = 0;
        mouse.y = 0;
    });
}