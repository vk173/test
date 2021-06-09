const http = require('http'),
fs = require('fs'),
imageInfo = require('image-size'),
express = require('express'),
test = express(),
multer = require('multer'),
upload = multer(),
request = require('request')

test.use(express.urlencoded({ extended: true }))
test.use(express.json())
test.get('/', function(req, res) {creatingGalleryJson(), res.sendFile(__dirname + '/public/index.html')})
test.use(express.static(__dirname + "/public"))

test.post('/upload', upload.single('file'), (req, res, next) => { //upload images
  if(!req.body | req.body.file == '') return res.sendStatus(400)
  else if (req.body.file) { //url
    var keyName = 'public/img/' + req.body.file.match(/[^\/?#]+(?=$|[?#])/)
    request.get(req.body.file)
    .on("error", function(err) {console.log('error add url img')})
    .on('response',  function (response) {
      if (response.headers['content-type'] == 'image/jpeg' | response.headers['content-type'] == 'image/png') {
        request.get(req.body.file).pipe(fs.createWriteStream(keyName))
        if(req.body.tags == 'end') {res.sendStatus(202)} else {res.sendStatus(200)}
      }
      else { return res.sendStatus(400) }
    })
  }
  else if (req.file) { //C:
    var keyName = 'public/img/' + req.file.originalname,
    buffer = req.file.buffer
    fs.writeFile(keyName, buffer, 'binary', (err) => {
      if (err) console.log(err)
    })
    if(req.body.tags == 'end') {res.sendStatus(202)} else {res.sendStatus(200)}
  }
  else return res.sendStatus(400)
})

test.delete('/delete', upload.array('file'), (req, res, next) => { //delete images
  if(!req.body) return res.sendStatus(400)
  res.sendStatus(200)
  var array = req.body.file.split(',')

  for (var i = 0; i < array.length; i++) {
    fs.unlink('./public/' + array[i], (err) => {
      if (err) console.log(err)
    })
  }
  res.redirect
})

function creatingGalleryJson() {//creating a file "gallery.json" for previewing images
  fs.readdir('public/img', (err, files) => {
    var arr = []
    for (var i = 0; i < files.length; i++) {
      let src = 'img/'+files[i],
      image = imageInfo('public/' + src)
      arr.push({url: src, width: image.width, height: image.height})
    }
    fs.writeFile('public/gallery.json', JSON.stringify(arr), (err) => {
      if (err) console.log(err)
    })
  })
}

test.listen(3000, function () {
  console.log('ok')
})
