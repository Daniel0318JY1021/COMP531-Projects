document.addEventListener('DOMContentLoaded', () => {
    const postsWithImages = document.querySelectorAll('.post:has(.post-image)');
    const intervals = {};

    function getRandomIntervalTime() {
        return Math.floor(Math.random() * 5 + 1) * 1000;
    }

    function changeImage(postId) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        const imageElement = postElement.querySelector('.post-image');
        const newSrc = `https://picsum.photos/400/300?random=${Math.random()}`;
        imageElement.src = newSrc;
    }

    function startInterval(postId) {
        if (intervals[postId]) {
            clearInterval(intervals[postId]);
        }
        const delay = getRandomIntervalTime();
        intervals[postId] = setInterval(() => changeImage(postId), delay);
        console.log(`Started interval for post ${postId} with a delay of ${delay / 1000} seconds.`);
    }

    function stopInterval(postId) {
        clearInterval(intervals[postId]);
        delete intervals[postId];
        console.log(`Stopped interval for post ${postId}.`);
    }

    postsWithImages.forEach(post => {
        const postId = post.dataset.postId;
        const button = post.querySelector('.stop-start-btn');

        // Start all intervals by default
        startInterval(postId);

        button.addEventListener('click', () => {
            if (button.textContent === 'Stop') {
                stopInterval(postId);
                button.textContent = 'Start';
            } else {
                startInterval(postId);
                button.textContent = 'Stop';
            }
        });
    });
});