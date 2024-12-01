window.onload = function () {
  fetch('/profile')
    .then((response) => response.json())
    .then((data) => {
      if (data.email) {
        document.getElementById('email').value = data.email;
      }
    })
    .catch((error) => {
      console.error('Error fetching profile data:', error);
    });

  const vehicleType = localStorage.getItem('vehicleType');
  const entryDate = localStorage.getItem('entryDate');
  const exitDate = localStorage.getItem('exitDate');
  let parkingFee = parseFloat(localStorage.getItem('parkingFee'));
  const selectedBays = JSON.parse(localStorage.getItem('selectedParkingBay'));
  const numberOfBays = parseInt(localStorage.getItem('numberOfBays'), 10);

  if (numberOfBays === 2) {
    parkingFee *= 2;
  }

  const vehicleTypeText = getVehicleTypeText(vehicleType);

  const notesHtml = `
    <p>Vehicle Classification: ${vehicleTypeText}</p>
    <p>Entry Date & Time: ${entryDate}</p>
    <p>Exit Date & Time: ${exitDate}</p>
    <p>Booking Fee: HKD$${parkingFee.toFixed(2)}</p>
    <p>Selected Parking Bay(s): ${selectedBays.join(', ')}</p>
  `;

  document.querySelector('.notes').innerHTML = notesHtml;

  document.getElementById('payForm').addEventListener('submit', function (event) {
    event.preventDefault();
    handleFormSubmit(parkingFee, selectedBays);
  });
};

function handleFormSubmit(parkingFee, selectedBays) {
  const email = document.getElementById('email').value;
  const carPlateNo = document.getElementById('car-plate-no').value;
  const octopusCardNo = document.getElementById('octopus-card-no').value;
  const confirmOctopusCardNo = document.getElementById('octopus-card-no-confirm').value;
  const octopusCardLastDigit = document.getElementById('octopus-card-last-digit').value;
  const confirmLastDigit = document.getElementById('octopus-card-last-digit-confirm').value;
  if (!validateForm(email, carPlateNo, octopusCardNo, confirmOctopusCardNo, octopusCardLastDigit, confirmLastDigit)) {
    return;
  }

  const booking = {
    email: email,
    bookings: [
      {
        parkingBay: selectedBays.join(', '),
        orderdate: new Date().toISOString().split('T')[0],
        CarPlateNo: carPlateNo,
        entryDate: localStorage.getItem('entryDate'),
        exitDate: localStorage.getItem('exitDate'),
        parkingFee: `HKD$${parkingFee.toFixed(2)}`,
        'selected-parkingBay': selectedBays.join(', '),
        vehicleType: localStorage.getItem('vehicleType'),
      },
    ],
  };

  // Save the new bookings to the server
  fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Save the parking bay information to the server
      fetch('/api/parkingbays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          selectedBays.map((bayId) => ({
            bayId,
            email,
            enabled: true, // Set enabled to true when booking
          }))
        ),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(() => {
          console.log('Booking and parking bay information saved successfully');
          window.location.href = 'payment-success.html';
        })
        .catch((error) => {
          console.error('Error saving parking bay information:', error);
          alert('There was an error processing your request. Please try again.');
        });
    })
    .catch((error) => {
      console.error('Error saving booking information:', error);
      alert('There was an error processing your request. Please try again.');
    });
}

function validateForm(email, carPlateNo, octopusCardNo, confirmOctopusCardNo, octopusCardLastDigit, confirmLastDigit) {
  if (!email || !carPlateNo || !octopusCardNo || !confirmOctopusCardNo || !octopusCardLastDigit) {
    alert('Please fill in all fields');
    return false;
  }

  if (!/^\d{8}$/.test(octopusCardNo) || !/^\d$/.test(octopusCardLastDigit)) {
    alert('Invalid Octopus card number');
    return false;
  }

  if (octopusCardNo !== confirmOctopusCardNo || octopusCardLastDigit !== confirmLastDigit) {
    alert('Octopus card numbers do not match');
    return false;
  }

  return true;
}

function getVehicleTypeText(vehicleType) {
  switch (vehicleType) {
    case 'disabled-private-car':
      return 'Disabled Private Car';
    case 'van-type-light-goods-vehicle':
      return 'Van-type Light Goods Vehicle';
    case 'motorcycle':
      return 'Motorcycle';
    case 'private-car':
      return 'Private Car';
    default:
      return 'Unknown Vehicle Type';
  }
}
