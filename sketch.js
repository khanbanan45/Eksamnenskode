let Planeter = [];
let Planetmængde = 0;
let Ryk = null;
let offsetX, offsetY;
let Starttid;
let Nutid;
let paused = false;
let valgtPlanet = null;
let Vektortilstand = false;
let vektorStart, vektorSlut;

function setup() {
  createCanvas(800, 600);
  frameRate(60); 
  textSize(16);
  textAlign(CENTER, CENTER);
  Starttid = millis(); 
}

function draw() {
  background(240);
  
  if (!paused) {
    for (let planet of Planeter) {
      planet.x += planet.hastighedX || 0;
      planet.y += planet.hastighedY || 0;
      
      if (planet.x < 0) planet.x = width;
      if (planet.x > width) planet.x = 0;
      if (planet.y < 0) planet.y = height;
      if (planet.y > height) planet.y = 0;
    }
    Nutid = millis() - Starttid;
  }

  // Tegn planeter
  for (let planet of Planeter) {
    fill(planet.color);
    ellipse(planet.x, planet.y, planet.size);
    fill(0);
    text(planet.name, planet.x, planet.y);
    
    // Hastighedsvektor tegning
    if (planet.hastighedX || planet.hastighedY) {
      drawVector(planet.x, planet.y, planet.hastighedX*10, planet.hastighedY*10);
    }
  }

  // Aktiv vektor tegning
  if (Vektortilstand && vektorStart && mouseIsPressed) {
    drawVector(vektorStart.x, vektorStart.y, 
              mouseX - vektorStart.x, mouseY - vektorStart.y);
  }

  // instruks
  fill(0);
  text("Tryk 'p' for ny planet", width/2, 20);
  text("Tryk 'v' for vektorværktøj", width/2, 40);
  text("Mellemrum: pause/genstart", width/2, 60);
  text("Tid: " + (Nutid/1000).toFixed(3) + "s", width/2, 80);
  
  if (paused) text("PAUSET", width/2, height-20);
  if (Vektortilstand) text("VEKTORTILSTAND", 100, height-20);
}

function drawVector(x, y, dx, dy) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(2);
  line(0, 0, dx, dy);
  
  // pilhoved
  let angle = atan2(dy, dx);
  let len = sqrt(dx*dx + dy*dy);
  if (len > 10) {
    translate(len, 0);
    rotate(angle);
    fill(0);
    noStroke();
    triangle(0, 0, -10, -5, -10, 5);
  }
  pop();
  
  // hastighedstørelse
  if (len > 0) {
    fill(0);
    noStroke();
    textSize(12);
    text((len/10).toFixed(1), x + dx/2, y + dy/2);
  }
}

function mousePressed() {
  if (Vektortilstand) {
    for (let i = Planeter.length-1; i >= 0; i--) {
      let planet = Planeter[i];
      if (dist(mouseX, mouseY, planet.x, planet.y) < planet.size/2) {
        vektorStart = createVector(planet.x, planet.y);
        valgtPlanet = planet;
        return;
      }
    }
  } else {
    for (let i = Planeter.length-1; i >= 0; i--) {
      let planet = Planeter[i];
      if (dist(mouseX, mouseY, planet.x, planet.y) < planet.size/2) {
        Ryk = planet;
        offsetX = planet.x - mouseX;
        offsetY = planet.y - mouseY;
        return;
      }
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
  if (Vektortilstand && vektorStart && valgtPlanet) {
    let dx = mouseX - vektorStart.x;
    let dy = mouseY - vektorStart.y;
    valgtPlanet.hastighedX = dx/20; 
    valgtPlanet.hastighedY = dy/20;
  }
  Ryk = null;
  vektorStart = null;
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    Planetmængde++;
    Planeter.push({
      x: random(100, width-100),
      y: random(100, height-100),
      size: random(30, 80),
      name: "Planet " + Planetmængde,
      color: color(random(100, 255), random(100, 255), random(100, 255)),
      hastighedX: 0,
      hastighedY: 0
    });
  }
  
  if (key === ' ') paused = !paused;
  if (key === 'v' || key === 'V') Vektortilstand = !Vektortilstand;
}
