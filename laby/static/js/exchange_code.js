function exchange_code() {
  if (DEBUG) console.log('exchange started');
  validateButton = document.getElementById('validate-button').disabled = "disabled";
  var xhttp;

  var formData = new FormData();
  formData.append("code", document.getElementById(local_code).value);
  formData.append("round_number", document.getElementById("round-number").textContent);
  formData.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
  

  xhttp = new XMLHttpRequest();
  xhttp.onload = function(event) {
    if (this.status == 200) {
        msg = JSON.parse(this.responseText);
        if (DEBUG) console.log(msg.status);
        document.getElementById(remote_code).value = msg.code;
        parseCode();
        r0();
    } else if (this.status == 202) {
        msg = JSON.parse(this.responseText);
        if (DEBUG) console.log("Status de la réponse: %d (%s)", this.status, msg.status);
        setTimeout(exchange_code, 1000);
    }
  }
  xhttp.open('POST', exchange_code_url, true);
  xhttp.send(formData);  
}

function end_round() {
  if (DEBUG) console.log('end round started');
  var xhttp;

  var formData = new FormData();
  formData.append("round_number", document.getElementById("round-number").textContent);
  formData.append("score", local_score.textContent);
  formData.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
  
  xhttp = new XMLHttpRequest();
  xhttp.onload = function(event) {
    if (this.status == 200) {
        msg = JSON.parse(this.responseText);
        if (DEBUG) console.log(msg.status);
        document.getElementById("round-number").textContent = msg.next_round;
        validateButton = document.getElementById('validate-button').disabled = '';
    } else if (this.status == 202) {
        msg = JSON.parse(this.responseText);
        if (DEBUG) console.log("Status de la réponse: %d (%s)", this.status, msg.status);
        setTimeout(end_round, 1000);
    }
  }
  xhttp.open('POST', end_round_url, true);
  xhttp.send(formData);  
}
