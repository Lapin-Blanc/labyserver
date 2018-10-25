DEBUG = true;
const STEP_DELAY = 50
var default_game = `
{"TILE_SIZE":50,
"map":[
["I","H","H","H","H","H","H","H","H","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","_","_","_","_","_","_","_","_","I"],
["I","I","I","I","I","I","I","I","I","I"]],
"yBlocks":10,"xBlocks":10,
"players":[
{"nPosX":50,"pX":50,"nPosY":50,"pY":50,"direction":"down","DOWN":8,"RIGHT":4,"UP":0,"LEFT":12,"dir":8,"nDir":8},
{"nPosX":400,"pX":400,"nPosY":400,"pY":400,"direction":"up","DOWN":8,"RIGHT":4,"UP":0,"LEFT":12,"dir":0,"nDir":0}],
"activePlayer":0}
`
var game_layout; // To be filled during initialization
var laby;

function Laby(parent, game_layout) {
  this.TILE_SIZE = 50;
  const OK = ['_','C','X'] // Free spots
  const COINS = ['C','X'] // Available coins

  var coinPos = 0; // initialize coin rotation index
    
  var game = JSON.parse(game_layout);
  this.map = game.map;
  this.yBlocks = this.map.length;
  this.xBlocks = this.map[0].length;
  this.canvas = createCanvas(this.xBlocks*this.TILE_SIZE, this.yBlocks*this.TILE_SIZE);
  this.canvas.parent(parent);
  
  this.players = [];
  this.players[0] = new Character(game.players[0].pX, game.players[0].pY, game.players[0].direction, '/static/img/pegman_50.png', 8, true, 16, 1);
  this.players[1] = new Character(game.players[1].pX, game.players[1].pY, game.players[1].direction, '/static/img/astro_50.png', 8, true, 16, 1);
  this.activePlayer = 0;

  this.turnPlayer = function(p, dir, callback) {
    this.players[p].turn(dir, sw);
    var that = this;
    function sw() {
      console.log('switching player from %s', that.activePlayer);
      that.activePlayer = (that.activePlayer+1) % 2;
      console.log('to %s', that.activePlayer);
      callback(true);
      return true;
    }
  }
  
  this.movePlayer = function(pIdx, callback) {
    var p = this.players[pIdx]
    if (!this.facingWall(pIdx)) {
      p.move(this.TILE_SIZE, collect);
    } else {
      this.activePlayer = (this.activePlayer+1) % 2;
      callback(false);
      return false;
    }
    var o = this;
    function collect(pX, pY) {
      var xIndex = p.pX/o.TILE_SIZE;
      var yIndex = p.pY/o.TILE_SIZE;
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
    var xIndex = p.pX/this.TILE_SIZE;
    var yIndex = p.pY/this.TILE_SIZE;
    
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
    var xIndex = p.pX/this.TILE_SIZE;
    var yIndex = p.pY/this.TILE_SIZE;
    
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
  
  this.save = function() {
    var tmp = this.canvas;
    delete this.canvas;
    ret = JSON.stringify(this);
    this.canvas = tmp;
    return ret;
  }
  
  this.restore = function(json) {
    o = JSON.parse(json);
    ps = o.players;
    delete o.players;
    Object.assign(this, o);
    for (x=0; x < ps.length; x++) {
      Object.assign(this.players[x], ps[x])
    }
  }
  
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
            image(hWall, x*this.TILE_SIZE, y*this.TILE_SIZE);
            break;
          case 'I' :
            image(vWall, x*this.TILE_SIZE, y*this.TILE_SIZE);
            break;
          case '_' :
            image(stoneFloor, x*this.TILE_SIZE, y*this.TILE_SIZE);
            break;
          case 'C' :
            image(stoneFloor, x*this.TILE_SIZE, y*this.TILE_SIZE);
            image(coin, x*this.TILE_SIZE+17, y*this.TILE_SIZE+25)
            break;
          case 'X' :
            image(stoneFloor, x*this.TILE_SIZE, y*this.TILE_SIZE);
            image(superCoin, x*this.TILE_SIZE+15, y*this.TILE_SIZE+20)
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
  this.direction = direction;

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
    if (pixWidth && pixHeight) {
      image(sprite, this.pX, this.pY, pixWidth, pixHeight, (this.dir%nbHPix)*pixWidth, ~~(this.dir/nbHPix)*pixHeight, pixWidth, pixHeight);
    }
  }
  
  /////////////// want to turn //////////////////////
  this.turn = function(to, callback) {
    turningTo = to;
    switch (to) {
      case 'left' :
        switch (this.dir) {
          case this.DOWN : {
            this.nDir = this.RIGHT;
            this.direction = 'right';
            }
            break;
          case this.RIGHT : {
            this.nDir = this.UP;
            this.direction = 'up';
            }
            break;
          case this.UP : {
            this.nDir = this.LEFT;
            this.direction = 'left';
            }
            break;
          case this.LEFT : {
            this.nDir = this.DOWN;
            this.direction = 'down';
            }
            break;
        }
        break;
      case 'right' :
        switch (this.dir) {
          case this.DOWN : {
            this.nDir = this.LEFT;
            this.direction = 'left';
            }
            break;
          case this.LEFT : {
            this.nDir = this.UP;
            this.direction = 'up';
            }
            break;
          case this.UP : {
            this.nDir = this.RIGHT;
            this.direction = 'right';
            }
            break;
          case this.RIGHT : {
            this.nDir = this.DOWN;
            this.direction = 'down';
            }
            break;
        }
        break;
    }
    if (callback) {
      var that = this;
      var wait = function () {
        if (that.dir != that.nDir) {
          setTimeout(wait, 5)
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

  /////////////// Canvas /////////////////////
function preload() {
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
  background('navajowhite');
  frameRate(60);
  laby = new Laby('myCanvas', game_layout||default_game);
}

function draw() {
  background('navajowhite');
  laby.draw();
}
