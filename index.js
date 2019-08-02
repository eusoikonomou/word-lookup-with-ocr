const {
  TesseractWorker,
} = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'images');
const arguments = process.argv;

const images = fs.readdirSync(pagesDir);
const wordsToSearch = arguments.splice(2);

if (wordsToSearch.length === 0) {
  console.error('No words passed as arguments');
  process.exit(1);
}

console.log(`Will search images for the words: ${wordsToSearch.join(',')}`);

function asynchronousImageToTextConversion(imageName) {
  return new Promise((resolve, reject) => {
    if (imageName === undefined) {
      return resolve('None of the words were found in the images');
    }
    const now = Date.now();
    console.log(`Processing image ${imageName}`);
    const worker = new TesseractWorker();
    const image = fs.readFileSync(path.join(pagesDir, imageName));
    worker
      .recognize(image)
      .then(({
        text
      }) => {
        worker.terminate();
        const words = text.split(' ').map(word => word.toLowerCase().replace(/[.,]/g, ''));
        if (wordsToSearch.some(word => words.includes(word))) {
          const timePeriod = Date.now() - now;
          console.log(`Processed image ${imageName} in ${timePeriod > 1000 ? `${(timePeriod/1000).toFixed(1)}s` : `${timePeriod}ms`}`);
          return resolve(`One of the words was found in image ${imageName}`);
        }
        const timePeriod = Date.now() - now;
        console.log(`Processed image ${imageName} in ${timePeriod > 1000 ? `${(timePeriod/1000).toFixed(1)}s` : `${timePeriod}ms`}`);
        resolve(asynchronousImageToTextConversion(images.shift()));
      });
  });
}

asynchronousImageToTextConversion(images.shift())
  .then(result => console.log(result));
