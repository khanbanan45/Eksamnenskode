let Planeter = []; // tomt array der indeholder alle planeterne
let Planetmængde = 0; 
let Ryk = null;
let offsetX, offsetY;
let Starttid;
let Nutid;
let paused = true; // starter simulation på pause
let valgtPlanet = null; // selvfølgelig skal ingen planeter være valgt til at starte med
let vektorMode = false; // den starter i "rykkemode", ikke "vektormode"
let vektorStart;
let G = 0.2; // tyngdekonstant indtil videre

function setup() {
  createCanvas(1000, 800);
  frameRate(60);
  textSize(14);
  textAlign(CENTER, CENTER);
  Starttid = millis(); // gemmer startstidspunkt
  
  // laver en "starter planet" eller stjerne
  tilføjPlanet(width/2, height/2, 100, 1000, "Sol");
}

function draw() {
  background(0);
  
  // kører kun de her funktioner når programmet ikke er pauset, dvs alt står stille når det er pauset
  if (!paused) {
    beregnTyngdekraft(); 
    opdaterPlaneter();
    Nutid = millis() - Starttid; // opdater simuleringstid
  }
// disse funktioner befines her, da planeterne ligesom stadigvæk skal være tegnet op,
// hvis programmet er pauset eller ej
  tegnPlaneter();
  tegnUI();
}

// dette er min funktion der tilføjer planeter til mit array af planeter
function tilføjPlanet(x, y, size, masse, navn) {
  Planetmængde++;
  Planeter.push({
    x: x,
    y: y,
    size: size,
    masse: masse,
    name: navn || "Planet " + Planetmængde, // giver hver planet unikt navn
    color: color(random(100, 255), random(100, 255), random(100, 255)), // tilfældige farver og proportioner
    hastighedX: 0,
    hastighedY: 0,
    kraftX: 0,
    kraftY: 0
  });
}

// min funktion der beregner tyngdekraften imellem planeterne, med newtons gravitationslov
// F = G * (m1*m2)/(r^2)
function beregnTyngdekraft() {
  
  for (let planet of Planeter) {
    planet.kraftX = 0;
    planet.kraftY = 0;
  }

  // Beregn tyngdekraft mellem alle par af planeter
  for (let i = 0; i < Planeter.length; i++) {
    for (let j = i + 1; j < Planeter.length; j++) {
      let p1 = Planeter[i];
      let p2 = Planeter[j];
      
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let afstand = sqrt(dx*dx + dy*dy);
      
      // Undgå division med nul (hvis planeter kolliderer)
      if (afstand < 5) continue;
      
      let kraft = G * p1.masse * p2.masse / (afstand * afstand);
      let kraftX = kraft * dx/afstand;
      let kraftY = kraft * dy/afstand;
      
      // Tilføj kræfter til begge planeter (Newtons 3. lov)
      p1.kraftX += kraftX;
      p1.kraftY += kraftY;
      p2.kraftX -= kraftX;
      p2.kraftY -= kraftY;
    }
  }
}
// Opdaterer hastighed og position af planeterne ved brug af newtons 2. lov, f = ma
function opdaterPlaneter() {
  for (let planet of Planeter) {
    // newtons 2 lov f = m*a dette tilfælde a = f/m
    let accelerationX = planet.kraftX / planet.masse;
    let accelerationY = planet.kraftY / planet.masse;
    
    
    planet.hastighedX += accelerationX;
    planet.hastighedY += accelerationY;
    
    
    planet.x += planet.hastighedX;
    planet.y += planet.hastighedY;
  }
}
// funktion der tegner planeterne som farvede cirkler, skriver også navn og masse
// Hvis planeten har hastighed vises/tegnes hastighedsvektoren som en pil
// og hvis planeten er valgt er pilen rød
function tegnPlaneter() {
  for (let planet of Planeter) {
    // Tegn planet
    fill(planet.color);
    noStroke();
    ellipse(planet.x, planet.y, planet.size);
    
    // Tegn navn og masse
    fill(255);
    text(planet.name + "\nM: " + planet.masse, planet.x, planet.y);
    
    // hvis planet har hastighed, kør drawvector funktion på planeten
    if (planet.hastighedX != 0 || planet.hastighedY != 0) {
      drawVector(planet.x, planet.y, 
                planet.hastighedX * 20, 
                planet.hastighedY * 20, 
                color(255, 150));
    }
    
    // Hvis planet er "valgt", kør drawVector funktion på planeten
    if (valgtPlanet === planet) {
      drawVector(planet.x, planet.y, 
                planet.kraftX, 
                planet.kraftY, 
                color(255, 0, 0, 150));
    }
  }
}

