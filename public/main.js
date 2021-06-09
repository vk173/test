// Drag and drop
const dropArea = document.getElementById("drop-area")

// Prevent default drag behaviors
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false)
  document.body.addEventListener(eventName, preventDefaults, false)
})

// Highlight drop area when item is dragged over it
;['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false)
})

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false)

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function highlight(e) {
  dropArea.classList.add('active')
  dialog.showModal()
}

function unhighlight(e) {
  dropArea.classList.remove('active')
}

function handleDrop(e) {
  var dt = e.dataTransfer
  var files = dt.files

  handleFiles(files)
}

let uploadProgress = []
let progressBar = document.getElementById('progress-bar')

function initializeProgress(numFiles) {
  progressBar.value = 0
  uploadProgress = []

  for(let i = numFiles; i > 0; i--) {
    uploadProgress.push(0)
  }
}

function updateProgress(fileNumber, percent) {
  uploadProgress[fileNumber] = percent
  let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
  console.debug('update', fileNumber, percent, total)
  progressBar.value = total
}

function handleFiles(files) {
  if (files[0].type == 'application/json') {   // The file JSON
    var file = files[0]
    var reader = new FileReader()
    reader.onload = function(e) {
      var data = JSON.parse(reader.result),
      end = data.galleryImages.length - 1
      for (var i = 0; i < data.galleryImages.length; i++) {
        if (data.galleryImages[i].length !== 0) {
          uploadFile(data.galleryImages[i].url, i, end)
          document.getElementById('gallery__all').insertAdjacentHTML('afterBegin',
          '<li class="preview" style="min-height: 150px; width: calc(150px * (' + data.galleryImages[i].width + '/' + data.galleryImages[i].height + '));"><img src="' + data.galleryImages[i].url + '" alt=""></li>')
        }
      }
    }
    reader.readAsText(file)

  } else if (files[0].type == 'image/jpeg' | files[0].type == 'image/png' ) { // The file image
    files = [...files]
    var end = files.length - 1
    initializeProgress(files.length)

    for (var i = 0; i < files.length; i++) {
      uploadFile(files[i], i, end)
    }
    files.forEach(previewFile)
  }
}

function handleUrl(url) {
  var end = 0
  previewUrl(url)
  uploadFile(url, 0, end)
}



function previewUrl(url) {
  var image  = new Image()

  image.addEventListener("load", function () {
    // Show image
    document.getElementById('gallery__all').insertAdjacentHTML('afterBegin',
    '<li class="preview" style="min-height: 150px; width: calc(150px * (' + image.width + '/' + image.height + '));">' + '<img src="' + image.src + '" alt="">' + '</li>')
  })
  image.src = url
}

function previewFile(file) {
  var reader = new FileReader()

  reader.addEventListener("load", function () {
    var image  = new Image()

    image.addEventListener("load", function () {
      // Show image
      document.getElementById('gallery__all').insertAdjacentHTML('afterBegin',
      '<li class="preview" style="min-height: 150px; width: calc(150px * (' + image.width + '/' + image.height + '));">' + '<img src="' + image.src + '" alt="">' + '</li>');
    })
    image.src = reader.result
  })
  reader.readAsDataURL(file)
}

function uploadFile(file, i, end) {
  var url = '/upload'
  var xhr = new XMLHttpRequest()
  var formData = new FormData()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

  // Update progress
  xhr.upload.addEventListener("progress", function(e) {
    updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
  })

  xhr.addEventListener('readystatechange', function(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      updateProgress(i, 100) // <- Add this
      let name = file.name == undefined ? file : file.name + ' — '
      document.getElementById('gallery__info').insertAdjacentHTML("beforeend", name + ' ' + 'ОК' +'<br>');
    }
    if (xhr.readyState == 4 && xhr.status == 202) {
      setTimeout(function(){
        location.reload()
      }, 7000)
    }
    else if (xhr.readyState == 4 && xhr.status != 200) {
      updateProgress(i, 100)
      if (file) {
        let name = file.name == undefined ? file + ' — ' : file.name + ' — '
        document.getElementById('gallery__info').insertAdjacentHTML("beforeend", name + ' ' + 'Ошибка при загрузке' +'<br>');
      } else {
        document.getElementById('gallery__info').insertAdjacentHTML("beforeend", 'Ошибка при загрузке' +'<br>');
      }
    }
  })
  formData.append('upload_preset', 'test58819on@')
  if (end == i) formData.append('tags', 'end')
  formData.append('file', file)

  xhr.send(formData)
}

(function imagePreview() {//image preview
  fetch('gallery.json', {
    method: 'GET',
  })
  .then(function(response) {
    response.json().then(function(data) {
      console.log(data)
      for (var i = 0; i < data.length; i++) {
        if (data[i].length !== 0) {
          document.getElementById('gallery__all').innerHTML +=
          '<li class="img-gallery" style="min-height: 150px; width: calc(150px * (' + data[i].width + '/' + data[i].height + '));"><img src="' + data[i].url + '" alt=""></li>'
        }
      }
    })
  })
})()

window.onload = function() {
  arrayOfSelectedImages()
}

function arrayOfSelectedImages() {
  var deleteImg, srcArr = []
  function selectionImg(e){
    if (e.target.tagName == 'IMG' && e.target.className == '') {
      e.target.classList.add('delete')
      e.target.closest('li').classList.add('select')
    }
    else if (e.target.tagName == 'IMG' && e.target.className == 'delete') {
      e.target.classList.remove('delete')
      e.target.closest('li').classList.remove('select')
    }
    deleteImg = document.querySelectorAll('li.select')
    if (deleteImg.length > 0) document.querySelector('#basket').classList.add('visible')
    else if (deleteImg.length == 0) document.querySelector('#basket').classList.remove('visible')
    basket.onclick = function () {
      for (var i = 0; i < deleteImg.length; i++) {
        var src = deleteImg[i].children[0].attributes[0].value
        srcArr.push(src)
      }
      deleteFile(srcArr)
      deleteImg = ''
    }
  }
  gallery__all.addEventListener('click', selectionImg, false);
}

function deleteFile(file) {
  console.log(file)
  var url = '/delete'
  var xhr = new XMLHttpRequest()
  var formData = new FormData()
  xhr.open('DELETE', url, true)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

  formData.append('delete_preset', 'test58819on@')
  formData.append('file', file)
  formData.append('tags', 'delete')

  xhr.send(formData)
  console.log(xhr)
  setTimeout(function(){
    location.reload()
  }, 1000)
}
