const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
//const canvas1 = document.querySelector('.bottomLayer');
const ctx = canvas.getContext('2d');
//const ctx1 = canvas1.getContext('2d'); 
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const sliderPanel = document.querySelector('.sliders');
const sliderOptions = sliderPanel.querySelectorAll('.slidertype');
const rgbSliders = sliderPanel.querySelectorAll('.rgbchange input');
const splitSlider = sliderPanel.querySelector('.rgbsplit input');
const greenscreenPanel = sliderPanel.querySelector('.greenscreen');
const greenscreenSliders = sliderPanel.querySelectorAll('.greenscreen input');
const effectDropdown = document.querySelector('.pickeffect');

let intervalID = null;

//change to object
let rAdd = 128;
let gAdd = 128;
let bAdd = 128;

let greenscreenLevels = {
  rmin:0,
  gmin: 0,
  bmin: 0,
  rmax: 255,
  gmax: 255,
  bmax: 255
}

let split = 0;

let currentEffect = rgbChange;

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error('OH OH!', err);
    });
}

function paintToCanvas(effect) {
  if (intervalID !== null) {
    clearInterval(intervalID);
  }

  width = video.videoWidth;
  height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  function paintWithEffect() {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0, 0, width, height);
    pixels = effect(pixels);
    ctx.putImageData(pixels, 0, 0);
  }

  intervalID = setInterval(paintWithEffect, 200);
}

let imageNum = 0;

//Github rejecting audio permission
function takePhoto() {

  // snap.currentTime = 0;
  // snap.play();

  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.download = `image_${imageNum++}`;
  link.innerHTML = `<img src="${data}" alt="image" />`;
  strip.insertBefore(link, strip.firstChild);
}

function toggleElementBySelector(selector) {//could make functional for multiple elements

  if (typeof selector !== 'string') {
    alert('Variable passed to \'ToggleElementBySelector()\' was not a string');
    return;
  }

  const x = document.querySelector(selector);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function updateInnerHTML(selector, HTML = '') {
  if (typeof HTML !== 'string' || typeof selector !== 'string') {
    alert('Variable passed to \'updateControlsContent()\' was not a string');
    return;
  }
  document.querySelector(selector).innerHTML = HTML;
}

function changeSliderPanel(e) {
  //hide all
  sliderOptions.forEach(slider => slider.style.display = 'none');
  let option = sliderPanel.querySelector(`.${this.value}`);

  option.style.display = 'block';

  currentEffect = window[option.dataset['func']];
  paintToCanvas(currentEffect);

}

function rgbChange(pixels) {

  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] / 255 * rAdd * 2;
    pixels.data[i + 1] = pixels.data[i + 1] / 255 * gAdd * 2;
    pixels.data[i + 2] = pixels.data[i + 2] / 255 * bAdd * 2;

  }
  return pixels;
}

function rgbSplit(pixels) {

  for (let i = 0; i < pixels.data.length; i += 4) {
    //console.log(pixels.data[i + 0]);
    //pixels.data[i - split * 4] = pixels.data[i + 0]; // RED
    //console.log(pixels.data[i - split * 4], split);
    //debugger;
    //pixels.data[i + split * 8] = pixels.data[i + 1]; // GREEN
    //pixels.data[i + split * 4] = pixels.data[i + 2]; // Blue

    pixels.data[i - 150 + split] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenscreen(pixels) {
  
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (
      pixels.data[i] > greenscreenLevels.rmin
      && pixels.data[i] < greenscreenLevels.rmax
      && pixels.data[i + 1] > greenscreenLevels.gmin
      && pixels.data[i + 1] < greenscreenLevels.gmax
      && pixels.data[i + 2] > greenscreenLevels.bmin
      && pixels.data[i + 2] < greenscreenLevels.bmax
    )
    pixels.data[i + 3] = 0;
  }
  return pixels;
}

function getRgbSliderValues() {
  //change selection method to include class or name selectors
  rAdd = Number(rgbSliders.item(0).value);
  gAdd = Number(rgbSliders.item(1).value);
  bAdd = Number(rgbSliders.item(2).value);
}

function getSplitSliderValue() {

  split = Number(splitSlider.value);
  
}

function getGreenscreenSliderValues() {
  
  greenscreenLevels[`${this.name}`] = Number(this.value);

}

getVideo();

video.addEventListener('canplay', function () { paintToCanvas(currentEffect) });

effectDropdown.addEventListener('input', changeSliderPanel);

//use for loop
rgbSliders.item(0).addEventListener('input', getRgbSliderValues);
rgbSliders.item(1).addEventListener('input', getRgbSliderValues);
rgbSliders.item(2).addEventListener('input', getRgbSliderValues);

greenscreenSliders.forEach(slider => slider.addEventListener('input', getGreenscreenSliderValues));

splitSlider.addEventListener('input', getSplitSliderValue);
//document.querySelector('.pickeffect').addEventListener('change', changeSliderPanel);




