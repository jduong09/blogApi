document.addEventListener('DOMContentLoaded', () => {
  const posts = document.getElementsByClassName('list-item-posts');

  for (let i = 0; i < posts.length; i++) {
    posts[i].addEventListener('click', (e) => {
      e.preventDefault();
      const postId = e.currentTarget.getAttribute('data-post');

      window.location = `/posts/${postId}`;
    });
  }
});