let G = 6.67430e-11; // Tyngdekonstant
let sol; // Variabel der gemmer solens data
let jord; // Variabel til for at gemme Jordens data
let jordKredsløb = []; // Dette er et array, der skal gemme jordens kredsløb, "jordkredsløb"
const maksKredsløbPunkter = 30000; // Maks antal punkter i Jordens bane
const AU = 149.6e9; // 1 Astronomisk Enhed = afstand Jorden-Solen (meter)
const skala = 250 / AU; // Omregningsfaktor fra meter til pixels

function setup() {
  createCanvas(1000, 800); // Laver et lærred 1000x800 pixels
  
  // Solens egenskaber
  sol = {
    x: width/2, // X-position 
    y: height/2, // Y-position 
    diameter: 40, // Størrelse i pixels
    masse: 1.989e30, // Vægt i kg 
    vx: 0, // Hastighed i x-retning 
    vy: 0, // Hastighed i y-retning
    farve: [255, 204, 0] 
  };
  
  // Jordens egenskaber
  jord = {
    x: width/2 + AU * skala, // Startposition (1 AU fra Solen)
    y: height/2,
    diameter: 12, // Størrelse i pixels
    masse: 5.972e24, // Vægt i kg
    vx: 0, // Start hastighed i x-retning
    vy: -29.78e3 * skala, // Hastighed i y-retning (29.78 km/s)
    farve: [0, 100, 255] 
  };
}

function draw() {
  background(0); // Sort baggrund
  
  // Beregn afstanden mellem Solen og Jorden i meter
  let dx = (jord.x - sol.x) / skala;
  let dy = (jord.y - sol.y) / skala;
  let afstand = sqrt(dx * dx + dy * dy);
  
  // Beregn tyngdekraften mellem Solen og Jorden
  let kraft = G * sol.masse * jord.masse / (afstand * afstand);
  let kraftVinkel = atan2(dy, dx);
  
  // Opdater hastigheder
  let fx = kraft * cos(kraftVinkel);
  let fy = kraft * sin(kraftVinkel);
  
  // Anvend kraft på Jorden 
  jord.vx -= fx / jord.masse * skala;
  jord.vy -= fy / jord.masse * skala;
  
  // Opdater positioner
  jord.x += jord.vx;
  jord.y += jord.vy;
  
  // Gem jordens position i kredsløbsarray
  jordKredsløb.push(createVector(jord.x, jord.y));
  
  // Slet ældste punkt hvis der er for mange
  if (jordKredsløb.length > maksKredsløbPunkter) {
    jordKredsløb.splice(0, 1);
  }
  
  // Her tegnes sol
  fill(sol.farve);
  noStroke();
  ellipse(sol.x, sol.y, sol.diameter);
  
  // Tegn Jordens kredsløb
  noFill();
  stroke(100, 100, 255, 100);
  strokeWeight(1);
  beginShape();
  for (let p of jordKredsløb) {
    vertex(p.x, p.y);
  }
  endShape();
  
  // Her tegnes Jord
  fill(jord.farve);
  noStroke();
  ellipse(jord.x, jord.y, jord.diameter);
}