document.addEventListener("DOMContentLoaded", function (event) {
  // array with texts to type in typewriter
  const dataText = [
    "Pool Care App",
    "Digitally Log",
    "Notifications",
    "Analyse",
    "Pool Care App",
    "Digitally Log",
    "Notifications",
    "Analyse",
    "Pool Care App",
  ];

  // type one text in the typwriter
  // keeps calling itself until the text is finished
  function typeWriter(text, i, fnCallback) {
    if (i < text.length) {
      document.querySelector("h1").innerHTML =
        text.substring(0, i + 1) + '<span aria-hidden="true"></span>';

      // Calculate the timeout duration based on the length of the current substring
      var charTimeout = text.charAt(i).match(/[a-zA-Z]/) ? 100 : 100;

      setTimeout(function () {
        typeWriter(text, i + 1, fnCallback);
      }, charTimeout);
    } else if (typeof fnCallback == "function") {
      setTimeout(fnCallback, 700);
    }
  }

  function StartTextAnimation(i) {
    if (typeof dataText[i] == "undefined") {
      setTimeout(function () {
        StartTextAnimation(0);
      }, 20000);
    }

    if (i < dataText.length) {
      typeWriter(dataText[i], 0, function () {
        StartTextAnimation(i + 1);
      });
    }
  }

  StartTextAnimation(0);
});
