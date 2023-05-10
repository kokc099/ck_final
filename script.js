// opening and closing pop-up
function openForm1() {
  document.getElementById('myForm1').style.display = "block";
}
function openForm2() {
  document.getElementById('myForm2').style.display = "block";
}


function closeForm1() {
  document.getElementById("myForm1").style.display = "none";
}
function closeForm2() {
  document.getElementById("myForm2").style.display = "none";
}

// This man taught me everything--> Kazuki Umeda 
// https://www.youtube.com/watch?v=yrsxDOBL5xM

// draw webcam
// using instance function of p5js--keeps all the variables out of global scope, since mediapipe and p5js work differently than native js
// putting the p from the function(p) in front of things that aren't native js
let sketch = function(p){
  let canvas;

// storing calculation into the dMouse of distance between vertices
  let dMouse = [];

// min value between vertices
  let closest = 0;

  // iseditmode is when in toggles on/off to edit
  let isEditMode = false;

// sliders
  let fill_H_Slider, fill_S_Slider, fill_B_Slider, fill_O_Slider;
  let fill_H_Value, fill_S_Value, fill_B_Value, fill_O_Value;

// parameters for shapes
// indices can store multiple elements in an array 
  let shapes = [{
    fill_H : p.random(360),
    fill_S : 100,
    fill_B : 100,
    fill_O : 100,
    indices : []
  }];

  let shapeIndex = 0;

  let tParameters;

// sliders preset
  p.setup = function(){
// match the size of the canvas to the mediapipe size
    canvas = p.createCanvas(1000, 490);
    canvas.id('canvas');
    p.colorMode(p.HSB, 360, 100, 100, 100);

// slider (min, max, preset, step size)
// creating the element within js 
    fill_H_Value = p.createDiv();
    fill_H_Value.class('valueDisplay');
    fill_H_Slider = p.createSlider(0, 360, p.random(360), 3);
    fill_H_Slider.class('Slider');

    fill_S_Value = p.createDiv();
    fill_S_Value.class('valueDisplay');
    fill_S_Slider = p.createSlider(0, 100, 50, 4);
    fill_S_Slider.class('Slider');

    fill_B_Value = p.createDiv();
    fill_B_Value.class('valueDisplay');
    fill_B_Slider = p.createSlider(0, 100, 100, 5);
    fill_B_Slider.class('Slider');

    fill_O_Value = p.createDiv();
    fill_O_Value.class('valueDisplay');
    fill_O_Slider = p.createSlider(0, 100, 100, 6);
    fill_O_Slider.class('Slider');

// the parameters for the sliders
    tParameters = {
      fill_H : fill_H_Slider.value(),
      fill_S : fill_S_Slider.value(),
      fill_B : fill_B_Slider.value(),
      fill_O : fill_O_Slider.value(),
    }

// creating video
    capture = p.createCapture(p.VIDEO);
    capture.size(p.width, p.height);
    capture.hide();
  }

  p.draw = function(){
// clear draw transparent background
    p.clear();
// if the detection and landmarks are undefined, face mesh activates
    if(detections != undefined){
      if(detections.multiFaceLandmarks != undefined && detections.multiFaceLandmarks.length >= 1){
        p.drawShapes();
        if(isEditMode == true){
          p.faceMesh();
          p.editShapes();
        }
        p.glow();
      }
    }

// front-end of sliders
    fill_H_Value.html("fill hue: " + fill_H_Slider.value());
    fill_S_Value.html("fill saturation: " + fill_S_Slider.value());
    fill_B_Value.html("fill brightness: " + fill_B_Slider.value());
    fill_O_Value.html("fill opacity: " + fill_O_Slider.value());
  }

// function for face mesh p5
  p.faceMesh = function(){
    p.stroke(255);
    p.strokeWeight(3);

    p.beginShape(p.POINTS);
    for(let i=0; i<detections.multiFaceLandmarks[0].length; i++){
      let x = detections.multiFaceLandmarks[0][i].x * p.width;
      let y = detections.multiFaceLandmarks[0][i].y * p.height;
      p.vertex(x, y);

// distance between vertices
      let d = p.dist(x, y, p.mouseX, p.mouseY);
      dMouse.push(d);
    }
    p.endShape();

    let minimum = p.min(dMouse);
    closest = dMouse.indexOf(minimum);

    p.stroke(0,0,100);
    p.strokeWeight(10);
    p.point(
      detections.multiFaceLandmarks[0][closest].x * p.width,
      detections.multiFaceLandmarks[0][closest].y * p.height
    );

// erasing the values, the length allows the point to move
    dMouse.splice(0, dMouse.length);
  }

// indices is index (?) to identify the position of the element in an array
  p.mouseClicked = function(){
    if(p.mouseX >= 0 && p.mouseX <= p.width){
      if(p.mouseY >= 0 && p.mouseY <= p.height){
        if(isEditMode == true){
          shapes[shapeIndex].indices.push(closest);
          console.log(shapes);
        }
      }
    }
  }

  p.drawShapes = function(){
    for(let s = 0; s < shapes.length; s++){
      p.fill(
        shapes[s].fill_H,
        shapes[s].fill_S,
        shapes[s].fill_B,
        shapes[s].fill_O
      );
      p.strokeWeight(1.5);

      if(isEditMode == true){
        if(s == shapeIndex) p.glow('rgba(255, 255, 255, 100)');
        else p.glow('rgba(255, 255, 255, 0)');
      }else if(isEditMode == false){
        p.glow('rgba(255, 255, 255, 100)');
      }

      p.beginShape();
        for(let i = 0; i < shapes[s].indices.length; i++){
          p.vertex(
            detections.multiFaceLandmarks[0][shapes[s].indices[i]].x * p.width,
            detections.multiFaceLandmarks[0][shapes[s].indices[i]].y * p.height,
          );
        }
      p.endShape();
    }
  }

// slider parameters, linking fill and stroke
  p.editShapes = function(){
    // --- fill ---
    if(tParameters.fill_H != fill_H_Slider.value()){
      tParameters.fill_H = fill_H_Slider.value();
      shapes[shapeIndex].fill_H = fill_H_Slider.value();
    }
    if(tParameters.fill_S!= fill_S_Slider.value()){
      tParameters.fill_S = fill_S_Slider.value();
      shapes[shapeIndex].fill_S = fill_S_Slider.value();
    }
    if(tParameters.fill_B != fill_B_Slider.value()){
      tParameters.fill_B = fill_B_Slider.value();
      shapes[shapeIndex].fill_B = fill_B_Slider.value();
    }
    if(tParameters.fill_O != fill_O_Slider.value()){
      tParameters.fill_O = fill_O_Slider.value();
      shapes[shapeIndex].fill_O = fill_O_Slider.value();
    }
  }

// toggle on/off key
  p.keyTyped = function(){
    if(p.key === 'e' && event.ctrlKey) isEditMode = !isEditMode;

// create shape key, must include colors since it is making the colored shape
    if(p.key === 'c' && event.ctrlKey){
      if(shapes[shapes.length-1].indices.length > 0){
        shapes.push(
          {
            fill_H : p.random(360),
            fill_S : p.random(50),
            fill_B : p.random(100),
            fill_O : 100,

            indices : []
          }
        );
        shapeIndex = shapes.length-1;
      }
      console.log(shapes);
    }

// backwards key
// pop() from turtle -- removes last element and returns 
    if(p.key === 'z' && event.ctrlKey){
      if(shapes[shapeIndex] != undefined){
        if(shapes[shapeIndex].indices.length > 0) shapes[shapeIndex].indices.pop();
      }
      console.log(shapes[shapeIndex].indices);
    }

// delete key
    if(p.key === 'd' && event.ctrlKey){
      shapes = [
        {
          fill_H : p.random(360),
          fill_S : p.random(50),
          fill_B : p.random(100),
          fill_O : p.random(100),
          indices : []
        }
      ];
      shapeIndex = 0;
      console.log(shapes);
    }

// screenshit key 
// should make the background face transparent//opaque(?)
    if(p.key === 's' && event.ctrlKey){
      p.drawShapes();
      p.glow(); 
      p.saveCanvas('sorry bout my face', 'png'); 
    }
  }

// glowing edges
  p.glow = function(glowColor){
    p.drawingContext.shadowOffsetX = 0;
    p.drawingContext.shadowOffsetY = 0;
    p.drawingContext.shadowBlur = 20;
    p.drawingContext.shadowColor = glowColor;
  }
}

let myp5 = new p5(sketch);