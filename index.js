var KenBurns = require("kenburns");
var Q = require("q");
var Qimage = require("qimage");
var BezierEasing = require("bezier-easing");
var TransitionFade = require("transition-fade");

// Create the DOM

var container = document.createElement("div");
document.body.appendChild(container);
var canvasTransition = createCanvas();
var canvas1 = createCanvas();
var canvas2 = createCanvas();

// Create a fade transition and 2 ken burns effects engine.

var fade = TransitionFade.Canvas(canvasTransition);
var kenBurns1 = new KenBurns.Canvas(canvas1);
var kenBurns2 = new KenBurns.Canvas(canvas2);

// Wait the 4 images to load.

Q.all([
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Robert_Edward_Lee.jpg/692px-Robert_Edward_Lee.jpg",
  "http://upload.wikimedia.org/wikipedia/commons/2/2e/George_Gordon_Meade.jpg",
  "http://upload.wikimedia.org/wikipedia/commons/6/69/Battle_of_Gettysburg%2C_by_Currier_and_Ives.png",
  "http://upload.wikimedia.org/wikipedia/commons/3/33/Battle_of_Gettysburg.jpg"
].map(Qimage.anonymously))
.then(function (images) {

  // Define all steps.

  var robertSteps = [
    KenBurns.crop(1,    [0.5, 0.15]),
    KenBurns.crop(0.75, [0.5, 0.15])
  ];

  var georgeSteps = [
    KenBurns.crop(1.6, [0.5, 0.35]),
    KenBurns.crop(0.68, [0.5, 0.28])
  ];

  var battleSteps = [
    KenBurns.crop(0.48, [0.16, 0.48]),
    KenBurns.crop(0.48, [0.82, 0.35]),
    KenBurns.crop(0.34, [0.49, 0.45]),
    KenBurns.crop(0.34, [0.00, 0.72]),
    KenBurns.crop(0.38, [0.62, 0.78]),
    KenBurns.crop.largest
  ];

  var battleRealSteps = [
    KenBurns.crop.largest,
    KenBurns.crop(0.3, [0.7, 0.7])
  ];

  // Chain the effects and transitions.

  return Q(images[0])
  .then(displayF(canvas1))
  .then(kenBurns1.runPartial(robertSteps[0], robertSteps[1], 5000))
  .delay(4000)
  .then(function () {
    display(canvasTransition);
    kenBurns1.one(images[0], robertSteps[1]); // Flush the canvas1 – workaround for a Firefox bug
    return Q.all([
      kenBurns2.setClamped(false).run(images[1], georgeSteps[0], georgeSteps[1], 6000, BezierEasing(0, 0, 0.5, 1)),
      fade(canvas1, canvas2, 2000).then(displayF(canvas2))
    ]);
  })
  .delay(4000)
  .thenResolve(images[2])
  .then(kenBurns1.onePartial(battleSteps[0]))
  .then(displayF(canvas1))
  .delay(3500)
  .then(kenBurns1.runPartial(battleSteps[0], battleSteps[1], 400))
  .delay(3500)
  .then(kenBurns1.runPartial(battleSteps[1], battleSteps[2], 400))
  .delay(3500)
  .then(kenBurns1.runPartial(battleSteps[2], battleSteps[3], 400))
  .delay(3500)
  .then(kenBurns1.runPartial(battleSteps[3], battleSteps[4], 400))
  .delay(3500)
  .then(kenBurns1.runPartial(battleSteps[4], battleSteps[5], 200))
  .delay(5000)
  .then(function () {
    display(canvasTransition);
    kenBurns1.one(images[2], battleSteps[5]); // Flush the canvas1 – workaround for a Firefox bug
    return fade(canvas1, images[3], 2000);
  })
  .thenResolve(images[3])
  .then(kenBurns2.onePartial(battleRealSteps[0]))
  .then(displayF(canvas2))
  .delay(2000)
  .then(kenBurns2.runPartial(battleRealSteps[0], battleRealSteps[1], 2000))
  ;
})
.done();

// DOM utilities

function display (elt) {
  var child = container.children[0];
  if (child) container.removeChild(child);
  container.appendChild(elt);
}

function displayF (elt) {
  return function (o) {
    display(elt);
    return o;
  };
}

function createCanvas () {
  var canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  return canvas;
}

function createDiv () {
  var div = document.createElement("div");
  div.style.width = "640px";
  div.style.height = "480px";
  return div;
}

