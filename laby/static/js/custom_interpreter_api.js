function initAlert(interpreter, scope) {
  ///////////////////////////////////////////////
  // Move
  var wrapper = function(callback) {
    interpreter.laby.movePlayer(interpreter.player, callback);
  }
  interpreter.setProperty(scope, 'move',
      interpreter.createAsyncFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Turn
  var wrapper = function(direction, callback) {
    interpreter.laby.turnPlayer(interpreter.player, direction, callback);
  }
  interpreter.setProperty(scope, 'turn',
      interpreter.createAsyncFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Facing a wall ?
  var wrapper = function() {
    return interpreter.laby.facingWall(interpreter.player);
  }
  interpreter.setProperty(scope, 'facingWall',
      interpreter.createNativeFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Coins in front of player ?
  var wrapper = function() {
    return interpreter.laby.coinsFaced(interpreter.player);
  }
  interpreter.setProperty(scope, 'coinsFaced',
      interpreter.createNativeFunction(wrapper));
  /*------------------------------------------*/
}

