// 獲取用戶資料
fetch('/profile')
  .then((response) => response.json())
  .then((data) => {
    if (data.userId !== 'admin') {
      window.location.href = 'profile.html'; // 重定向非管理員用戶
    }
    document.getElementById('profilePic').src = data.profilePic;
  })
  .catch((error) => {
    console.error('Error fetching profile data:', error);
  });

// 獲取所有用戶數據
fetch('/admin/users')
  .then((response) => response.json())
  .then((data) => {
    const userList = document.getElementById('userList');
    data.users.forEach((user) => {
      const userInfo = document.createElement('div');
      userInfo.classList.add('user-info');
      userInfo.innerHTML = `
        <p><strong>User ID:</strong> ${user.userId}</p>
        <p><strong>Nickname:</strong> ${user.nickname}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Gender:</strong> ${user.gender}</p>
        <p><strong>Birthdate:</strong> ${user.birthdate}</p>
        <p><strong>Profile Picture:</strong> <img src="${user.profilePic}" alt="Profile Picture" class="profile-pic" /></p>
        <button class="toggle-bookings">Show Bookings</button>
        <div class="booking-info">
          <h4>Bookings:</h4>
          ${user.bookings
            .map((booking) => {
              console.log('Processing booking:', booking);
              return booking.bookings
                .map(
                  (b) => `
                      <p><strong>Parking Bay:</strong> ${b.parkingBay || 'N/A'}</p>
                      <p><strong>Order Date:</strong> ${b.orderdate || 'N/A'}</p>
                      <p><strong>Car Plate No:</strong> ${b.CarPlateNo || 'N/A'}</p>
                      <p><strong>Entry Date:</strong> ${b.entryDate || 'N/A'}</p>
                      <p><strong>Exit Date:</strong> ${b.exitDate || 'N/A'}</p>
                      <p><strong>Parking Fee:</strong> ${b.parkingFee || 'N/A'}</p>
                      <p><strong>Selected Parking Bay:</strong> ${b['selected-parkingBay'] || 'N/A'}</p>
                      <p><strong>Vehicle Type:</strong> ${b.vehicleType || 'N/A'}</p>
                      <hr>
                    `
                )
                .join('');
            })
            .join('')}
        </div>
        <hr>
      `;
      userList.appendChild(userInfo);
    });

    // 添加按鈕點擊事件處理程序
    document.querySelectorAll('.toggle-bookings').forEach((button) => {
      button.addEventListener('click', (event) => {
        const bookingInfo = event.target.nextElementSibling;
        if (bookingInfo.style.display === 'none' || bookingInfo.style.display === '') {
          bookingInfo.style.display = 'block';
        } else {
          bookingInfo.style.display = 'none';
        }
      });
    });
  })
  .catch((error) => {
    console.error('Error fetching user data:', error);
  });

// 處理登出
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

// 在導航到其他頁面之前檢查用戶是否已登錄
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
