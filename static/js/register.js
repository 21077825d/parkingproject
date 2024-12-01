document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const userId = document.getElementById('userId').value;
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeatPassword').value;
  const email = document.getElementById('email').value;
  const gender = document.getElementById('gender').value;
  const birthdate = document.getElementById('birthdate').value;

  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, nickname, password, repeatPassword, email, gender, birthdate }),
  });

  if (response.redirected) {
    window.location.href = response.url;
  } else {
    const message = await response.text();
    alert(message); // Show popup error message
  }
});
