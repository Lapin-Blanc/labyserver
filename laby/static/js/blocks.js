goog.provide('Maze.Blocks');
/**
 * Common HSV hue for all movement blocks.
 */
Maze.Blocks.MOVEMENT_HUE = '%{BKY_COLOUR_HUE}';

/**
 * HSV hue for loop block.
 */
Maze.Blocks.LOOPS_HUE = 120;

/**
 * Common HSV hue for all logic blocks.
 */
Maze.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's language and JavaScript generator.
// Bloc avance
Blockly.Blocks['maze_moveForward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("avancer");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Maze.Blocks.MOVEMENT_HUE);
 this.setTooltip("Avance le joueur d'un espace");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['maze_moveForward'] = function(block) {
  // var code = 'moveForward(\'block_id_' + block.id + '\');\n';
  var code = 'move();\n'
  return code;
};

// Bloc tourne
Blockly.Blocks['maze_turn'] = {
  init: function() {
    var DIRECTIONS =
        [['tourner à gauche ', 'turnLeft'],
         ['tourner à droite ', 'turnRight']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Maze.Blocks.LEFT_TURN;
    DIRECTIONS[1][0] += Maze.Blocks.RIGHT_TURN;
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), "DIR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Maze.Blocks.MOVEMENT_HUE);
 this.setTooltip("Tourner sur soi-même");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['maze_turn'] = function(block) {
  var dropdown_dir = block.getFieldValue('DIR');
  // TODO: Assemble JavaScript into code variable.
  // var code = dropdown_dir + '(\'' + block.id + '\');\n';
  var code = 'turn(\'' + dropdown_dir + '\');\n';
  return code;
};

// Bloc ellipse
Blockly.Blocks['maze_ellipse'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("ellipse");
    this.appendValueInput("x")
        .setCheck("Number")
        .appendField("x");
    this.appendValueInput("y")
        .setCheck("Number")
        .appendField("y");
    this.appendValueInput("largeur")
        .setCheck("Number")
        .appendField("largeur");
    this.appendValueInput("hauteur")
        .setCheck("Number")
        .appendField("hauteur");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Maze.Blocks.MOVEMENT_HUE);
 this.setTooltip("Dessine une ellipse à la position x,y");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['maze_ellipse'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var w = Blockly.JavaScript.valueToCode(block, 'largeur', Blockly.JavaScript.ORDER_ATOMIC);
  var h = Blockly.JavaScript.valueToCode(block, 'hauteur', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "ellipse(" + x + "," + y + "," + w + "," + h + ");\n";
  return code;
};

// In front of a wall
Blockly.Blocks['maze_blocked'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Face à un mur");
    this.setOutput(true, "Boolean");
    this.setColour('%{BKY_LOGIC_HUE}');
 this.setTooltip("Face à un mur");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['maze_blocked'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'facingWall()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
