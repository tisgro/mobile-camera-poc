// File input

function calcBrightness(data, width, height) {
  var colorSum = 0;
  var r,g,b,avg;

  for (var x = 0, len = data.length; x < len; x+=4) {
      r = data[x];
      g = data[x+1];
      b = data[x+2];

      avg = Math.floor((r+g+b)/3);
      colorSum += avg;
  }

  return Math.floor(colorSum / (width * height));
}

function showBrightnessMsg() {
  var canvas = document.querySelector('.preview-canvas');
  var ctx = canvas.getContext('2d');

  // get brightness
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var brightness = calcBrightness(imageData.data, canvas.width, canvas.height);

  // show message
  var isSuccess = brightness > 100;
  var msgText = isSuccess ? 'Looks good!' : 'Too dark...';
  msgText += ' (brightness: ' + brightness + ')';
  renderMsg(msgText, isSuccess);
}

function renderMsg(text, isSuccess) {
  var msg = document.querySelector('.msg');
  msg.innerText = text;
  msg.style.display = 'block';
  msg.classList.toggle('msg--success', isSuccess);
  msg.classList.toggle('msg--warning', !isSuccess);
}

function renderImg(file) {
  var img = document.querySelector('.preview-img');
  var reader = new FileReader();

  reader.addEventListener('load', function() {
    img.src = reader.result;
    img.style.display = 'block';
  });

  reader.readAsDataURL(file);
}

function renderCanvas(file) {
  var canvas = document.querySelector('.preview-canvas');
  var ctx = canvas.getContext('2d');
  var reader = new FileReader();

  reader.addEventListener('load', function() {
    var img = new Image();

    img.addEventListener('load', function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // rotate clockwise 90deg
      // better solution: https://stackoverflow.com/questions/20600800/js-client-side-exif-orientation-rotate-and-mirror-jpeg-images/20600801
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.transform(0, 1, -1, 0, img.height, 0);

      ctx.drawImage(img, 0, 0);
      canvas.style.display = 'block';

      showBrightnessMsg();
    });

    img.src = reader.result;
  });

  reader.readAsDataURL(file);
}

function handleFileInputChange(evt) {
  var files = evt.target.files;
  var file = files.length ? files[0] : null;

  if (file) {
    renderCanvas(file);
  }
}

var fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(fileInput => fileInput.addEventListener('change', handleFileInputChange));

// WebRTC

var isCapturing;
var videoDevice;

function toggleCapture() {
  var captureButton = document.querySelector('#capture-button');
  var snapshotButton = document.querySelector('#snapshot-button');
  var video = document.querySelector('.preview-video');

  if (!videoDevice) {
    return;
  }

  if (isCapturing) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.style.display = 'none';
    captureButton.style.display = 'block';
    snapshotButton.style.display = 'none';
    isCapturing = false;
    return;
  }

  var constraints = {
    audio: false,
    video: {
      deviceId: {
        exact: videoDevice.deviceId
      }
    }
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      video.srcObject = stream;
      video.style.display = 'block';
      captureButton.style.display = 'none';
      snapshotButton.style.display = 'block';
      isCapturing = true;
    })
    .catch(error => console.log('getUserMedia error: ', error));
}

function takeSnapshot() {
  var video = document.querySelector('.preview-video');
  var canvas = document.querySelector('.preview-canvas');
  var ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.style.display = 'block';

  showBrightnessMsg();
  toggleCapture();
}

document.querySelector('#capture-button').addEventListener('click', toggleCapture);
document.querySelector('#snapshot-button').addEventListener('click', takeSnapshot);

// init video device

function getVideoDevice(devices) {
  var videoDevices = devices.filter(device => device.kind === 'videoinput');
  return videoDevices.find(device => device.label.indexOf('facing front') >= 0) ||
    videoDevices[0];
}

navigator.mediaDevices.enumerateDevices()
  .then(devices => videoDevice = getVideoDevice(devices));
