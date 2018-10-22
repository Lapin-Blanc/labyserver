DEBUG = true;
const STEP_DELAY = 500 // Time between movements
var laby;

var map01 = [
  ['I','H','H','H','H','H','H','H','H','I'],
  ['I','_','C','_','_','_','_','X','X','I'],
  ['I','C','_','_','_','_','_','_','X','I'],
  ['I','_','_','H','C','C','H','_','_','I'],
  ['I','_','_','C','C','C','C','_','_','I'],
  ['I','_','_','C','C','C','C','_','_','I'],
  ['I','_','_','H','C','C','H','_','_','I'],
  ['I','X','_','_','_','_','_','_','C','I'],
  ['I','X','X','_','_','_','_','C','_','I'],
  ['I','I','I','I','I','I','I','I','I','I']
]




  /////////////// Canvas /////////////////////
function preload() {
  pegman = new Character(50, 50, 'down', '/static/img/pegman_50.png', 8, true, 16, 1);
  astro = new Character(400, 400, 'up', '/static/img/astro_50.png', 8, true, 16, 1);
  //~ jasmine = new Character(400, 50, 'down', '/static/img/jasmine_50.png', 0, false, 8, 5);
  //~ aladdin = new Character(50, 400, 'up', '/static/img/aladdin_50.png', 0, false, 8, 5);

  coinsPng = loadImage('/static/img/coins.png');
  superCoinsPng = loadImage('/static/img/super_coins.png');
  stoneFloor = loadImage('/static/img/floor.jpg');
  hWall = loadImage('/static/img/h_wall.jpg');
  vWall = loadImage('/static/img/v_wall.jpg');
  soundFormats('mp3', 'ogg');
  coinSound = loadSound('/static/sounds/coin.mp3');
  superCoinSound = loadSound('/static/sounds/super_coin.mp3');
  
  laby = new Laby(map01);
}

function setup() {
  var myCanvas = createCanvas(500, 500);
  background('navajowhite');
  myCanvas.parent('myCanvas'); 
  frameRate(20);
  laby.players.push(pegman);
  //~ laby.players.push(aladdin);
  //~ laby.players.push(jasmine);
  laby.players.push(astro);
}

function draw() {
  background('navajowhite');
  laby.draw();
}

function Laby(map) {
  const TILE_SIZE = 50;
  const OK = ['_','C','X'] // Free spots
  const COINS = ['C','X'] // Available coins

  var coinPos = 0; // initialize coin rotation index
  
  this.players = [];
  this.activePlayer = 0;
  this.map = JSON.parse(JSON.stringify(map));
  this.yBlocks = this.map.length;
  this.xBlocks = this.map[0].length;
  
  this.turnPlayer = function(p, dir, callback) {
    this.players[p].turn(dir, sw);
    function sw() {
      this.activePlayer = (this.activePlayer+1) % 2;
      callback(true);
      return true;
    }
  }
  
  this.movePlayer = function(pIdx, callback) {
    var p = this.players[pIdx]
    if (!this.facingWall(pIdx)) {
      p.move(TILE_SIZE, collect);
    } else {
      this.activePlayer = (this.activePlayer+1) % 2;
      callback(false);
      return false;
    }
    var o = this;
    function collect(pX, pY) {
      var xIndex = p.pX/TILE_SIZE;
      var yIndex = p.pY/TILE_SIZE;
      var block = o.map[yIndex][xIndex]
      switch (block) {
        case 'C' :
          o.map[yIndex][xIndex] = '_';
          coinSound.play();
          if (pIdx==0)
            local_score.textContent = int(local_score.textContent)+1;
          else
            remote_score.textContent = int(remote_score.textContent)+1;
          break;
        case 'X' :
          o.map[yIndex][xIndex] = '_';
          superCoinSound.play();
          if (pIdx==0)
            local_score.textContent = int(local_score.textContent)+5;
          else
            remote_score.textContent = int(remote_score.textContent)+5;
          break;
      }
      o.activePlayer = (o.activePlayer+1) % 2;
      console.log('player switched to %s', o.activePlayer);
      callback(true);
      return true;
    }
  } // End move
  
  this.facingWall = function(player, callback) {
    var p = this.players[player];
    var xIndex = p.pX/TILE_SIZE;
    var yIndex = p.pY/TILE_SIZE;
    
    switch (p.dir) {
      case p.DOWN :
        block = this.map[yIndex+1][xIndex];
        break;
      case p.RIGHT :
        block = this.map[yIndex][xIndex+1];
        break;
      case p.UP :
        block = this.map[yIndex-1][xIndex];
        break;
      case p.LEFT :
        block = this.map[yIndex][xIndex-1];
        break;
    }
    if (callback) { callback(!OK.includes(block)) };
    return !OK.includes(block);
  } // End facingWall
  
  this.coinsFaced = function(player, callback) {
    var p = this.players[player];
    var xIndex = p.pX/TILE_SIZE;
    var yIndex = p.pY/TILE_SIZE;
    
    var coinsCount = 0;
    block = this.map[yIndex][xIndex];
  
    switch (p.dir) {
      case p.DOWN :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          yIndex++;
          block = this.map[yIndex][xIndex];
        }
        break;
      case p.RIGHT :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          xIndex++;
          block = this.map[yIndex][xIndex];
        }
        break;
      case p.UP :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          yIndex--;
          block = this.map[yIndex][xIndex];
        }
        break;
      case p.LEFT :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          xIndex--;
          block = this.map[yIndex][xIndex];
        }
        break;
    }    
    if (callback) {callback(coinsCount);}
    return coinsCount;
  } // End coins faced
  
  
  this.draw = function() {
    // Draw coins
    coinPos = (coinPos + 1)%30 // Mod 30 and div 5 to slow down coins rotation
    coin = coinsPng.get(~~(coinPos/5)*15, 0, 15, 15);
    superCoin = superCoinsPng.get(~~(coinPos/5)*20, 0, 20, 20);
    
    //~ // Draw map
    for (y=0; y < this.yBlocks; y++) {
      for (x=0; x < this.xBlocks; x++) {
        switch (this.map[y][x]) {
          case 'H' :
            image(hWall, x*TILE_SIZE, y*TILE_SIZE);
            break;
          case 'I' :
            image(vWall, x*TILE_SIZE, y*TILE_SIZE);
            break;
          case '_' :
            image(stoneFloor, x*TILE_SIZE, y*TILE_SIZE);
            break;
          case 'C' :
            image(stoneFloor, x*TILE_SIZE, y*TILE_SIZE);
            image(coin, x*TILE_SIZE+17, y*TILE_SIZE+25)
            break;
          case 'X' :
            image(stoneFloor, x*TILE_SIZE, y*TILE_SIZE);
            image(superCoin, x*TILE_SIZE+15, y*TILE_SIZE+20)
            break;
        }
      }
    }
    for (x=0; x < this.players.length; x++) {
      this.players[x].draw();
    }
  }
}


