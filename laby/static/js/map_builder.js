
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
  
  var that = this;

  mouseClicked = function() {
    mX = ~~(mouseX/TILE_SIZE);
    mY = ~~(mouseY/TILE_SIZE);
    if ( mX < 1 || mX > that.xBlocks-2 || mY < 1 || mY > that.yBlocks-2 ) {
      return;
    }
    var elt = document.getElementById('element').value;
    var above = that.map[mY-1][mX];
    var below = that.map[mY+1][mX];
    console.log('above : %s, below : %s', above, below);
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
  }
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
