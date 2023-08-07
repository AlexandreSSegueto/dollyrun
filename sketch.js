var canvas;
var backgroundImage, dolly_img, cleitom_img, track;
var energiaImage, pastelImage, lifeImage;
var fuscaAzulImg
var database, gameState;
var form, player, playerCount;
var allPlayers, dolly, cleitom,energia,pastel, fuscaAzul; 
var players = [];
var blastImage;    
var currentLife = 0;               

function preload() {
  backgroundImage = loadImage("./assets/fundo.jpg");
  dolly_img = loadImage("./assets/dolly1.png","./assets/dolly2.png");
  cleitom_img = loadImage("./assets/cleitom.png");
  track = loadImage("./assets/asfalto.png");
  energiaImage = loadImage("./assets/energia.png");
  pastelImage = loadImage("./assets/pastel.png");
  lifeImage = loadImage("./assets/life.png");
  fuscaAzulImg = loadImage("./assets/fusca.png");
  blastImage = loadImage("./assets/blast.png"); 
 
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
}

function draw() {
  background(backgroundImage);
  if (playerCount === 2) {
    game.update(1);
  }

  if (gameState === 1) {
    game.play();
  }

  if (gameState === 2) {
    game.showLeaderboard();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
