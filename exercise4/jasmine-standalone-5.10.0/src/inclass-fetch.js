// Inclass Fetch Exercise
// ======================

function countWords(url) {
    return fetch(url)
        .then(res => res.json())
        .then(posts => {
            let postWordCounts = {};

            // TODO: get the word count for each post
            posts.forEach(post => {
                const wordCount = post.body.split(' ').length;
                postWordCounts[post.id] = wordCount;
            });

            // return an object { postId: wordCount }
            return postWordCounts;
        });
}

function getLastLargest(url) {
    return countWords(url)
        .then(postWordCounts => {
            let largestCountSoFar = 0;
            let largestCountPostId = 0;

            // TODO: get all the post id keys 
            const postIds = Object.keys(postWordCounts);

            // TODO: now find the post id with longest post
            postIds.forEach(id => {
                const wordCount = postWordCounts[id];
                if (wordCount >= largestCountSoFar) {
                    largestCountSoFar = wordCount;
                    largestCountPostId = parseInt(id);
                }
            });
            return largestCountPostId;
        });
}