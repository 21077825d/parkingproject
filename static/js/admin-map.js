let occupiedBays = {}; // Define occupiedBays as a global variable
let disabledBays = {}; // Define disabledBays as a global variable
let editMode = false; // Define edit mode

// Fetch user profile data
fetch('/profile')
  .then((response) => response.json())
  .then((data) => {
    if (data.userId !== 'admin') {
      window.location.href = 'profile.html'; // Redirect non-admin users
    }
    document.getElementById('profilePic').src = data.profilePic;
  })
  .catch((error) => {
    console.error('Error fetching profile data:', error);
  });

// Fetch parking bay data and initialize the SVG map
fetch('/api/parkingbays')
  .then((response) => response.json())
  .then((data) => {
    data.forEach((bay) => {
      if (!bay.enabled) {
        disabledBays[bay.bayId] = true;
      } else {
        occupiedBays[bay.bayId] = bay.email;
      }
    });

    const svgFloor1 = document.getElementById('svg-floor-1');
    createParkingBays('1', 'L', svgFloor1, occupiedBays, disabledBays);
    createParkingBays('1', 'R', svgFloor1, occupiedBays, disabledBays);

    const svgFloor2 = document.getElementById('svg-floor-2');
    createParkingBays('2', 'L', svgFloor2, occupiedBays, disabledBays);
    createParkingBays('2', 'R', svgFloor2, occupiedBays, disabledBays);

    const svgFloor3 = document.getElementById('svg-floor-3');
    createParkingBays('3', 'L', svgFloor3, occupiedBays, disabledBays);
    createParkingBays('3', 'R', svgFloor3, occupiedBays, disabledBays);
  })
  .catch((error) => {
    console.error('Error fetching parking bays:', error);
  });

// Function to create parking bays
function createParkingBays(floor, side, svgElement, occupiedBays, disabledBays) {
  const verticalGap = 180;
  const bayWidth = 60;
  const bayHeight = 90;
  for (let i = 1; i <= 15; i++) {
    const bayId = `${floor}${side}${i}`;
    const x = i * 70;
    const y = side === 'L' ? 10 : 10 + verticalGap;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'parking-bay');
    rect.setAttribute('id', bayId);
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', bayWidth);
    rect.setAttribute('height', bayHeight);
    rect.setAttribute('onclick', `toggleBooking('${bayId}')`);
    rect.setAttribute('onmouseover', `showUserInfo('${bayId}')`);
    rect.setAttribute('onmouseout', `hideUserInfo()`);
    svgElement.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'bay-number');
    text.setAttribute('x', x + bayWidth / 2);
    text.setAttribute('y', y + bayHeight / 2);
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = bayId;
    svgElement.appendChild(text);

    if (occupiedBays[bayId]) {
      rect.classList.add('occupied');
      rect.setAttribute('title', `Occupied by: ${occupiedBays[bayId]}`);
    } else if (disabledBays[bayId]) {
      rect.classList.add('disabled');
      rect.setAttribute('title', 'Disabled');
    }
  }
}

// Function to toggle booking status
function toggleBooking(id) {
  const bay = document.getElementById(id);
  const floor = id.charAt(0);

  if (editMode) {
    if (bay.classList.contains('occupied')) {
      const confirmDelete = confirm(`Do you want to delete the booking for parking bay ${id}?`);
      if (confirmDelete) {
        bay.classList.remove('occupied');
        delete occupiedBays[id];
        // Make an API call to delete the record from parkingbay.json
        fetch(`/api/parkingbays/${id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to delete the record');
            }
            console.log(`Parking bay ${id} deleted successfully`);
          })
          .catch((error) => {
            console.error('Error deleting the record:', error);
          });
      }
    } else if (bay.classList.contains('disabled')) {
      const confirmEnable = confirm(`Do you want to enable the parking bay ${id}?`);
      if (confirmEnable) {
        bay.classList.remove('disabled');
        delete disabledBays[id];
        // Make an API call to update the record in parkingbay.json
        fetch(`/api/parkingbays/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: true }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to update the record');
            }
            console.log(`Parking bay ${id} enabled successfully`);
          })
          .catch((error) => {
            console.error('Error updating the record:', error);
          });
      }
    } else {
      const confirmDisable = confirm(`Do you want to disable the parking bay ${id}?`);
      if (confirmDisable) {
        bay.classList.add('disabled');
        disabledBays[id] = true;
        // Make an API call to update the record in parkingbay.json
        fetch(`/api/parkingbays/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: false }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to update the record');
            }
            console.log(`Parking bay ${id} disabled successfully`);
          })
          .catch((error) => {
            console.error('Error updating the record:', error);
          });
      }
    }
  } else {
    if (bay.classList.contains('occupied')) {
      alert(`Parking bay ${id} is already occupied by ${occupiedBays[id]}.`);
      return;
    } else if (bay.classList.contains('disabled')) {
      alert(`Parking bay ${id} is disabled and cannot be booked.`);
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
      }
    } else {
      const confirmBooking = confirm(`Do you want to book parking bay ${number} on ${side} side of Floor ${floor}?`);
      if (confirmBooking) {
        bay.classList.add('booked');
        // Mark the bay as enabled when booked
        fetch(`/api/parkingbays/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: true, email: '21074611d@gmail.com' }), // Include email in the request body
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to update the record');
            }
            console.log(`Parking bay ${id} enabled successfully`);
          })
          .catch((error) => {
            console.error('Error updating the record:', error);
          });
      }
    }
  }
}

// Function to show user info on hover
function showUserInfo(bayId) {
  const bay = document.getElementById(bayId);
  if (occupiedBays[bayId]) {
    bay.setAttribute('title', `Occupied by: ${occupiedBays[bayId]}`);
  }
}

// Function to hide user info on mouse out
function hideUserInfo() {
  // No action needed, title attribute will be removed automatically
}

// Function to toggle edit mode
function toggleEditMode() {
  editMode = !editMode;
  const editButton = document.querySelector('.edit-button');
  if (editMode) {
    editButton.textContent = 'Exit Edit Mode';
  } else {
    editButton.textContent = 'Edit';
  }
}

// Function to confirm changes and save the map
function confirmChanges() {
  const disabledBaysArray = Object.keys(disabledBays).map((bayId) => ({
    bayId,
    enabled: false,
  }));

  // Make an API call to save the disabled bays
  fetch('/api/parkingbays/disable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(disabledBaysArray),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to save the changes');
      }
      alert('Changes saved successfully');
    })
    .catch((error) => {
      console.error('Error saving the changes:', error);
    });
}

// Handle logout
document.getElementById('logoutButton').addEventListener('click', () => {
  fetch('/logout', {
    method: 'POST',
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = 'login.html';
      } else {
        alert('Logout failed');
      }
    })
    .catch((error) => {
      console.error('Error during logout:', error);
    });
});

// Check if user is logged in before navigating to other pages
document.querySelectorAll('.sidebar-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    fetch('/profile')
      .then((response) => {
        if (response.ok) {
          window.location.href = link.getAttribute('href');
        } else if (response.status === 401) {
          window.location.href = 'login.html';
        }
      })
      .catch((error) => {
        console.error('Error checking login status:', error);
        window.location.href = 'login.html';
      });
  });
});
