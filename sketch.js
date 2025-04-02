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
};