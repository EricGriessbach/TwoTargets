
const gameContainer = document.getElementById("gameContainer");
const toggleMappingCheckbox = document.getElementById("toggleMapping");
const instructions = document.querySelector("p");
const pointsReceivedDisplay = document.getElementById("pointsReceived");
const canvas = document.getElementById("gameCanvas");
const scoreDisplay = document.querySelector(".scoreDisplay");


const ctx = canvas.getContext('2d');
let score = 0;
let startTime = new Date().getTime();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let trials = 0;
const maxTrials = 5;
const breakDuration = 10; // 30 seconds
let breakTime = breakDuration;
let blockScores = [];
let onBreak = false;

let targetsCollected = 0;

let currentMapping = 0;

toggleMappingCheckbox.addEventListener('change', () => {
  currentMapping = toggleMappingCheckbox.checked ? 1 : 0;
});

const circles = [
  { x: canvas.width / 2, y: canvas.height / 2, size: 10, speed: 6 },
  { x: canvas.width / 3, y: canvas.height / 3, size: 10, speed: 6 }
];

const targets = [
  { x: 0, y: 0, size: 10, collected: false },
  { x: 0, y: 0, size: 10, collected: false }
];

const keys = {};

// Key mappings
const mappings = [
  { w: 'left', s: 'right', j: 'up', l: 'down', a: 'up', d: 'down', i: 'left', k: 'right' },
  { w: 'up', s: 'down', a: 'left', d: 'right', i: 'up', k: 'down', j: 'left', l: 'right' }
];

function setNewTargets() {
  targets.forEach(target => {
      target.x = Math.random() * (canvas.width - target.size);
      target.y = Math.random() * (canvas.height - target.size);
      target.collected = false;
  });
  targetsCollected = 0;
}

function drawCircles() {
  const colors = ['red', 'blue'];
  circles.forEach((circle, index) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
      ctx.fillStyle = colors[index]; // Use the index to determine the color
      ctx.fill();
      ctx.closePath();
  });
}

function drawTargets() {
  const colors = ['lightsalmon', 'lightskyblue'];
  targets.forEach((target, index) => {
      if (!target.collected) {
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
          ctx.fillStyle = colors[index]; // Use the index to determine the color
          ctx.fill();
          ctx.closePath();
      }
  });
}

function checkCollisions() {
  circles.forEach((circle, circleIndex) => {
    targets.forEach((target, targetIndex) => {
      if (!target.collected && circleIndex === targetIndex) { // Only count collisions if circle and target indices match
        const distance = Math.sqrt((circle.x - target.x) ** 2 + (circle.y - target.y) ** 2);
        if (distance < circle.size + target.size) {
          const currentTime = new Date().getTime();
          const timeTaken = (currentTime - startTime) / 1000;
          startTime = currentTime;
          const currentScore = calculateScore(timeTaken);
          score += currentScore;
          scoreDisplay.textContent = score;
          targetsCollected += 1;
          target.collected = true;
          if(targetsCollected === 2) {
            setNewTargets();
            trials += 1;
          }
          if (trials >= maxTrials) {
            startBreak();
          }
        }
      }
    });
  });
}


function calculateScore(timeTaken) {
  let points;
  if (timeTaken <= 0.2) {
    points = 100;
  } else if (timeTaken <= 3) {
    points = Math.round(100 - (timeTaken - 0.2) * (100 - 20) / (3 - 0.2));
  } else {
    points = 20;
  }
    showPointsReceived(points);
    return points;
  }

function showPointsReceived(points) {
    pointsReceivedDisplay.textContent = `+${points}`;
    pointsReceivedDisplay.style.display = 'block';

    setTimeout(() => {
      pointsReceivedDisplay.style.display = 'none';
    }, 500);
  }
function keepCirclesInBounds() {
    circles.forEach(circle => {
        if (circle.x - circle.size < 0) circle.x = circle.size;
        if (circle.x + circle.size > canvas.width) circle.x = canvas.width - circle.size;
        if (circle.y - circle.size < 0) circle.y = circle.size;
        if (circle.y + circle.size > canvas.height) circle.y = canvas.height - circle.size;
    });
}

function handleKeyDown(event) {
keys[event.key] = true; // Set the pressed key to true
if (onBreak && event.key === "Enter" && breakTime <= 0) {
    onBreak = false;
    breakTime = breakDuration;
    window.removeEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyDown); // Reattach handleKeyDown event listener
    window.addEventListener("keyup", handleKeyUp);
}
}

function handleKeyUp(event) {
    keys[event.key] = false; // Set the released key to false
}

function update() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

if (onBreak) {
    drawBreakInfo();
} else {
    if (trials >= maxTrials) {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        startBreak();
    }

    if (breakTime < breakDuration) {
        drawBreakInfo();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update circle positions based on pressed keys and current mapping
        const mapping = mappings[currentMapping];
        if (keys['w']) moveCircle(mapping.w, circles[0]);
        if (keys['s']) moveCircle(mapping.s, circles[0]);
        if (keys['j']) moveCircle(mapping.j, circles[0]);
        if (keys['l']) moveCircle(mapping.l, circles[0]);
        if (keys['a']) moveCircle(mapping.a, circles[1]);
        if (keys['d']) moveCircle(mapping.d, circles[1]);
        if (keys['i']) moveCircle(mapping.i, circles[1]);
        if (keys['k']) moveCircle(mapping.k, circles[1]);
        
        keepCirclesInBounds();
        checkCollisions();
        drawCircles();
        drawTargets();
    }
}
requestAnimationFrame(update);
}

function moveCircle(direction, circle) {
  switch (direction) {
    case 'left':
      circle.x -= circle.speed;
      break;
    case 'right':
      circle.x += circle.speed;
      break;
    case 'up':
      circle.y -= circle.speed;
      break;
    case 'down':
      circle.y += circle.speed;
      break;
  }
}

function startBreak() {
  onBreak = true;
  blockScores.push(score);
  score = 0;
  scoreDisplay.textContent = score;
  trials = 0;

  const breakInterval = setInterval(() => {
    breakTime -= 1;
    if (breakTime <= 0) {
      clearInterval(breakInterval);
      window.addEventListener("keydown", handleKeyDown);
    }
  }, 1000);
}

function drawBreakInfo() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`Block Score: ${blockScores[blockScores.length - 1]}`, canvas.width / 2, canvas.height / 2 - 50);
  ctx.fillText(`Highest Block Score: ${Math.max(...blockScores)}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`Break Time Remaining: ${breakTime}s`, canvas.width / 2, canvas.height / 2 + 50);
  
  if (breakTime <= 0) {
    ctx.fillText("Press Enter to continue", canvas.width / 2, canvas.height / 2 + 100);
  }
}

setNewTargets();
update();

toggleMappingCheckbox.addEventListener('change', () => {
  currentMapping = (currentMapping + 1) % mappings.length;
});

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);