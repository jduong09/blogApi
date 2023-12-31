document.addEventListener('DOMContentLoaded', () => {
  const btnSignOut = document.getElementById('btn-sign-out');

  btnSignOut.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/users/logout', {
      method: 'POST'
    }).then(data => {
      console.log(data);
      window.location = '/';
    });
  });
});