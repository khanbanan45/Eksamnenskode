let Planeter = []; // tomt array der indeholder alle planeterne
let Planetmængde = 0; 
let Ryk = null;
let offsetX, offsetY;
let Starttid;
let Nutid;
let paused = true; // starter simulation på pause
let valgtPlanet = null; // ingen planeter skal være valgt til at starte med
let vektorMode = false; // den starter i "rykkemode", ikke "vektormode"
let vektorStart;
let tidskala = 1;
const maxBanePunkter = 1000; // Maksimalt antal punkter i banen

const G = 6.67430e-11; // Universets ægte tyngdekonstant
const AU = 1.496e11;
const målestok = 100 / AU; 100 // målestoksforhold 100 pixels = 1 astronomisk enhed 
const jordmasser = 5.98e24
const solmasser = 333000*jordmasser
const år = 31536000


function setup() {
  createCanvas(1000, 800);
  frameRate(60);
  textSize(14);
  textAlign(CENTER, CENTER);
  Starttid = millis(); // gemmer startstidspunkt
  
  // laver en sol med "tilføjplanet" funktionen, i dette tilfælde er det bare solen
  tilføjPlanet(width/2, height/2, 75, solmasser, "Sol");
}

function draw() {
  background(0);
  
  // Tegn baner først så de er bag planeterne
  tegnBaner();
  
  // kører kun de her funktioner når programmet ikke er pauset, dvs alt står stille når det er pauset
  if (!paused) {
    beregnTyngdekraft(); 
    opdaterPlaneter();
    Nutid = millis() - Starttid; // opdater simuleringstid
  }
// disse funktioner befindes her, da planeterne ligesom stadigvæk skal være tegnet op,
// hvis programmet er pauset eller ej
  tegnPlaneter();
  tegnUI();

  stroke(255);
  strokeWeight(1);
  line(450,780,550,780);
}

// dette er min funktion der tilføjer planeter til mit array af planeter
//Jeg har skrevet det op så jeg opretter hver planet som et objekt i, og objektet indeholder relevante -
// - egenskaber som position (x, y), masse, størrelse, farve og hastighedsvektorer.

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
    kraftY: 0,
    baneHistorie: [] // Array til at gamme planetens bane
  });
}

// TIlføjer planetens position til banens historie "BaneHistorie"
function opdaterBaneHistorie(planet) {
  
  planet.baneHistorie.push({x: planet.x, y: planet.y});
  
  // Begræns antallet af punkter
  if (planet.baneHistorie.length > maxBanePunkter) {
    planet.baneHistorie.shift(); // Fjern ældste punkt
  }
}

// Tegner baner for alle planeter
function tegnBaner() {
  for (let planet of Planeter) {
    if (planet.baneHistorie.length > 1) {
      stroke(planet.color); // farver banen samme farve som planeten
      strokeWeight(1);
      noFill();
      beginShape();
      for (let punkt of planet.baneHistorie) {
        vertex(punkt.x, punkt.y);
      }
      endShape();
    }
  }
}

// min funktion der beregner tyngdekraften imellem planeterne, med newtons gravitationslov
// F = G * (m1*m2)/(r^2)
function beregnTyngdekraft() {
  for (let planet of Planeter) {
    planet.kraftX = 0;
    planet.kraftY = 0;
  }
// i og j repræsenterer position i arrayet, j = i + 1 er til for at samme planet ikke sammenlignes med sig selv.
  for (let i = 0; i < Planeter.length; i++) {
    for (let j = i + 1; j < Planeter.length; j++) {
      let p1 = Planeter[i];
      let p2 = Planeter[j];

      // Indsat dette for at Konvertere pixels på canvasset til metere, for at kunne bruge si-enheder
      // til mine udregninger
      let dxPix = p2.x - p1.x;
      let dyPix = p2.y - p1.y;
      let dx = dxPix / målestok;
      let dy = dyPix / målestok;
      // brugte pythagoras for at finde faktisk afstand af himmelegeme i meter a^2 + b^2 = c^2
      let afstand = sqrt(dx*dx + dy*dy);

      if (afstand < 1e6) continue; // skal fixes

      // Newtons gravitationslov F = G * (m1*m2)/(r*r)
      let kraft = G * p1.masse * p2.masse / (afstand * afstand);
      let kraftX = kraft * dx / afstand;
      let kraftY = kraft * dy / afstand;

      // Konverterer "kraftX og Y" ved at gange med "målestok", vi går fra Newton m/s^2 til "pixelnewtons" pixel/s^2
      // Jeg ganger med målestok igen for at komme tilbage til pixelafstand
      p1.kraftX += kraftX * målestok;
      p1.kraftY += kraftY * målestok;
      p2.kraftX -= kraftX * målestok;
      p2.kraftY -= kraftY * målestok;
      // kraft lægges til planet 1, og trækkes fra planet 2, newtons 3. lov.
    }
  }
}

