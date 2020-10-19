const fs = require('fs');
const path = require('path');

const nock = require('nock');

const { 
  fetchRedditPostsByTopic,
  getRedditUrl,
  extractFields,
  fetchJson
} = require('../build/index');

describe('fetchRedditPostsByTopicPromise', () => {

  describe('Fetch json', () => {

    const response = { 
      data: { 
        children: [
          { data: { id: 1, title: 'RTX 3080 Crashes', thumbnail: 'self', subreddit: 'Nvidia', ups: 635, downs: 34 } },
          { data: { id: 2, title: 'Cyberpunk 2077 goes gold', thumbnail: 'self', subreddit: 'Nvidia', ups: 1124, downs: 450 } },
          { data: { id: 3, title: 'PS5 release data', thumbnail: 'self', subreddit: 'Nvidia', ups: 12903 , downs: 2415 } }
        ] 
      } 
    };

    it('Should match returned data', async () => {
      const redditUrl = 'https://reddit.com/r/pics/search.json?q=Gaming&sort=new';

      const responseData = { data: { children: [{ title: 'RTX 3080 Crashes' }] } };

      nock('https://reddit.com')
        .get('/r/pics/search.json?q=Gaming&sort=new')
        .reply(200, responseData);

      return await fetchJson(redditUrl)
        .then(res => expect(res).toEqual(responseData));
    });

    it('Should return a certain response when only topic is passed', async () => {
      const { data: { children } } = response;

      nock('https://www.reddit.com')
        .get('/r/pics/search.json?q=Gaming&sort=new')
        .reply(200, response);

      const request = await fetchRedditPostsByTopic('Gaming');

      expect(request).toEqual(children);
    });

    it('Should return a certain response when topic and fields is passed', async () => {
      const fields = ['id', 'title'];

      const { data: { children } } = response;

      nock('https://www.reddit.com')
        .get('/r/pics/search.json?q=Gaming&sort=new')
        .reply(200, response);

      const request = await fetchRedditPostsByTopic('Gaming', fields);

      const expectedResponse = extractFields(children, fields);

      expect(request).toEqual(expectedResponse);
    });

  });

  describe('Get Reddit Url', () => {

    it('Should expect correct URL', () => {
      const redditUrl = getRedditUrl('Gaming');

      expect(redditUrl).toEqual('https://www.reddit.com/r/pics/search.json?q=Gaming&sort=new');
    });

    it('invalid type given to topic', () => {
      expect(() => getRedditUrl(['Gaming'])).toThrowError();
    });

  });

  describe('Extract fields', () => {
    it('should return correct value', () => {
      const arrayOfObj = [{
        data: {
          name: 'Jordan Kelly',
          occupation: 'Software Engineer',
          company: 'Econify'
        }
      }];

      const extractedFields = extractFields(arrayOfObj, ['name', 'occupation']);

      expect(extractedFields).toEqual([{ name: 'Jordan Kelly', occupation: 'Software Engineer' }]);
    });

    it('should fail if data is not an array', () => {
      expect(() => extractFields('string')).toThrowError();
    });

    it('should throw error of fields contains a type other than a string', () => {
      const arrayOfObj = [{
        data: {
          name: 'Jordan Kelly',
          occupation: 'Software Engineer',
          company: 'Econify'
        }
      }];

      expect(() => extractFields(arrayOfObj, [1, 2, 3])).toThrowError();
    });
  });

});