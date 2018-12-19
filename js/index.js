const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const wd = canvas.width;
const ht = canvas.height;

var player;
var ball;
var screenText;
const line6 = (y = 150) => range(30, 300, 45).map(x => [x, y]);

var lvl1;
var lvl2;
var lvl3;
var lvl4;
var lvl5;
var lvl6;
var lvls;

//start game!
reStartGame();

function range(a, b, c = 1) {
  let acc = [];
  for (let i = a; i < b; i += c) {
    acc.push(i);
  }
  return acc;
}
window.onload = mainLoop = setInterval(update, 1000 / 100);
function update() {
  // clear
  ctx.clearRect(0, 0, wd, ht);
  showLives();
  textOnScreen();
  //draw
  drawBall(ball);
  drawPlayer(player);
  // detect
  collisionDetect();
  // move the ball
  ball.x += ball.vX;
  ball.y += ball.vY;
  nextLevel();
}
function showLives() {
  ctx.fillStyle = "white";
  ctx.font = `${16}px serif`;
  ctx.fillText(player.lives + 1, 5, 15);

  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(25, 9, 5, Math.PI * 2, 0, true);
  ctx.fill();
}

function showTextFor(text = "Next Level!", color = "yellow", time = 2000) {
  screenText.text = text;
  screenText.color = color;
  window.setTimeout(() => {
    screenText.text = "";
    screenText.color = color;
  }, time);
}

function textOnScreen() {
  ctx.fillStyle = screenText.color;
  ctx.font = `${screenText.size}px serif`;
  ctx.fillText(screenText.text, 10, 250);
}
function nextLevel() {
  if (JSON.stringify(lvls.curr()) === JSON.stringify([])) {
    showTextFor(`Won level ${lvls.i + 1}!`, "yellow");
    lvls.nextLvl();
    ball.reCenter()
    if (!lvls.curr()) {
      victorySeq();
    }
  }
}

function drawPlayer(p, color = "#bfa989") {
  ctx.fillStyle = color;
  //ctx.clearRect(p.x - (51/2), p.y, 52, 10)
  ctx.fillRect(p.x - 50 / 2, p.y, 50, 10);
}

function drawBall(ball, color = ball.color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 10, Math.PI * 2, 0, true);
  ctx.fill();
}

function handleOrientation(event) {
  let gamma = event.gamma;
  //log.innerHTML = gamma
  const nextX = wd / 2 + gamma * 4;
  player.x = nextX;
}
function handleMouse(event) {
  let x = event.clientX;
  player.x = x - 8;
  //console.log(x)
}
function collisionDetect() {
  const xMar = 7;
  if (ball.x + xMar > wd || ball.x - xMar < 0) {
    ball.vX = -ball.vX;
  }
  if (ball.y - xMar < 0) {
    ball.vY = -ball.vY;
  }
  if (
    ball.y + xMar >= player.y - 2 &&
    ball.y + xMar <= player.y + xMar &&
    ball.x - xMar > player.x - 50 &&
    ball.x + xMar < player.x + 50
  ) {
    ball.vY = ball.vY < 0 ? ball.vY : -ball.vY;
    ball.vX = Math.max(-3, Math.min(3, parseFloat(0.1 * (ball.x - player.x))));
    //log.innerText = `${ball.x}, ${player.x}\n v: ${ball.vX}`
  } else if (ball.y > player.y + xMar) {
    deathSeq();
  }
  ctx.fillStyle = "#db2335";
  let acc = [];
  lvls.curr().forEach(brick => {
    ctx.fillStyle = brick[2] || "#db2335";
    ctx.fillRect(brick[0] - 25, brick[1], 40, 15);
    const b = brick;
    if (
      ball.x > b[0] - 25 &&
      ball.x < b[0] + 25 &&
      ball.y > b[1] &&
      ball.y < b[1] + 15
    ) {
      ball.vY = -ball.vY;
    } else {
      acc.push(b);
    }
    lvls.list[lvls.i] = acc;
    return null;
  });
}

function reStartGame() {
  player = { x: wd / 2, y: ht - 15, wd: 50, lives: 2, won: false }; // lives are n - 1
  ball = {
    x: 150,
    y: 250,
    vX: 0,
    vY: -1,
    color: "#f77838",
    reCenter: function() {
      let that = this;
      //console.log(that)
      that.y = 250;
      that.x = 150;
      that.vY = -1;
      that.vX = 0;
    },
    outOfScreen: function() {
      let that = this;
      that.y = -50;
      that.x = 0;
      that.vY = 0;
      that.vX = 0;
    }
  };
  screenText = { text: "", color: "yellow", size: 32 };

  lvl1 = range(50, 300, 50)
    .map(x => [x, 50])
    .concat(range(50, 300, 50).map(x => [x, 100]));
  lvl2 = range(40, 300, 60).map(x => [x, 180]);
  lvl3 = range(30, 300, 35).map(x => [x, x]);
  lvl4 = range(1, 6, 1)
    .map(x => line6(200 - x * 40))
    .reduce((a, b) => a.concat(b));
  lvl5 = range(1, 8, 1)
    .map(x => line6(220 - x * 30))
    .reduce((a, b) => a.concat(b));
  lvl6 = range(50, 300, 25)
    .map(x => [x, x])
    .concat(range(50, 300, 25).map(x => [x, 300 - x]));

  lvls = {
    list: [lvl1, lvl2, lvl3, lvl4, lvl5, lvl6, []],
    i: 0,
    curr: function() {
      return this.list[this.i];
    },
    nextLvl: function() {
      this.i += 1;
      ball.vY = ball.vY + (ball.vY < 0 ? -0.3 : 0.3);
      return null;
    }
  };
}

function clickOnCanvas(evt) {
  if (player.lives === -1 || player.won) {
    reStartGame();
  } else {
    lvls.nextLvl();
  }
  // alert(evt.target);
}

function deathSeq() {
  ball.outOfScreen();
  if (!player.lives) {
    showTextFor("click to replay", "white", 5000);
  } else {
    showTextFor("Dead!", "red");
    window.setTimeout(function() {
      ball.reCenter();
    }, 1200);
  }
  player.lives -= 1;
}
function victorySeq() {
  player.won = true;
  window.clearInterval(mainLoop);
  ctx.clearRect(0, 0, wd, ht);
  ctx.fillStyle = "yellow";
  ctx.font = `${30}px serif`;
  ctx.fillText("congratulations!", 15, 120);
  ctx.fillText("You beat the game!", 5, 200);
  ctx.font = `${18}px serif`;
  ctx.fillText("Click to replay", 80, 280);
}

window.addEventListener("deviceorientation", handleOrientation);
document.querySelector("canvas").addEventListener("mousemove", handleMouse);