// funktion der tegner en pil med vinkel og længde svarende til den udregnede vektor.
function drawVector(x, y, dx, dy, col) {
  push();
  translate(x, y);
  stroke(col || color(255));
  strokeWeight(2);
  line(0, 0, dx, dy);
  
  let angle = atan2(dy, dx);
  let len = sqrt(dx*dx + dy*dy);
  if (len > 10) {
    translate(dx, dy);
    rotate(angle);
    fill(col || color(255));
    noStroke();
    triangle(0, 0, -10, -5, -10, 5);
  }
  pop();
}

// tegner brugergrænsefladen til programmet, hvor instrukser, og andet info vises.
function tegnUI() {
  fill(255);
  textAlign(LEFT);
  text("Tryk 'p' for ny planet", 20, 20);
  text("Tryk 'v' for vektorværktøj", 20, 40);
  text("Mellemrum: pause/genstart", 20, 60);
  text("Tid: " + (Nutid/1000).toFixed(1) + "s", 20, 80);
  text("Planeter: " + Planeter.length, 20, 100);
  
  if (valgtPlanet) {
    text("Valgt: " + valgtPlanet.name, 20, 120);
    text("Masse: " + valgtPlanet.masse, 20, 140);
    text("Hastighed: " + 
         sqrt(valgtPlanet.hastighedX**2 + valgtPlanet.hastighedY**2).toFixed(2), 
         20, 160);
  }
  
  if (paused) text("Pauset", width/2, 30);
  if (vektorMode) text("Vektormode", width/2, 50);
  if (!vektorMode) text("Rykkemode", width/2, 50);
}

// Tjekker om musen klikker på en planet,
// samt kode for vektormode hvor start vektoren gemmes 
function mousePressed() {
  if (vektorMode) {
    for (let i = Planeter.length-1; i >= 0; i--) {
      let planet = Planeter[i];
      if (dist(mouseX, mouseY, planet.x, planet.y) < planet.size/2) {
        vektorStart = createVector(planet.x, planet.y);
        valgtPlanet = planet;
        return;
      }
    }
  } else {
    // kode for "rykkemode", altså at man kan venstre clicke og dragge planeterne rundt på canvasset
    for (let i = Planeter.length-1; i >= 0; i--) {
      let planet = Planeter[i];
      if (dist(mouseX, mouseY, planet.x, planet.y) < planet.size/2) {
        Ryk = planet;
        valgtPlanet = planet;
        offsetX = planet.x - mouseX;
        offsetY = planet.y - mouseY;
        return;
      }
    }
    valgtPlanet = null;
  }
}

// planeten skal følge musen når jeg dragger den
function mouseDragged() {
  if (Ryk) {
    Ryk.x = mouseX + offsetX;
    Ryk.y = mouseY + offsetY;
  }
}

// når musen slippes i vektormode, tilføjer den vektorens kraft til planeten
// Altså der beregnes en ny hastighedsvektor baseret på musens position relativ til planeten

function mouseReleased() {
  if (vektorMode && vektorStart && valgtPlanet) {
    let dx = mouseX - vektorStart.x;
    let dy = mouseY - vektorStart.y;
    valgtPlanet.hastighedX = dx/20;
    valgtPlanet.hastighedY = dy/20;
  }
  // her nulstilles valg af planet
  Ryk = null;
  vektorStart = null;
}

// funktion der før "tilføjplanet" til at køre hvis man trykker på "p"
// og skifter imellem rykkemode vektormode og rykkemode når "v" trykkes på
function keyPressed() {
  if (key === 'p' || key === 'P') {
    let masse = (10);
    tilføjPlanet(mouseX, mouseY, 
                map(masse, 10, 100, 20, 50), 
                masse);
  }
  
  if (key === ' ') paused = !paused;
  if (key === 'v' || key === 'V') vektorMode = !vektorMode;
  
  // Ændrer masse på valgt planet
  if (valgtPlanet) {
    if (keyCode === UP_ARROW) valgtPlanet.masse *= 2;
    if (keyCode === DOWN_ARROW) valgtPlanet.masse *= 0.5;
  }
  
  
}
