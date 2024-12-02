let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.1;

let gameOver = false;
let score = 0;
let gameStarted = false;

// sounds
let jumpSound = new Audio("./sounds/fap.wav");
let pointSound = new Audio("./sounds/getpoint.wav");
let dieSound = new Audio("./sounds/die.wav");

// Medal Images
let goldMedalImg = new Image();
goldMedalImg.src = "./image/coint.png";

let silverMedalImg = new Image();
silverMedalImg.src = "./image/flappy-coin.png";

let bronzeMedalImg = new Image();
bronzeMedalImg.src = "./image/bronze.png";
let NoMedalImg = new Image();
NoMedalImg.src = "./image/cointno.png";
// best score
let bestScore = localStorage.getItem("bestScore") || 0;
//ready
const getReadyImg = new Image();
getReadyImg.src = "./image/edited_message.png";

// game over message
let dieSoundPlayed = false; // Biến kiểm tra âm thanh đã được phát hay chưa

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  birdImg = new Image();
  birdImg.src = "./image/flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "./image/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./image/bottompipe.png";

  requestAnimationFrame(update);
  setInterval(placePipes, 1500);
  document.addEventListener("keydown", moveBird);
};

function update() {
  requestAnimationFrame(update);
  context.clearRect(0, 0, board.width, board.height);

  if (!gameStarted) {
    context.fillStyle = "white";
    context.font = "14px 'Press Start 2P', sans-serif";

    // Vẽ ảnh "Get Ready" khi game bắt đầu
    context.drawImage(
      getReadyImg,
      boardWidth / 2 - getReadyImg.width / 2,
      boardHeight / 4
    );

    return;
  }

  if (gameOver) {
    document.getElementById("score").innerText = score;
    document.getElementById("best-score").innerText = bestScore;
    document.getElementById("game-over").style.display = "block";
    return;
  }

  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    if (!dieSoundPlayed) {
      dieSound.play();
      dieSoundPlayed = true;
    }
    gameOver = true;
    checkBestScore();
  }

  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      pointSound.play();
    }

    if (detectCollision(bird, pipe)) {
      if (!dieSoundPlayed) {
        dieSound.play();
        dieSoundPlayed = true;
      }
      gameOver = true;
      checkBestScore();
    }
  }

  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  context.fillStyle = "white";
  context.font = "40px 'Press Start 2P', sans-serif";
  context.fillText(score, 5, 45);
}

function placePipes() {
  if (gameOver || !gameStarted) {
    return;
  }

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    if (!gameStarted) {
      gameStarted = true;
      return;
    }

    if (gameOver) {
      restartGame();
      return;
    }

    velocityY = -4;
    jumpSound.play();
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function checkBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  let medalImage;
  if (score >= 30) {
    medalImage = goldMedalImg;
  } else if (score >= 20) {
    medalImage = silverMedalImg;
  } else if (score >= 10) {
    medalImage = bronzeMedalImg;
  } else {
    medalImage = NoMedalImg;
  }

  document.getElementById("medal").innerHTML = "Medal: ";
  const medalImageElement = new Image();
  medalImageElement.src = medalImage.src;
  medalImageElement.alt = "Medal";
  document.getElementById("medal").appendChild(medalImageElement);

  document.getElementById("score").innerText = score;
  document.getElementById("best-score").innerText = bestScore;
  document.getElementById("game-over").style.display = "block";
}

function restartGame() {
  gameOver = false;
  score = 0;
  velocityY = 0;
  bird.y = birdY;
  bird.x = birdX;
  pipeArray = [];
  document.getElementById("game-over").style.display = "none";
  dieSoundPlayed = false;

  gameStarted = false;

  context.clearRect(0, 0, board.width, board.height);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  document.addEventListener("keydown", function (e) {
    if (
      !gameStarted &&
      (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")
    ) {
      gameStarted = true;
      velocityY = -4;
      jumpSound.play();
      requestAnimationFrame(update);
      setInterval(placePipes, 1500);
    }
  });
}
