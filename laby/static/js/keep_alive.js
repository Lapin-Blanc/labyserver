function keep_alive() {
  var xhttp;
  var msg;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
          msg = JSON.parse(this.responseText);
          msgBox = document.getElementById('messages');
          opponentSpan = document.getElementById('opponent');
          gameBoard = document.getElementById('game-board');
          validateButton = document.getElementById('validate-button');
          if (msg.opponent) {
            if (gameBoard.style.position == 'absolute') {
              gameBoard.style.position = 'initial';
              msgBox.textContent = "Connecté avec " + msg.nickname;
              opponentSpan.textContent = msg.nickname;
              validateButton.disabled = "";
            }
          } else {
            //~ alert("L'adversaire a quitté le jeu, celui-ci va être réinitialisé");
            document.getElementById("round-number").textContent = '1';
            validateButton.disabled = "disabled";
            workspace.clear();
            document.getElementById("javascript-code0").value="";
            document.getElementById("javascript-code1").value="";
            opponentSpan.textContent = "";
            setup(); // Reset labyrinthe
            gameBoard.style.position = 'absolute';
            msgBox.textContent = "En attente d'un adversaire"
          }
      }
    }
  }
  xhttp.open("GET", keep_alive_url, true);
  xhttp.send();
  setTimeout(keep_alive, 2000);
}
