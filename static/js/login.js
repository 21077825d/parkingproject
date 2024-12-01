document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const userId = document.getElementById('userId').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, password }),
  });

  if (response.redirected) {
    window.location.href = response.url;
  } else {
    const message = await response.text();
    alert(message); // Show popup error message
  }
});
