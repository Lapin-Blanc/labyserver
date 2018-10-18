DEBUG = true;
//~ const MOVING_FR = 150; // Moving framerate, as high as possible...
const STEP_DELAY = 100 // Time between movements
var activePlayer = 0;

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


function Laby(map) {
  const TILE_SIZE = 50;
  const OK = ['_','C','X'] // Free spots
  const COINS = ['C','X'] // Available coins

  var coinPos = 0;
  
  this.players = [];
  this.map = JSON.parse(JSON.stringify(map));
  this.yBlocks = function() { return this.map.length }
  this.xBlocks = function() { return this.map[0].length }
  
  this.turnPlayer = function(p, dir, callback) {
    this.players[p].turn(dir, callback);
  }
  
  this.movePlayer = function(pIdx, callback) {
    var p = this.players[pIdx]
    if (!this.facingWall(pIdx)) {
      p.move(TILE_SIZE, collect);
    } else {
      callback('blocked')
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
      callback('moved');
    }
  } // End move
  
  this.facingWall = function(player, callback) {
    var p = this.players[player];
    var xIndex = p.pX/TILE_SIZE;
    var yIndex = p.pY/TILE_SIZE;
    
    switch (p.dir) {
      case p.DOWN() :
        block = this.map[yIndex+1][xIndex];
        break;
      case p.RIGHT() :
        block = this.map[yIndex][xIndex+1];
        break;
      case p.UP() :
        block = this.map[yIndex-1][xIndex];
        break;
      case p.LEFT() :
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
      case p.DOWN() :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          yIndex++;
          block = this.map[yIndex][xIndex];
        }
        break;
      case p.RIGHT() :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          xIndex++;
          block = this.map[yIndex][xIndex];
        }
        break;
      case p.UP() :
        while (OK.includes(block)) {
          if (COINS.includes(block)) coinsCount++;
          yIndex--;
          block = this.map[yIndex][xIndex];
        }
        break;
      case p.LEFT() :
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
    for (y=0; y < this.yBlocks(); y++) {
      for (x=0; x < this.xBlocks(); x++) {
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



  /////////////// Canvas /////////////////////
function preload() {
  buzzImg = loadImage('/static/img/buzz_50.png');  
  woodyImg = loadImage('/static/img/woody_50.png');  
  aladdinImg = loadImage('/static/img/aladdin_50.png');  
  jasmineImg = loadImage('/static/img/jasmine_50.png');  
  coinsPng = loadImage('/static/img/coins.png');
  superCoinsPng = loadImage('/static/img/super_coins.png');
  stoneFloor = loadImage('/static/img/floor.jpg');
  hWall = loadImage('/static/img/h_wall.jpg');
  vWall = loadImage('/static/img/v_wall.jpg');
  soundFormats('mp3', 'ogg');
  coinSound = loadSound('/static/sounds/coin.mp3');
  superCoinSound = loadSound('/static/sounds/super_coin.mp3');
}

function setup() {
  var myCanvas = createCanvas(500, 500);
  background('navajowhite');
  myCanvas.parent('myCanvas'); 
  frameRate(60);
  aladdin = new Character(aladdinImg, 50, 50, 'DOWN');
  jasmine = new Character(jasmineImg, 400, 400, 'UP');
  laby = new Laby(map01);
  laby.players.push(aladdin);
  laby.players.push(jasmine);
}

function draw() {
  background('navajowhite');
  laby.draw();
}



function Character(sprite, posX, posY, direction, nbHPix, nbVPix ) {
// Image préchargée, nombre de sprite horizontaux, verticaux
// position 'UP', 'DOWN', 'LEFT', 'RIGHT'
// et direction de départ
  var sprite = sprite;

  this.pX = this.nPosX = posX ? posX:0;
  this.pY = this.nPosY = posY ? posY:0;
  this.dir = this.nDir = direction ? ['DOWN', 'RIGHT', 'UP', 'LEFT'].indexOf(direction)*10:DOWN;
  this.nbHPix = nbHPix ? nbHPix : 8;
  this.nbVPix = nbVPix ? nbVPix : 5;
  this.nbPix = function() {return this.nbHPix*this.nbVPix};
  this.pixWidth = function() { return ~~(sprite.width/this.nbHPix)};
  this.pixHeight = function() { return ~~(sprite.height/this.nbVPix)};

  this.DOWN = function() { return this.nbPix()*0/4; }
  this.RIGHT = function() { return this.nbPix()*1/4; }
  this.UP = function() { return this.nbPix()*2/4; }
  this.LEFT = function() { return this.nbPix()*3/4; }

  var turningTo = 'left';
  var busy = false;

// For saving character state into server
  this.backup = function() {return JSON.stringify(this);};
  this.restore = function(json) { Object.assign(this, JSON.parse(json));};
  
  this.draw = function() {
    // Have to turn
    if (this.dir!=this.nDir) {
      switch (turningTo) {
        case 'left' :
          this.dir++;
          if (this.dir==this.nbPix()) this.dir = 0;
          break;
        case 'right' :
          if (this.dir==0) this.dir = this.nbPix();
          this.dir--;
          break;
      }
    }
    // Have to move
    if (this.pX < this.nPosX) this.pX++;
    if (this.pY < this.nPosY) this.pY++;
    if (this.pX > this.nPosX) this.pX--;
    if (this.pY > this.nPosY) this.pY--;
    
    // Draw image
    image(sprite, this.pX, this.pY, this.pixWidth(), this.pixHeight(), (this.dir%this.nbHPix)*this.pixWidth(), ~~(this.dir/this.nbHPix)*this.pixHeight(), this.pixWidth(), this.pixHeight());
  }
  
  /////////////// want to turn //////////////////////
  this.turn = function(to, callback) {
    this.busy = true;
    turningTo = to;
    switch (to) {
      case 'left' :
        switch (this.dir) {
          case this.DOWN() : this.nDir = this.RIGHT();
            break;
          case this.RIGHT() : this.nDir = this.UP();
            break;
          case this.UP() : this.nDir = this.LEFT();
            break;
          case this.LEFT() : this.nDir = this.DOWN();
            break;
        }
        break;
      case 'right' :
        switch (this.dir) {
          case this.DOWN() : this.nDir = this.LEFT();
            break;
          case this.LEFT() : this.nDir = this.UP();
            break;
          case this.UP() : this.nDir = this.RIGHT();
            break;
          case this.RIGHT() : this.nDir = this.DOWN();
            break;
        }
        break;
    }
    if (callback) {
      var c = this;
      var wait = function (cb) {
        if (c.dir != c.nDir) {
          setTimeout(wait, 5, cb)
        }
        else {
          c.busy = false;
          activePlayer++;
          activePlayer = activePlayer % 2;
          cb('turned')
        }
      }
      wait(callback);
    }
  }
  ////////////// Turned //////////////////////
  
  /////////////// Movement asked /////////////
  this.move = function(distance, callback) {
    this.busy = true;
    switch (this.dir) {
      case this.DOWN() :
        this.nPosY += distance;
        break;
      case this.RIGHT() :
        this.nPosX += distance;
        break;
      case this.UP() :
        this.nPosY -= distance;
        break;
      case this.LEFT() :
        this.nPosX -= distance;
        break;
    }    
    if (callback) {
      var c = this;
      var wait = function (cb) {
        if ((c.pX != c.nPosX) || (c.pY != c.nPosY)) {
          setTimeout(wait, 5, cb)
        }
        else {
          this.busy = false;
          activePlayer++;
          activePlayer = activePlayer % 2;
          cb(c.pX, c.pY)
        }
      }
      wait(callback);
    }
  }
  /////////////// Moved //////////////////////
}
