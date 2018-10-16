var my_toolbox = `<xml id='toolbox' style='display: none'>
<!-- Blockly toolbox definition -->
			<category name='Labyrinthe' colour='%{BKY_COLOUR_HUE}'>
				<!--  <block type='maze_spawn'></block> -->
				<block type='maze_moveForward'></block>
				<block type='maze_turn'></block>
				<block type='maze_blocked'></block>        
			</category>
			<category name='Logique' colour='%{BKY_LOGIC_HUE}'>
				<block type='controls_if'></block>
				<block type='controls_ifelse'></block>
				<block type='logic_boolean'></block>
				<block type='logic_compare'></block>
				<block type='logic_operation'></block>
				<block type='logic_negate'></block>
				<!-- <block type='logic_null'></block> -->
				<!-- <block type='logic_ternary'></block> -->
			</category>

			<category name='Boucles' colour='%{BKY_LOOPS_HUE}'>
				<block type='controls_repeat_ext'></block>
				<block type='controls_whileUntil'></block>
			</category>
			
			<category id ='fabien' name='Math' colour='%{BKY_MATH_HUE}'>
				<block type='math_number'></block>
				<block type='math_arithmetic'></block>
			</category>

			<!-- <category name = 'Texte' colour='%{BKY_TEXTS_HUE}'>
				<block type='text'></block>
				<block type='text_print'></block>			
				<block type='text_join'></block>
				<block type='text_create_join_container'></block>
				<block type='text_create_join_item'></block>
				<block type='text_append'></block>
				<block type='text_length'></block>
				<block type='text_isEmpty'></block>
				<block type='text_indexOf'></block>
				<block type='text_charAt'></block>
				<block type='text_prompt_ext'></block>
				<block type='text_prompt'></block>
			</category> -->

			<category name='Variables' colour='%{BKY_VARIABLES_HUE}' custom='VARIABLE'>
			</category>

			<category name='Fonctions' colour='%{BKY_PROCEDURES_HUE}' custom='PROCEDURE'>
			</category>

			</xml>`;
