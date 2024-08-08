const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isDragging = false;
let isPaused = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let posX = 0;
let posY = 0;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener('mouseup', (e) => {
    if (isDragging) {
        posX = 0;
        posY = 0;
        endX = e.offsetX;
        endY = e.offsetY;
        isDragging = false;
        const magnitude = calcDist(startX, startY, endX, endY);
        //console.log(`Drag:${magnitude}`);
        shoot(magnitude);
    }
});

function calcDist(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        posX = e.offsetX;
        posY = e.offsetY;
    } else {
        startX = 0;
        startY = 0;
        posX = 0;
        posY = 0;
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }
});

// var weaponImage = new Image();
// weaponImage.src = 'archery.png';

let score = 0;

var arrowImage = new Image();
arrowImage.src = 'arrow.png';

var bottleImage = new Image();
bottleImage.src = 'bottle.png';

class Weapon {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2 + 50;
        this.height = 30;
        this.baseWidth = 100;
        this.arrowFired = false;
    }

    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.save();

        const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        let dragDist = 0;
        if (isDragging) {
            dragDist = calcDist(startX, startY, posX, posY) / 20;
        }

        const arrowWidth = this.baseWidth + dragDist;

        //arrow
        ctx.fillRect(0, -this.height / 2, arrowWidth, this.height);

        //bow
        ctx.beginPath();
        ctx.arc(-10, 0, 50, Math.PI / 2, 3 * Math.PI / 2, false);
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 5;
        ctx.stroke();

        const arrowOffset = 20;
        if (!this.arrowFired) {
            ctx.drawImage(arrowImage, -arrowOffset - dragDist, -arrowImage.height / 2);
        }

        ctx.restore();
    }

    fireArrow() {
        this.arrowFired = true;
    }

    reloadArrow() {
        this.arrowFired = false;
    }
}

let weapon1 = new Weapon();

class Arrow {
    constructor(x, y, speedX, speedY, radius, angle) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.radius = radius;
        this.angle = angle;
        this.path = [];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.path.push({ x: this.x, y: this.y });
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obstacle = obstacles[i];
            if (
                this.x > obstacle.x &&
                this.x < obstacle.x + obstacle.width &&
                this.y > obstacle.y &&
                this.y < obstacle.y + obstacle.height
            ) {
                score += 5;
                document.getElementById('score').innerText = score;
                obstacles.splice(i, 1);
                return;
            }
        }
    }

    draw(ctx) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        if (this.path.length > 1) {
            for (let i = 0; i < this.path.length - 1; i++) {
                ctx.moveTo(this.path[i].x, this.path[i].y);
                ctx.lineTo(this.path[i + 1].x, this.path[i + 1].y);
            }
        }
        ctx.stroke();
        ctx.closePath();

        ctx.setLineDash([]);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(arrowImage, - arrowImage.width / 2, - arrowImage.height / 2);
        ctx.restore()
    }
}

let shootval = 20;
function shoot(magnitude) {
    if (magnitude >= 0.8) {
        const angle = Math.atan2(mouse.y - weapon1.y, mouse.x - weapon1.x);
        const speed = magnitude / shootval;
        const speedX = -Math.cos(angle) * speed;
        const speedY = -Math.sin(angle) * speed;
        let radius = 3;

        weapon1.fireArrow();
        arrows.push(new Arrow(weapon1.x, weapon1.y, speedX, speedY, radius, angle));
        //console.log(magnitude);
        console.log('arrow released');

        setTimeout(() => {
            weapon1.reloadArrow();
        }, 500);
    }
}

let obstSpeed = 3;
class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.speed = obstSpeed;
    }
    draw(ctx) {
        ctx.fillStyle = 'red';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(bottleImage, this.x, this.y, this.width, this.height);
    }
    update() {
        this.y += this.speed;
    }
}

let arrows = [];
let obstacles = [new Obstacle(100, 100)];

let mouse = { x: 0, y: 0 };
const backgroundImage = new Image();
backgroundImage.src = './bg.png';

function update() {
    arrows.forEach(arr => arr.update());
    obstacles.forEach(obstacle => obstacle.update());
    arrows = arrows.filter(arrow => (arrow.x > 0 && arrow.x < canvas.width && arrow.y > 0 && arrow.y < canvas.height));
    obstacles = obstacles.filter(obstacle => (obstacle.x > 0 && obstacle.x < canvas.width && obstacle.y > 0 && obstacle.y < canvas.height));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    obstacles.forEach(obs => obs.draw(ctx));
    weapon1.draw(ctx);
    obstacles.forEach(obst => obst.draw(ctx));
    arrows.forEach(arr => arr.draw(ctx));
    console.log(arrows.length);
}

let time = 0;
function animate() {
    if (!isPaused) {
        time += 0.25;
        if (Number.isInteger(time) && time % 60 == 0) {
            obstacles.push(new Obstacle(Math.random() * canvas.width, 20));
            obstSpeed += 0.25;
            //console.log(obstacles.length);
        }
        update();
        draw();
    }
    requestAnimationFrame(animate);
}

document.getElementById('pauseButton').addEventListener('click', () => {
    if (!isPaused) {
        isPaused = true;
        document.getElementById('pauseButton').innerText = '▐▐ ';
    }
    else {
        isPaused = false;
        document.getElementById('pauseButton').innerText = ' ▶ ';
    }
})

arrowImage.onload = () => {
    animate();
    console.log('Canvas loaded');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};