document.addEventListener('DOMContentLoaded', function () {
  const callApiButton = document.getElementById('callApiButton');
  const textArea = document.getElementById('output');

  callApiButton.addEventListener('click', function () {
    fetch("https://graph.microsoft.com/v1.0/me"
    ).then(function(response) {
      return response.json();
    }).then(function(me) {
      textArea.value = JSON.stringify(me);
    });
  });
});