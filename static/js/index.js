// Array of image URLs for the rectangle
const rectangleImages = [
  '../assets/indexpage-photo1.jpg',
  '../assets/indexpage-photo2.jpg',
  '../assets/indexpage-photo3.jpg',
];

// Array of page control images
const pageControlImages = ['../assets/PageControl1.png', '../assets/PageControl2.png', '../assets/PageControl3.png'];

let currentRectangleIndex = 0;

function changeRectangleBackground() {
  const imageRectangle = document.getElementById('imageRectangle');
  imageRectangle.style.backgroundImage = `url('${rectangleImages[currentRectangleIndex]}')`;

  // Update the current image in the page control
  document.getElementById('currentImage').src = pageControlImages[currentRectangleIndex]; // Change the image source
}

// Change rectangle background every 5 seconds
const intervalId = setInterval(() => {
  currentRectangleIndex = (currentRectangleIndex + 1) % rectangleImages.length; // Loop back to the first image
  changeRectangleBackground();
}, 5000);

// Set the initial background for the rectangle to image 1
document.addEventListener('DOMContentLoaded', () => {
  changeRectangleBackground(); // Show image 1 on page load
  document.getElementById('totalImages').textContent = ` / ${rectangleImages.length}`; // Display total images
});

// Next button functionality
document.getElementById('nextButton').addEventListener('click', () => {
  currentRectangleIndex = (currentRectangleIndex + 1) % rectangleImages.length; // Move to next image
  changeRectangleBackground();
});

// Previous button functionality
document.getElementById('prevButton').addEventListener('click', () => {
  currentRectangleIndex = (currentRectangleIndex - 1 + rectangleImages.length) % rectangleImages.length; // Move to previous image
  changeRectangleBackground();
});
