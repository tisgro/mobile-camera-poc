// File input

function handleFileInputChange(evt) {
  var files = evt.target.files;
  var preview = document.querySelector('.preview');
  var reader = new FileReader();

  reader.addEventListener("load", function() {
    preview.src = reader.result;
    preview.style.visibility = 'visible';
  });

  if (files.length) {
    reader.readAsDataURL(files[0]);
  }
}

var fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(fileInput => fileInput.addEventListener('change', handleFileInputChange));

// WebRTC

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');

// var button = document.querySelector('button');
// button.onclick = function() {
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   canvas.getContext('2d').
//     drawImage(video, 0, 0, canvas.width, canvas.height);
// };

var constraints = {
  audio: false,
  video: true
};

function handleSuccess(stream) {
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function capture() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);
}

document.querySelector('#capture-button').addEventListener('click', capture);
