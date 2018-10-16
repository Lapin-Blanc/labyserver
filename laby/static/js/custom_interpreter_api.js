function initAlert(interpreter, scope) {
  //////////////////////////////////////////////
  // Alert
  var wrapper = function(text) {
    return alert(arguments.length ? text : '');
  };
  interpreter.setProperty(scope, 'alert',
      interpreter.createNativeFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Prompt
  var wrapper = function(text)  {
    return prompt(arguments.length ? text : '');
  };
  interpreter.setProperty(scope, 'window.prompt',
      interpreter.createNativeFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Move
  var wrapper = function(callback) {
    interpreter.player.move(callback);
  }
  interpreter.setProperty(scope, 'move',
      interpreter.createAsyncFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Turn
  var wrapper = function(direction, callback) {
    interpreter.player.turn(direction, callback);
  }
  interpreter.setProperty(scope, 'turn',
      interpreter.createAsyncFunction(wrapper));
  /*------------------------------------------*/

  ///////////////////////////////////////////////
  // Facing a wall ?
  var wrapper = function(callback) {
    interpreter.player.facingWall(callback);
  }
  interpreter.setProperty(scope, 'facingWall',
      interpreter.createAsyncFunction(wrapper));
  /*------------------------------------------*/
}

