const logos = [
"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/200px-Coca-Cola_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Apple_Computer_Logo_rainbow.svg/140px-Apple_Computer_Logo_rainbow.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/I_Love_New_York.svg/200px-I_Love_New_York.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MasterCard_logo.png/200px-MasterCard_logo.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/W3C%C2%AE_Icon.svg/200px-W3C%C2%AE_Icon.svg.png",
"https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Mozilla_Mascot.svg/200px-Mozilla_Mascot.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/FedEx_Express.svg/200px-FedEx_Express.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/200px-McDonald%27s_Golden_Arches.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cadbury.svg/200px-Cadbury.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Burger_King_Logo.svg/140px-Burger_King_Logo.svg.png",
"https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Acorn_computers_logo_rendered_with_text.svg/200px-Acorn_computers_logo_rendered_with_text.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/CBM_Logo.svg/200px-CBM_Logo.svg.png"
]

window.addEventListener("load", () => {
  let images = "";
  for (let logo of logos) {
     images += `<img-melt src=${logo} jiggle blend await=click cite=${0}></img-melt>`;
  }
  window.main.innerHTML += images;
});
