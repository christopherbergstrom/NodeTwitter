var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('databases/words.sqlite');
db.run("PRAGMA case_sensitive_like = true");

var Twitter = require('twitter');
var credentials = require("../.credentials.js");
var twitParams = credentials.twitParams;
var twitClient = new Twitter(credentials.twitCredentials);

router.get('/', function(req, res, next)
{
  var count = 0;
  db.get("SELECT COUNT(*) AS tot FROM words", function(err,row)
  {
    var respText = "Words API: " + row.tot + " words online.";
    res.send(respText);
  });
});
// We'll implement our API here...
router.get('/count/:abbrev', function(req, res, next)
{
  var abbrev = req.params.abbrev;
  //var data = {};
  //var sql = "SELECT COUNT(*) AS wordcount FROM words WHERE word LIKE '"
  //+ abbrev + "%'"
  //db.get(sql, function(err,row)
  //{
  //  data.abbrev = abbrev;
  //  data.count = row.wordcount;
  //  res.send(data);
  //});
  var alen = abbrev.length;
  var dataArray = [];
  var sql = "SELECT substr(word,1," + alen + "+1) AS abbr, "
  +" count(*) AS wordcount FROM words " +" WHERE word LIKE '" + abbrev + "%'"
  +" GROUP BY substr(word,1," + alen + "+1)"
  db.all(sql, function(err,rows)
  {
    for (var i=0;i<rows.length;i++)
    {
      dataArray[i] = { abbrev: rows[i].abbr, count: rows[i].wordcount }
    }
    res.send(dataArray); //Express will stringify data, set Content-type
  });
});

router.get('/search/:abbrev', function(req, res, next)
{
  var abbrev = req.params.abbrev;
  var threshold = req.query.threshold || 3;
  var likeClause = "lower(word) LIKE lower('" + abbrev +"%')";
  var caseSensitive = req.query.caseSensitive;
  if (caseSensitive === "true")
  {
    console.log("Case Sensitive");
    likeClause = "word LIKE '" + abbrev + "%'";
  }
  if (threshold && abbrev.length < Number(threshold))
  {
    console.log(threshold);
    res.status(204).send() //204: Success, No Content.
    return;
  }
  var query = ( "SELECT id, word FROM words "
  +" WHERE " + likeClause + "ORDER BY word ");
  db.all(query, function(err,data)
  {
    if (err)
    {
      res.status(500).send("Database Error");
      console.error("database error");
    }
    else
    {
      res.status(200).json(data);
    }
  });
});

// get
router.get('/dictionary/:id', function(req, res, next)
{
  console.log("in get word");
  var id = req.params.id;
  var query = ( "SELECT id, word FROM words WHERE id = " + id);
  db.get(query, function(err,data)
  {
    if (err)
    {
      res.status(500).send("Database Error");
      console.error("database error");
    }
    else
    {
      //res.status(200).json(data);
      res.wordData = data;
      next();
    }
  });
});

// twitter crap
router.get('/dictionary/:id', function(req, res, next)
{
  console.log('second route (Twitter)');
  var word = res.wordData.word;
  res.wordData.twitter = {};
  var twitSearch = "https://api.twitter.com/1.1/search/tweets.json?";
  twitSearch += "q=";
  twitSearch += "%23" + word; // #word
  twitSearch += "&result_type=recent";
  twitClient.get(twitSearch, twitParams, function (error, twitter, response)
  {
    if (error)
    {
      console.log("Twitter FAIL!");
      console.log(error);
    }
    else
    {
      res.wordData.twitter = twitter;
    }
    res.status(200).json(res.wordData);
  });
});

// delete
router.delete('/dictionary/:id', function(req, res, next)
{
  console.log("in delete word");
  var id = req.params.id;
  var query = ( "DELETE FROM words WHERE id = " + id);
  db.run(query, function(err)
  {
    // console.log(data);
    if (err)
    {
      res.status(500).send("Database Error");
      console.error("database error");
    }
    else
    {
      res.status(202).send();
    }
  })
});

// update
router.put('/dictionary/:id', function(req, res, next)
{
  console.log("in update word");
  var id = req.params.id;
  var wordObj = {};
  wordObj.id = id;
  wordObj.word = req.body.word;
  var query = ( "UPDATE words SET word ='" + word + "' WHERE id =" + id);
  db.run(query, function(err)
  {
    // console.log(data);
    if (err)
    {
      console.log(error);
      res.status(500).send("Database Error");
      console.error("database error");
    }
    else
    {
      console.log(id + " updated to " + wordObj.word);
      res.status(200).send();
    }
  })
});

// create
router.post('/dictionary/:newWord', function(req, res, next)
{
  console.log("in create word");
  // var word = req.body.word;
  var word = req.params.newWord;
  var wordObj = {};
  wordObj.word = word;
  var query = ("INSERT INTO words (word) VALUES ('" + word + "')");
  db.run(query, function(err)
  {
    // console.log(data);
    if (err)
    {
      console.error("database error");
      console.error(error);
      res.status(500).send("Database Error");
    }
    else
    {
      wordObj.id = this.lastID;
      var newUrl = req.baseUrl + "/dictionary/" + wordObj.id;
      res.set("Location", newUrl);
      res.status(201).send();
    }
  })
});

// router.delete('/dictionary/:wordId', function(req, res, next) {
//   var wordId = req.params.wordId;
//   var query = ( "DELETE FROM words "
//                +" WHERE id = " + wordId);
//   db.run(query, function(err) {
//     console.log(data);
//     if (err) { res.status(500).send("Database Error"); }
//     else     { res.status(202).send(); }
//   })
// });

module.exports = router;