function Character(posX, posY, direction, spriteImgUrl, downIndex, clockWise, nbHPix, nbVPix ) {
// Image préchargée, nombre de sprite horizontaux, verticaux
// position 'UP', 'DOWN', 'LEFT', 'RIGHT'
// et direction de départ

  this.pX = this.nPosX = posX ? posX : 0;
  this.pY = this.nPosY = posY ? posY : 0;

  var downIndex = downIndex ? downIndex : 0;
  var nbHPix = nbHPix ? nbHPix : 8;
  var nbVPix = nbVPix ? nbVPix : 5;
  var nbPix = nbHPix * nbVPix; // 40
  var downIndex = downIndex ? downIndex : 0;
  
  var x = downIndex+nbPix;
  var clockDir = (clockWise) ? -1:1 ;
  this.DOWN =  x % nbPix ; x = x + clockDir*nbPix/4;
  this.RIGHT = x % nbPix ; x = x + clockDir*nbPix/4;
  this.UP =    x % nbPix ; x = x + clockDir*nbPix/4;
  this.LEFT =  x % nbPix ; x = x + clockDir*nbPix/4;
  
  switch (direction) {
    case 'down' :
      this.dir = this.DOWN;
      break;
    case 'right' :
      this.dir = this.RIGHT;
      break;
    case 'up' :
      this.dir = this.UP;
      break;
    case 'left' :
      this.dir = this.LEFT;
      break;
    default :
      this.dir = this.DOWN;    
  }
  this.nDir = this.dir;
  var pixWidth;
  var pixHeight;

  var sprite = loadImage(spriteImgUrl, successCb);

  function successCb(img) {
    pixWidth = ~~(img.width/nbHPix);
    pixHeight = ~~(img.height/nbVPix);
  }

  var turningTo;

// For saving character state into server
  this.backup = function() {return JSON.stringify(this);};
  this.restore = function(json) { 
    Object.assign(this, JSON.parse(json));    
  };
  
  this.draw = function() {
    // Have to turn
    if (this.dir != this.nDir) {
      if ( ((turningTo=='left') && (clockDir==1)) || ((turningTo=='right') && (clockDir==-1)) ) {
          this.dir++;
          if (this.dir==nbPix) this.dir = 0;
      } else {
          if (this.dir==0) this.dir = nbPix;
          this.dir--;
      }
    }
    // Have to move
    if (this.pX < this.nPosX) this.pX++;
    if (this.pY < this.nPosY) this.pY++;
    if (this.pX > this.nPosX) this.pX--;
    if (this.pY > this.nPosY) this.pY--;
    
    // Draw image
    image(sprite, this.pX, this.pY, pixWidth, pixHeight, (this.dir%nbHPix)*pixWidth, ~~(this.dir/nbHPix)*pixHeight, pixWidth, pixHeight);
  }
  
  /////////////// want to turn //////////////////////
  this.turn = function(to, callback) {
    turningTo = to;
    switch (to) {
      case 'left' :
        switch (this.dir) {
          case this.DOWN : this.nDir = this.RIGHT;
            break;
          case this.RIGHT : this.nDir = this.UP;
            break;
          case this.UP : this.nDir = this.LEFT;
            break;
          case this.LEFT : this.nDir = this.DOWN;
            break;
        }
        break;
      case 'right' :
        switch (this.dir) {
          case this.DOWN : this.nDir = this.LEFT;
            break;
          case this.LEFT : this.nDir = this.UP;
            break;
          case this.UP : this.nDir = this.RIGHT;
            break;
          case this.RIGHT : this.nDir = this.DOWN;
            break;
        }
        break;
    }
    if (callback) {
      var that = this;
      var wait = function () {
        if (that.dir != that.nDir) {
          setTimeout(wait, 1)
        }
        else {
          callback(that.dir)
        }
      }
      wait(callback);
    }
  }
  ////////////// Turned //////////////////////
  
  /////////////// Movement asked /////////////
  this.move = function(distance, callback) {
    switch (this.dir) {
      case this.DOWN :
        this.nPosY += distance;
        break;
      case this.RIGHT :
        this.nPosX += distance;
        break;
      case this.UP :
        this.nPosY -= distance;
        break;
      case this.LEFT :
        this.nPosX -= distance;
        break;
    }    
    if (callback) {
      var that = this;
      var wait = function () {
        if ((that.pX != that.nPosX) || (that.pY != that.nPosY)) {
          setTimeout(wait, 5)
        }
        else {
          callback(that.pX, that.pY)
        }
      }
      wait();
    }
  }
  /////////////// Moved //////////////////////
}
