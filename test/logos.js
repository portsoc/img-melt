const logos = [
"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/330px-Coca-Cola_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/330px-Google_2015_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/FedEx_Express.svg/330px-FedEx_Express.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/330px-IBM_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/I_Love_New_York.svg/330px-I_Love_New_York.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/330px-Mastercard-logo.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/W3C%C2%AE_Icon.svg/330px-W3C%C2%AE_Icon.svg.png",
"https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Mozilla_Mascot.svg/330px-Mozilla_Mascot.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Apple_Computer_Logo_rainbow.svg/330px-Apple_Computer_Logo_rainbow.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald's_Golden_Arches.svg/330px-McDonald's_Golden_Arches.svg.png",
"https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Cadbury_%282020%29.svg/330px-Cadbury_%282020%29.svg.png",
"https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Acorn_computers_logo_rendered_with_text.svg/330px-Acorn_computers_logo_rendered_with_text.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Burger_King_logo_%281999%E2%80%932020%29.svg/330px-Burger_King_logo_%281999%E2%80%932020%29.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Commodore_C%3D_logo.svg/330px-Commodore_C%3D_logo.svg.png",
"https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/250px-Starbucks_Corporation_Logo_2011.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/330px-Pepsi_logo_2014.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/330px-Instagram_logo_2016.svg.png",
"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/330px-YouTube_full-color_icon_%282017%29.svg.png"
]


//https://upload.wikimedia.org/wikipedia/en/c/c9/Acorn_computers_logo_rendered_with_text.svg

window.addEventListener("load", () => {
  let images = "";
  for (let logo of logos) {
     images += `<img-melt src=${logo} jiggle blend await=click cite=${0}></img-melt>`;
  }
  window.main.innerHTML += images;
});
