let Planeter = [];
let Planetmængde = 0;
let Ryk = null;
let offsetX, offsetY;
let Starttid;
let Nutid;

function setup() {
  createCanvas(800, 600);
  frameRate(60); 
  textSize(16);
  textAlign(CENTER, CENTER);
  Starttid = millis(); 
}

function draw() {
  background(240);
  
  
  Nutid = millis() - Starttid;
  
  // tegn planeter
  for (let planet of Planeter) {
    fill(planet.color);
    ellipse(planet.x, planet.y, planet.size);
    fill(0);
    text(planet.name, planet.x, planet.y);
  }
  
  
  fill(0);
  text("Tryk 'p' for at tilføje en ny planet", width/2, 20);
  
  
  let seconds = Nutid / 1000;
  text("Tid: " + seconds.toFixed(3) + " sekunder", width/2, 40);
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    Planetmængde++;
    Planeter.push({
      x: random(100, width-100),
      y: random(100, height-100),
      size: random(30, 80),
      name: "Planet " + Planetmængde,
      color: color(random(100, 255), random(100, 255), random(100, 255))
    });
  }
}

function mousePressed() {
  for (let i = Planeter.length - 1; i >= 0; i--) {
    let planet = Planeter[i];
    let d = dist(mouseX, mouseY, planet.x, planet.y);
    if (d < planet.size/2) {
      Ryk = planet;
      offsetX = planet.x - mouseX;
      offsetY = planet.y - mouseY;
      Planeter.splice(i, 1);
      Planeter.push(planet);
      break;
    }
  }
}

function mouseDragged() {
  if (Ryk) {
    Ryk.x = mouseX + offsetX;
    Ryk.y = mouseY + offsetY;
  }
}

function mouseReleased() {
  Ryk = null;
}
