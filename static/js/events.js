// Function to edit an event
function editEvent(eventId) {
  const eventCard = document.querySelector(`.event-card[data-id="${eventId}"]`);
  const title = eventCard.querySelector('h2').textContent;
  const startDate = eventCard.querySelector('p:nth-of-type(1)').textContent.split(': ')[1];
  const endDate = eventCard.querySelector('p:nth-of-type(2)').textContent.split(': ')[1];
  const venue = eventCard.querySelector('p:nth-of-type(3)').textContent.split(': ')[1];
  const description = eventCard.querySelector('p:nth-of-type(4)').textContent.split(': ')[1];
  const discount = eventCard.querySelector('p:nth-of-type(5)').textContent.split(': ')[1];

  const editForm = document.createElement('form');
  editForm.classList.add('edit-event-form');
  editForm.innerHTML = `
    <div class="form-group">
      <label for="editEventTitle">Title</label>
      <input type="text" class="form-control" id="editEventTitle" name="title" value="${title}" required />
    </div>
    <div class="form-group">
      <label for="editEventStartDate">Start Date</label>
      <input type="date" class="form-control" id="editEventStartDate" name="startDate" value="${startDate}" required />
    </div>
    <div class="form-group">
      <label for="editEventEndDate">End Date</label>
      <input type="date" class="form-control" id="editEventEndDate" name="endDate" value="${endDate}" required />
    </div>
    <div class="form-group">
      <label for="editEventVenue">Venue</label>
      <input type="text" class="form-control" id="editEventVenue" name="venue" value="${venue}" required />
    </div>
    <div class="form-group">
      <label for="editEventDescription">Description</label>
      <textarea class="form-control" id="editEventDescription" name="description" rows="3" required>${description}</textarea>
    </div>
    <div class="form-group">
      <label for="editEventDiscount">Discount</label>
      <input type="text" class="form-control" id="editEventDiscount" name="discount" value="${discount}" required />
    </div>
    <div class="form-group">
      <label for="editEventCoverImage">Cover Image</label>
      <input type="file" class="form-control-file" id="editEventCoverImage" name="coverImage" />
    </div>
    <button type="submit" class="btn btn-primary">Update Event</button>
  `;

  eventCard.appendChild(editForm);

  editForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(editForm);
    const url = `/events/edit/${eventId}`;
    const method = 'PUT';

    fetch(url, {
      method: method,
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Event updated successfully') {
          alert(data.message);
          window.location.reload(); // Reload the page to see the updated event
        } else {
          alert('Failed to update event');
        }
      })
      .catch((error) => {
        console.error('Error updating event:', error);
        alert('Failed to update event');
      });
  });
}

// Function to delete an event
function deleteEvent(eventId) {
  fetch(`/events/delete/${eventId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Event deleted successfully') {
        alert('Event deleted successfully');
        window.location.reload(); // Reload the page to see the updated event list
      } else {
        alert('Failed to delete event');
      }
    })
    .catch((error) => {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    });
}

// Handle form submission for creating an event
// Handle form submission for creating an event
document.getElementById('createEventForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const url = '/events/create';
  const method = 'POST';

  fetch(url, {
    method: method,
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Event created successfully') {
        alert(data.message);
        window.location.reload(); // Reload the page to see the new event
      } else {
        alert('Failed to create event');
      }
    })
    .catch((error) => {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    });
});

// Fetch event data
fetch('/events')
  .then((response) => response.json())
  .then((data) => {
    const eventList = document.getElementById('eventList');
    data.events.forEach((event) => {
      const eventCard = document.createElement('div');
      eventCard.classList.add('event-card');
      eventCard.dataset.id = event.id;
      eventCard.innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Start Date:</strong> ${event.startDate}</p>
        <p><strong>End Date:</strong> ${event.endDate}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <p><strong>Discount:</strong> ${event.discount}</p>
        <img src="${event.coverImage}" alt="Event Cover Image" class="img-fluid" />
        <button class="btn btn-secondary" onclick="editEvent('${event.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
      `;
      eventList.appendChild(eventCard);
    });
  })
  .catch((error) => {
    console.error('Error fetching event data:', error);
  });

// Handle search
document.getElementById('searchInput').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const eventCards = document.querySelectorAll('.event-card');
  eventCards.forEach((card) => {
    const title = card.querySelector('h2').textContent.toLowerCase();
    const description = card.querySelector('p:nth-of-type(4)').textContent.toLowerCase();
    const venue = card.querySelector('p:nth-of-type(3)').textContent.toLowerCase();
    const startDate = card.querySelector('p:nth-of-type(1)').textContent.toLowerCase();
    const endDate = card.querySelector('p:nth-of-type(2)').textContent.toLowerCase();
    if (
      title.includes(query) ||
      description.includes(query) ||
      venue.includes(query) ||
      startDate.includes(query) ||
      endDate.includes(query)
    ) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
});

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
