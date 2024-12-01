document.getElementById('bookingButton').addEventListener('click', function () {
  var selectedOption = document.querySelector('input[name="carpark"]:checked');
  if (!selectedOption) {
    alert('Please select vehicle type');
    return;
  }

  var vehicleType;
  switch (selectedOption.value) {
    case 'carpark1-option1':
      vehicleType = 'private-car';
      break;
    case 'carpark1-option2':
      vehicleType = 'disabled-private-car';
      break;
    case 'carpark1-option3':
      vehicleType = 'motorcycle';
      break;
    case 'carpark2-option1':
      vehicleType = 'van-type-light-goods-vehicle';
      break;
    default:
      alert('Please select a valid car park option');
      return;
  }

  var entryDate = document.getElementById('entry-date').value;
  var exitDate = document.getElementById('exit-date').value;

  if (entryDate === '' || exitDate === '') {
    alert('Please select entry date & time and exit date & time');
    return;
  }

  var entryDateTime = new Date(entryDate);
  var exitDateTime = new Date(exitDate);
  var currentDateTime = new Date();

  if (isNaN(entryDateTime) || isNaN(exitDateTime)) {
    alert('Invalid date format');
    return;
  }

  if (entryDateTime < currentDateTime.setHours(currentDateTime.getHours() + 2)) {
    alert('Booking can only be made before you enter the car park and it can be made 2 hours prior to entry.');
    return;
  }

  if (entryDateTime >= exitDateTime) {
    alert('Invalid entry date & time / exit date & time');
    return;
  }

  var hours = Math.ceil(Math.abs(exitDateTime - entryDateTime) / 36e5); // Round up the hours

  if (hours < 2) {
    alert('Selected duration is less than 2 hours');
    return;
  }

  if (
    (vehicleType === 'private-car' || vehicleType === 'disabled-private-car' || vehicleType === 'motorcycle') &&
    hours > 168
  ) {
    alert('Selected duration is exceeding limit');
    return;
  }

  if (vehicleType === 'van-type-light-goods-vehicle' && hours > 72) {
    alert('Selected duration is exceeding limit');
    return;
  }

  var parkingFee = calculateParkingFee(entryDateTime, exitDateTime, vehicleType);

  // Check if the booking duration is within the discount period
  var discountStartDate = new Date('2024-11-21');
  var discountEndDate = new Date('2024-12-07');
  if (entryDateTime >= discountStartDate && exitDateTime <= discountEndDate) {
    parkingFee *= 0.9; // Apply 10% discount
  }

  localStorage.setItem('vehicleType', vehicleType);
  localStorage.setItem('entryDate', entryDate);
  localStorage.setItem('exitDate', exitDate);
  localStorage.setItem('parkingFee', parkingFee.toFixed(2));

  window.location.href = 'booking-page2.html';
});

function calculateParkingFee(entryDateTime, exitDateTime, vehicleType) {
  var hours = Math.ceil(Math.abs(exitDateTime - entryDateTime) / 36e5); // Round up the hours

  var parkingFee;
  switch (vehicleType) {
    case 'disabled-private-car':
      parkingFee = 0;
      break;
    case 'van-type-light-goods-vehicle':
      parkingFee = hours * 15;
      break;
    case 'motorcycle':
      if (entryDateTime.getHours() === 0 && exitDateTime.getHours() === 6) {
        parkingFee = 25;
      } else if (hours < 24) {
        parkingFee = hours * 5;
      } else {
        parkingFee = Math.floor(hours / 24) * 40 + (hours % 24) * 5;
      }
      break;
    case 'private-car':
      if (entryDateTime.getHours() === 0 && exitDateTime.getHours() === 6) {
        parkingFee = 80;
      } else if (hours < 24) {
        parkingFee = hours * 15;
      } else {
        parkingFee = Math.floor(hours / 24) * 150 + (hours % 24) * 15;
      }
      break;
    default:
      parkingFee = 0;
      break;
  }

  return parkingFee;
}
