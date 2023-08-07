class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.leadeboardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving = false;
    this.leftKeyActive = false;
    this.blast = false;
  }
  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    dolly = createSprite(width / 2 - 50, height - 100);
    dolly.addImage("dolly", dolly_img);
    dolly.scale = 0.07;
    dolly.addImage("blast", blastImage); 

    cleitom = createSprite(width / 2 + 100, height - 100);
    cleitom.addImage("car2", car2_img);
    cleitom.scale = 0.07;
    cleitom.addImage("blast", blastImage);

    players = [dolly, cleitom];

    energia = new Group();
    pastel = new Group();
    fuscaAzul = new Group(); 
     
    var fuscaAzulPositions = [
      { x: width / 2 - 150, y: height - 1300, image: fuscaAzulImg },
      { x: width / 2 + 250, y: height - 1800, image: fuscaAzulImg },
      { x: width / 2 - 180, y: height - 3300, image: fuscaAzulImg },
     
      { x: width / 2 - 150, y: height - 4300, image: fuscaAzulImg },
      { x: width / 2, y: height - 5300, image: fuscaAzulImg },
    ];

    this.addSprites(energia, 4, energiaImage, 0.02);

    this.addSprites(pastel, 18, pastelImage, 0.09);

    this.addSprites(
      fuscaAzul,
      fuscaAzulPositions.length,
      fuscaAzulImg,
      0.04,
      fuscaAzulPositions
    );
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Score");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showEnergiaBar();
      this.showLife();
      this.showLeaderboard();

      var index = 0;
      for (var plr in allPlayers) {
        index = index + 1;

        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        var currentlife = allPlayers[plr].life;

        if (currentlife <= 0) {
          players[index - 1].changeImage("blast");
          players[index - 1].scale = 0.3;
        }

        players[index - 1].position.x = x;
        players[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleEnergia(index);
          this.handlePastel(index);
          this.handleFuscaCollision(index); 
          this.handlePlayerACollisionWithPlayerB(index);

          if (player.life <= 0) {
            this.blast = true;
            this.playerMoving = false;
            gameState = 2;
            this.end();
          }

          camera.position.y = players[index - 1].position.y;
        }
      }

      if (this.playerMoving) {
        player.positionY += 5;
        player.update();
      }

      this.handlePlayerControls();

      const finshLine = height * 6 - 100;

      if (player.positionY > finshLine) {
        gameState = 2;
        player.rank += 1;
        Player.updatePlayersAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleEnergia(index) {
    players[index - 1].overlap(energia, function(collector, collected) {
      player.energia = 185;
      collected.remove();
    });

    if (player.energia > 0 && this.playerMoving) {
      player.energia -= 0.3;
    }

    if (player.energia <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }

  handlePastel(index) {
    players[index - 1].overlap(pastel, function(collector, collected) {
      player.score += 21;
      player.update();
      collected.remove();
    });
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playersAtEnd: 0,
        playerCount: 0,
        gameState: 0,
        players: {}
      });
      window.location.reload();
    });
  }

  showEnergiaBar() {
    push();
    image(energiaImage, width / 2 - 130, height - player.positionY -250, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY -250, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - player.positionY -250, player.fuel, 20);
    noStroke();
    pop();
  }

  showLife() {
    push();
    image(lifeImage, width / 2 - 130, height - player.positionY -300, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY -300, 185, 20);
    fill("#f50057");
    rect(width / 2 - 100, height - player.positionY -300, player.life, 20);
    noStroke();
    pop();
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
        leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }


  handlePlayerControls() {
    if(!this.blast){

      
      if (keyIsDown(UP_ARROW)) {
        this.playerMoving = true;
        player.positionY += 10;
        player.update();
      }

      if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        this.leftKeyActive = true;
        player.positionX -= 5;
        player.update();
      }

      if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
        this.leftKeyActive = false;
        player.positionX += 5;
        player.update();
      }
      ;
    }  
  }
  handleObstacleCollision(index) {
    if(players[index-1].collide(obstacle1)||cars[index-1].collide(obstacle2)){

      if (this.leftKeyActive) {
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }

      if (player.life > 0) {
        player.life -= 185 / 4;
      }

      player.update();
    }
  }

  handlePlayerACollisionWithPlayerB(index) {
    if(index === 1){
      if (players[index - 1].collide(players[1])){
        if (this.leftKeyActive){ 
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }

      if (player.life > 0) {
        player.life -= 185 / 4;
      }

      player.update();
    }
  }

  if(index === 2){
    if (players[index - 1].collide(players[0])){
      if (this.leftKeyActive){ 
      player.positionX += 100;
    } else {
      player.positionX -= 100;
    }

    if (player.life > 0) {
      player.life -= 185 / 4;
    }

    player.update();
  }
  }
}

  showRank() {
    swal({
      title: `FINALMENTE!${"\n"}Classificação${"\n"}${player.rank}`,
      text: "Você pegou de volta sua tão amada coxinha",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `NÃÃÃÃÃÃÃÃÃO!`,
      text: "VOCÊ PERDEU SUA COXINHA PROS LADRÕES E SEU AMIGO ):",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Muito obrigado por apreciar essa obra prima(do meu ponto de vista é claro)"
    });
       
  }
  
  end() {
    swal({
      title: `Que pena ); `,
      text: "Você só queria comer uma coxinha, mas agora você, por ser tão incopetente, você jogou no vasco, foi de arrasta pra cima, foi de Americanas, enfim, fazer o que, quer jogar de novo?",
      imageUrl:
        "https://www.pngmart.com/files/15/Comic-Explosion-Bubble-PNG-HD.png",
      imageSize: "200x200",
      confirmButtonText: "deseja perder de novo ou usar a carta reversa do Uno? (:< "
    })
  }
  
}
