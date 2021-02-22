var request = require('request');

module.exports.getTwitterPublicProfile = async (req, res) => {

let username  =  req.query.username;
let options = {
  'method': 'GET',
  // 'url': `https://api.twitter.com/1.1/users/show.json?screen_name=${username}`,
  'url': `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${username}&count=6`,
  'headers': {
    'Authorization': ['Bearer AAAAAAAAAAAAAAAAAAAAABMZEAEAAAAAuhF5liIkoc9UyhDEiXffcCjRzeo%3DJte2eVKdOZVuiy6ZRnJSmNU01ieAYx0vyZYy5XQCaCTxKQ39xv']
  }
};
request(options, function (error, response) { 
  if (error) throw new Error(error);
  return res.status(200).json({ status: true, userdata: JSON.parse(response.body) });
});
}