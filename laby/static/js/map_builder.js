
var defaultMap = [
  ['I','H','H','H','H','H','H','H','H','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','_','_','_','_','_','_','_','_','I'],
  ['I','I','I','I','I','I','I','I','I','I']
]

function Laby(map, parent) {
  const TILE_SIZE = 50;
  const OK = ['_','C','X'] // Free spots
  const COINS = ['C','X'] // Available coins

  var coinPos = 0;
  
  
  this.map = JSON.parse(JSON.stringify(map));
  document.getElementById('layout').value = JSON.stringify(this.map);
  this.yBlocks = this.map.length;
  this.xBlocks = this.map[0].length;
  this.canvas = createCanvas(this.xBlocks*TILE_SIZE, this.yBlocks*TILE_SIZE);
  this.canvas.parent(parent);
  
  this.players = [];
  
  var that = this;

  mouseClicked = function() {
    var mX = ~~(mouseX/TILE_SIZE);
    var mY = ~~(mouseY/TILE_SIZE);
    if ( mX < 1 || mX > that.xBlocks-2 || mY < 1 || mY > that.yBlocks-2 ) {
      return;
    }
    //~ var elt = document.getElementById('element').value;
    var elt = document.querySelector('input[name="element"]:checked').value;
    var above = that.map[mY-1][mX];
    var below = that.map[mY+1][mX];
    console.log('above : %s, below : %s', above, below);
    
    // Cannot place player on anything else than floor
    if ((elt == 'P' || elt == 'A') && (that.map[mY][mX] != '_')) return;
    // Player one -> Pegman
    if (elt == 'P') {
      // Not yet existing
      if (!that.players[0]) {
        that.players[0] = new Character(mX*TILE_SIZE, mY*TILE_SIZE, 'down', '/static/img/pegman_50.png', 8, true, 16, 1);
      } else {
        // We click on player, it turns
        if ( (that.players[0].pX/TILE_SIZE == mX) && (that.players[0].pY/TILE_SIZE == mY) ) {
          that.players[0].turn('right');
          return;
        }
        // Else, we move it
        that.players[0].pX = that.players[0].nPosX = mX * TILE_SIZE;
        that.players[0].pY = that.players[0].nPosY = mY * TILE_SIZE;
      }
      return;
    }
    
    // Same with player two
    if (elt == 'A') {
      if (!that.players[1]) {
        that.players[1] = new Character(mX*TILE_SIZE, mY*TILE_SIZE, 'up', '/static/img/astro_50.png', 8, true, 16, 1);
      } else {
        if ( (that.players[1].pX/TILE_SIZE == mX) && (that.players[1].pY/TILE_SIZE == mY) ) {
          that.players[1].turn('left');
          return;
        }
        that.players[1].pX = that.players[1].nPosX = mX * TILE_SIZE;
        that.players[1].pY = that.players[1].nPosY = mY * TILE_SIZE;
      }
      return;
    }
    
    // If player already there
    if ( that.players[0] && (mX*TILE_SIZE == that.players[0].pX && mY*TILE_SIZE == that.players[0].pY) ) return;
    if ( that.players[1] && (mX*TILE_SIZE == that.players[1].pX && mY*TILE_SIZE == that.players[1].pY) ) return;
        
    // Eventually placing block, with wall adjustment
    if (elt == 'H') {
      if (above == 'H') that.map[mY-1][mX] = 'I';
      if (below == 'I' || below == 'H') elt = 'I';
    } else if (above == 'I') {
      that.map[mY-1][mX] = 'H';
    }
    that.map[mY][mX] = elt;
    
    document.getElementById('layout').value = JSON.stringify(that.map);
  }

  this.resize = function(width, height) {
    resizeCanvas(width*TILE_SIZE, height*TILE_SIZE);
    var newMap = [[]];
    // First line
    newMap[0].push('I');
    for (x=1; x < width-1; x++) {
      newMap[0].push('H');
    }
    newMap[0].push('I');
    
    // Following lines
    for (y=1; y < height-1; y++) {
      var t = [];
      t.push('I');
      for (x=1; x < width-1; x++) {
        t.push('_');
      }
      t.push('I');      
      newMap.push(t);      
    }
    
    //~ // last line
    t = [];
    for (x=0; x < width; x++) {
      t.push('I');
    }
    newMap.push(t);
    this.map = newMap;
    this.yBlocks = this.map.length;
    this.xBlocks = this.map[0].length;
  }

  this.draw = function() {
    // Draw coins
    coinPos = (coinPos + 1)%30 // Mod 30 and div 5 to slow down coins rotation
    coin = coinsPng.get(~~(coinPos/5)*15, 0, 15, 15);
    superCoin = superCoinsPng.get(~~(coinPos/5)*20, 0, 20, 20);
    
    // Draw map
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
    // Draw players
    this.players.forEach( function(p) {
      p.draw();
    });
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
  var nbPix = nbHPix * nbVPix;
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
    if (!(pixWidth && pixHeight)) return;
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
}


  /////////////// Canvas /////////////////////
function preload() {
  coinsPng = loadImage('/static/img/coins.png');
  superCoinsPng = loadImage('/static/img/super_coins.png');
  stoneFloor = loadImage('/static/img/floor.jpg');
  hWall = loadImage('/static/img/h_wall.jpg');
  vWall = loadImage('/static/img/v_wall.jpg');
}

function setup() {
  frameRate(60);
  background('navajowhite');
  laby = new Laby(defaultMap, 'myCanvas');
}

function draw() {
  background('navajowhite');
  laby.draw();
}
