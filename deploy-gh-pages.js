const ghpages = require('gh-pages');

console.log('Deploying to gh-pages...');

ghpages.publish('build', function(err) {
  if (err) console.error(err);
  else console.log('DONE!');
});
