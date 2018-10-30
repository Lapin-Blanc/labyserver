
Laby.prototype.resize = function(width, height) {
  resizeCanvas(width*this.TILE_SIZE, height*this.TILE_SIZE);
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
  document.getElementById('layout').value = laby.save();
}

mouseClicked = function() {
  var mX = ~~(mouseX/laby.TILE_SIZE);
  var mY = ~~(mouseY/laby.TILE_SIZE);
  if ( mX < 1 || mX > laby.xBlocks-2 || mY < 1 || mY > laby.yBlocks-2 ) {
    return;
  }
  var elt = document.querySelector('input[name="element"]:checked').value;
  var above = laby.map[mY-1][mX];
  var below = laby.map[mY+1][mX];
  
  // Cannot place player on anything else than floor
  if ((elt == 'P' || elt == 'A') && (laby.map[mY][mX] != '_')) return;
  
  // Player one -> Pegman
  if (elt == 'P') {
    // We click on player, it turns
    if ( (laby.players[0].pX/laby.TILE_SIZE == mX) && (laby.players[0].pY/laby.TILE_SIZE == mY) ) {
      laby.players[0].turn('right');
      document.getElementById('layout').value = laby.save();
      return;
    }
    // Else, we move it
    laby.players[0].pX = laby.players[0].nPosX = mX * laby.TILE_SIZE;
    laby.players[0].pY = laby.players[0].nPosY = mY * laby.TILE_SIZE;
    document.getElementById('layout').value = laby.save();
    return;
  }

  // Same with player two
  if (elt == 'A') {
    // We click on player, it turns
    if ( (laby.players[1].pX/laby.TILE_SIZE == mX) && (laby.players[1].pY/laby.TILE_SIZE == mY) ) {
      laby.players[1].turn('left');
      document.getElementById('layout').value = laby.save();
      return;
    }
    laby.players[1].pX = laby.players[1].nPosX = mX * laby.TILE_SIZE;
    laby.players[1].pY = laby.players[1].nPosY = mY * laby.TILE_SIZE;
    document.getElementById('layout').value = laby.save();
    return;
  }
  
  // If player already there
  if ( laby.players[0] && (mX*laby.TILE_SIZE == laby.players[0].pX && mY*laby.TILE_SIZE == laby.players[0].pY) ) return;
  if ( laby.players[1] && (mX*laby.TILE_SIZE == laby.players[1].pX && mY*laby.TILE_SIZE == laby.players[1].pY) ) return;
      
  // Eventually placing block, with wall adjustment
  if (elt == 'H') {
    if (above == 'H') laby.map[mY-1][mX] = 'I';
    if (below == 'I' || below == 'H') elt = 'I';
  } else if (above == 'I') {
    laby.map[mY-1][mX] = 'H';
  }
  laby.map[mY][mX] = elt;  
  document.getElementById('layout').value = laby.save();
  
}
