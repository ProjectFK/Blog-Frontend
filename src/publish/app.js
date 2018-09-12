import './style.css';

var xss = require("xss");

document.getElementById("publishbut").onclick = function () {
    var title = xss(document.getElementById('blogtitle').value);
    if (title === "") {
        alert("Please enter the blogtitle!");
    } else {
        var html = xss(editor.txt.html());
        console.log(title);
        console.log(html);
    }
};