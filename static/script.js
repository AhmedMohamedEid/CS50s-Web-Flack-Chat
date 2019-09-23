
// Display Name
// var person = prompt("Please enter your name", "");
//
// if (person != null) {
//   document.getElementById("demo").innerHTML ="Hello " + person + "! How are you today?";
// }

document.addEventListener('DOMContentLoaded', () => {
    var person = prompt("Please enter your name", "Ahmed");
    if (person != null || person != ""){
      document.querySelector('#demo').value ="Hello " + person
    }
    // // Change the color of the heading when dropdown changes
    // document.querySelector('#color-change').onchange = function() {
    //     document.querySelector('#hello').style.color = this.value;
    // };

});