// Opdaterer hastighed og position af planeterne ved brug af newtons 2. lov, f = ma
function opdaterPlaneter() {
  let dt = tidskala / 60 //jeg brugte "deltatime", som jeg fandt på p5js.org.

  for (let planet of Planeter) {
    // newtons 2 lov f = m*a dette tilfælde a = f/m
    let accelerationX = planet.kraftX / planet.masse;
    let accelerationY = planet.kraftY / planet.masse;
    
    // dt ganges på, fordi ellers tager formlerne udgangspunkt i at 1 sekundt = 1 frame,
    // derfor er delta tid divideret med 60, da programmeret forventes at køre 60 fps.
    planet.hastighedX += accelerationX * dt;
    planet.hastighedY += accelerationY * dt;
    
    planet.x += planet.hastighedX * dt;
    planet.y += planet.hastighedY * dt;
    
    // Opdater banens historie
    if (frameCount % 2 === 0) { // Jeg gemmer kun hver anden frame, da mit program havde
      // problemer med at køre 60 fps, og jeg ville gerne optimere mit program.
      opdaterBaneHistorie(planet);
    }
  }
}

// funktion der tegner planeterne som farvede cirkler, skriver også navn og masse
// Hvis planeten har hastighed vises/tegnes hastighedsvektoren som en pil
// og hvis planeten er valgt burde pilen være rød
function tegnPlaneter() {
  for (let planet of Planeter) {
    // Tegn planet
    fill(planet.color);
    noStroke();
    ellipse(planet.x, planet.y, planet.size);
    
    // Tegn navn og masse på skærmen/canvasset
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
  line(0, 0, dx*1000000, dy*1000000);
  
  let angle = atan2(dy, dx);
  let len = sqrt(dx*dx + dy*dy);
  if (len > 10) {
    translate(dx*1000000, dy*1000000);
    rotate(angle);
    fill(col || color(255));
    noStroke();
    triangle(0, 0, -10, -5, -10, 5);
  }
  pop();
}

// tegner brugergrænsefladen til programmet, hvor instrukser, andet info vises.
function tegnUI() {
  fill(255);
  textAlign(LEFT);
  text("Tryk 'p' for ny planet", 20, 20);
  text("Tryk 'v' for vektorværktøj, drag og drop selected planet, og skab vektor!", 20, 40);
  text("Venstre klik på planet for at 'select'", 20,180)
  text("'pil-op'og'pil-ned' på en 'selected' planet ganger og dividerer masse med 2", 20,200)
  text("'+'og'-' får tiden til at gå dobbelt så hurtigt/langsomt", 20,220)
  text("Mellemrum: pause/genstart tiden", 20, 60);
  text("Tid: " + (Nutid/1000).toFixed(1) + "s", 20, 80);
  text("Planeter: " + Planeter.length, 20, 100);
  text("Tidsskalering: x" + tidskala.toFixed(1), 20, 120);
  text("AU", 490, 770)
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  
  
  if (valgtPlanet) {
    text("Valgt: " + valgtPlanet.name, 60, 220);
    text("Masse: " + valgtPlanet.masse + "kg", 80, 140);
    text("Hastighed: " + 
         sqrt(valgtPlanet.hastighedX**2 + valgtPlanet.hastighedY**2).toFixed(2), 
         60, 160);
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
        // Feature til hvis planeten rykkes af spilleren/brugeren, så slettes bane tegningen.
        planet.baneHistorie = [];
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

    //værktøjet var alt for følsomt
    let skalerned = 0.000001
    
    valgtPlanet.hastighedX = dx/20 * skalerned;
    valgtPlanet.hastighedY = dy/20 * skalerned;
    
    
  }
  // her nulstilles valg af planet
  Ryk = null;
  vektorStart = null;
}

// funktion der før "tilføjplanet" til at køre hvis man trykker på "p"
// og skifter imellem rykkemode vektormode og rykkemode når "v" trykkes på
function keyPressed() {
  if (key === 'p' || key === 'P') {
    let masse = (1*jordmasser);
    tilføjPlanet(mouseX, mouseY, 
                map(10, 10, 100, 15, 50), 
                masse);
  }
  
  if (key === ' ') paused = !paused;
  if (key === 'v' || key === 'V') vektorMode = !vektorMode;
  
  // Ændrer masse på valgt planet
  if (valgtPlanet) {
    if (keyCode === UP_ARROW) valgtPlanet.masse *= 2;
    if (keyCode === DOWN_ARROW) valgtPlanet.masse *= 0.5;
  }
  
  // controls til tidskalering, + gør tid dobbelt så hurtigt, - går dobbelt så langsomt
  if (key === '+' || key === '=') tidskala *= 2;
  if (key === '-' || key === '_') tidskala /= 2;
  
  
    }
