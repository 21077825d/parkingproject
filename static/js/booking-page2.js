let selectedBays = [];
let occupiedBays = {};
let disabledBays = {}; // Define disabledBays as a global variable

function createParkingBays(floor, side, svgElement) {
  const verticalGap = 180; // Increased vertical gap between the two rows
  const bayWidth = 60; // Enlarged width of parking bay
  const bayHeight = 90; // Enlarged height of parking bay
  for (let i = 1; i <= 15; i++) {
    const bayId = `${floor}${side}${i}`;
    const x = i * 70;
    const y = side === 'L' ? 10 : 10 + verticalGap;

    // Create parking bay rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'parking-bay');
    rect.setAttribute('id', bayId);
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', bayWidth);
    rect.setAttribute('height', bayHeight);
    rect.setAttribute('onclick', `toggleBooking('${bayId}')`);
    svgElement.appendChild(rect);

    // Create text for parking bay number
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'bay-number');
    text.setAttribute('x', x + bayWidth / 2);
    text.setAttribute('y', y + bayHeight / 2);
    text.textContent = bayId;
    svgElement.appendChild(text);

    // Mark occupied bays
    if (occupiedBays[bayId]) {
      rect.classList.add('occupied');
      rect.setAttribute('title', `Occupied by: ${occupiedBays[bayId]}`);
    } else if (disabledBays[bayId]) {
      rect.classList.add('disabled');
      rect.setAttribute('title', 'Disabled');
    }
  }
}

function initializeParkingMap() {
  fetch('/api/parkingbays')
    .then((response) => response.json())
    .then((data) => {
      data.forEach((bay) => {
        if (bay.enabled === false) {
          disabledBays[bay.bayId] = true;
        } else {
          occupiedBays[bay.bayId] = bay.email;
        }
      });

      const svgFloor1 = document.getElementById('svg-floor-1');
      createParkingBays('1', 'L', svgFloor1);
      createParkingBays('1', 'R', svgFloor1);

      const svgFloor2 = document.getElementById('svg-floor-2');
      createParkingBays('2', 'L', svgFloor2);
      createParkingBays('2', 'R', svgFloor2);

      const svgFloor3 = document.getElementById('svg-floor-3');
      createParkingBays('3', 'L', svgFloor3);
      createParkingBays('3', 'R', svgFloor3);
    })
    .catch((error) => console.error('Error fetching parking bays:', error));
}

function toggleBooking(id) {
  const bay = document.getElementById(id);
  const floor = id.charAt(0);
  const vehicleType = localStorage.getItem('vehicleType');

  if (bay.classList.contains('occupied')) {
    alert(`Parking bay ${id} is already occupied by ${occupiedBays[id]}.`);
    return;
  }

  if (bay.classList.contains('disabled')) {
    alert(`Parking bay ${id} is disabled and cannot be booked.`);
    return;
  }

  if (
    (vehicleType === 'van-type-light-goods-vehicle' && (floor === '1' || floor === '2')) ||
    (vehicleType === 'private-car' && floor === '3')
  ) {
    alert(`You cannot book parking bays on Floor ${floor} with a ${vehicleType.replace('-', ' ')}.`);
    return;
  }

  const side = id.charAt(1) === 'L' ? 'Left' : 'Right';
  const number = id.slice(2);
  if (bay.classList.contains('booked')) {
    const confirmCancel = confirm(
      `Do you want to cancel the booking for parking bay ${number} on ${side} side of Floor ${floor}?`
    );
    if (confirmCancel) {
      bay.classList.remove('booked');
      selectedBays = selectedBays.filter((bayId) => bayId !== id);
    }
  } else {
    if (selectedBays.length >= 2) {
      alert('You can only select up to 2 parking bays.');
      return;
    }
    const confirmBooking = confirm(`Do you want to book parking bay ${number} on ${side} side of Floor ${floor}?`);
    if (confirmBooking) {
      bay.classList.add('booked');
      selectedBays.push(id);
    }
  }
  updateSelectedBays();
}

function updateSelectedBays() {
  const selectedBaysText = selectedBays.join(', ');
  document.getElementById('selected-bays').textContent = `Selected Parking bay(s): ${selectedBaysText}`;
}

function nextPage() {
  if (selectedBays.length === 0) {
    alert('Please select at least one parking bay before proceeding.');
    return;
  }

  let parkingFee = parseFloat(localStorage.getItem('parkingFee'));
  if (selectedBays.length === 2) {
    parkingFee *= 1; // Double the parking fee if two bays are selected
  }

  localStorage.setItem('selectedParkingBay', JSON.stringify(selectedBays));
  localStorage.setItem('numberOfBays', selectedBays.length); // Store the number of selected bays
  localStorage.setItem('parkingFee', parkingFee.toFixed(2)); // Store the updated parking fee

  window.location.href = 'booking-page3.html';
}

// Initialize the parking map when the page loads
window.onload = initializeParkingMap;

// Ensure the nextButton exists before adding an event listener
const nextButton = document.getElementById('nextButton');
if (nextButton) {
  nextButton.addEventListener('click', nextPage);
}
