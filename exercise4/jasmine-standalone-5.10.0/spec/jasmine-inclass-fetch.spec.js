//
// Jasmine is a test framework for JavaScript 
//


describe("Jasmine Inclass Fetch Exercises", () => {
    const baseURL = 'https://jsonplaceholder.typicode.com';
    const posts = `${baseURL}/posts`;


    it('countWords should count the number of words in each post', (done) => {
        countWords(posts)
            .then(res => {
                let wordCounts = Object.values(res);
                expect(wordCounts[0]).toEqual(20);
                expect(wordCounts[1]).toEqual(28);
                expect(wordCounts[2]).toEqual(23);
                done();
            });
    });

    it('getLastLargest should return the id of the last post with the most words', (done) => {
        getLastLargest(posts)
            .then(res => {
                expect(parseInt(res)).toEqual(97);
                done();
            });
    });

})