window.addEventListener("load", function()
{
  var countField = document.getElementById("countWord");
  var countDisplay = document.getElementById("displayCount");
  var countCaseSensitive = document.getElementById("countCheckbox");
  countField.addEventListener("keyup", function(evt)
  {
    var abbrev = countField.value;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
      if (xhr.readyState == 4 && xhr.status == 200)
      {
        //var resp = JSON.parse(xhr.responseText);
        var resp = xhr.response;
        //countDisplay.innerHTML = "<li>" + resp.count + " words match "
        //+ resp.abbrev + "</li>";
        countDisplay.innerHTML = "";
        for (var i=0; i<resp.length; i++)
        {
          var item = document.createElement("li");
          item.innerHTML = resp[i].count + " words match " + resp[i].abbrev;
          countDisplay.appendChild(item);
        }
      }
    }
    if (countCaseSensitive.checked === true)
    {
      abbrev += "?ignoreCase=false";
    }
    else
    {
      abbrev += "?ignoreCase=true";
    }
    xhr.open("GET", "/wordsapi/v2/count/" + abbrev);
    xhr.responseType = 'json';
    xhr.send();
  })
  var searchField = document.getElementById("searchWord");
  var searchList = document.getElementById("wordlist");
  var searchCaseSensitive = document.getElementById("searchCheckbox");
  searchField.addEventListener("keyup", function(evt)
  {
    var abbrev = searchField.value;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
      if (xhr.readyState == 4 && xhr.status == 200)
      {
        searchList.innerHTML = "";
        for (var i=0; i<xhr.response.length; i++)
        {
          var opt = document.createElement("option");
          opt.value=xhr.response[i].id;
          opt.label=xhr.response[i].word; //chrome
          opt.innerHTML = xhr.response[i].word; //firefox
          searchList.appendChild(opt);
        }
      }
    }
    var uri = "/wordsapi/v2/search/" + abbrev;
    var params = [];
    var thresh = searchField.dataset.threshold;
    if (thresh && Number(thresh) > 0)
    {
      params.push("threshold =" + Number(thresh));
      // uri += "?threshold=" + Number(thresh);
    }
    if (searchCaseSensitive.checked === true)
    {
      params.push("caseSensitive=true");
      // uri += "?ignoreCase=false";
    }
    if (params.length)
    {
      uri += "?" + params.join("&");
    }
    // else
    // {
    //   uri += "?ignoreCase=true";
    // }
    xhr.open("GET", uri);
    xhr.responseType = 'json';
    xhr.send();
  });

  //Word search keyup callback
  searchList.addEventListener("change",function()
  {
    searchField.value=searchList.options[searchList.selectedIndex].label;
    var wordId = searchList.options[searchList.selectedIndex].value;
    displayWordData(wordId);
    deleteWord(wordId);
    updateWord(wordId);
  });

  var wordData = document.getElementById("wordData");


  var wordIdDiv = document.getElementById("wordId");
  var wordValueDiv = document.getElementById("wordValue");

  // get
  var displayWordData = function (wordId)
  {

    var uri = "/wordsapi/v2/dictionary/" + wordId;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
      if (xhr.readyState == 4)
      {
        if (xhr.status == 200)
        {
          wordIdDiv.innerHTML = xhr.response.id;
          wordValueDiv.innerHTML = xhr.response.word;
          showTweets(xhr.response.twitter);
        }
        else if (xhr.status == 404)
        {
          wordIdDiv.innerHTML = wordId;
          wordValueDiv.innerHTML = " not found";
        }
      }
    }
    xhr.open("GET", uri);
    xhr.responseType = 'json';
    console.log("displayWordData(): "+uri);
    xhr.send();
  }

  // refernce to html div
  var twitterList = document.getElementById("twitterList");

  var showTweets = function(twitter)
  {
    var tweetlist = twitter.statuses;
    twitterList.innerHTML = "";
    for (var i=0;i<tweetlist.length;i++)
    {
      tweet = tweetlist[i].text;
      // var tweetDiv = document.createElement("div");
      // tweetDiv.attributes.class = "tweetDiv";
      // tweetDiv.innerHTML = tweet;
      twitterList.innerHTML += tweetlist[i].text + "<br>";
      // twitterList.appendChild(tweetDiv);
    }
  }

  // delete
  var deletes = document.getElementById("deletes");
  var deleteWord = function(wordId)
  {
    deletes.addEventListener("click", function()
    {
      var uri = "/wordsapi/v2/dictionary/" + wordId;

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function()
      {
        if (xhr.readyState == 4)
        {
          if (xhr.status == 200)
          {
            wordIdDiv.innerHTML = xhr.response.id;
            wordValueDiv.innerHTML = xhr.response.word + " deleted!";
          }
          else if (xhr.status == 404)
          {
            wordIdDiv.innerHTML = wordId;
            wordValueDiv.innerHTML = " not found";
          }
        }
      }

      xhr.open("DELETE", uri);
      xhr.responseType = 'json';
      console.log("displayWordData(): "+uri);
      xhr.send();
    });
  }

  // create
  var addWord = document.getElementById("addWord");
  addWord.submit.addEventListener("click", function(e)
  {
    var newWord = document.addWord.word.value;
    var uri = "/wordsapi/v2/dictionary/" + newWord;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
      if (xhr.readyState == 4)
      {
        if (xhr.status == 200)
        {
          // wordIdDiv.innerHTML = xhr.response.id;
          // wordValueDiv.innerHTML = xhr.response.word;
        }
        else if (xhr.status == 404)
        {
          // wordIdDiv.innerHTML = wordId;
          // wordValueDiv.innerHTML = " not found";
        }
      }
    }

    xhr.open("POST", uri);
    xhr.responseType = 'json';
    console.log("displayWordData(): "+uri);
    xhr.send();
  });

  // update
  var updates = document.updates;
  var updateWord = function(wordId)
  {
    console.log("in update word 1");
    updates.submit.addEventListener("click", function(e)
    {
      console.log("in update word event");
      var uri = "/wordsapi/v2/dictionary/" + wordId;
      var newWord = document.updates.word.value;
      console.log(newWord);
      // var uri = "/wordsapi/v2/dictionary/" + newWord;

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function()
      {
        if (xhr.readyState == 4)
        {
          if (xhr.status == 200)
          {
            // wordIdDiv.innerHTML = xhr.response.id;
            // wordValueDiv.innerHTML = xhr.response.word;
          }
          else if (xhr.status == 404)
          {
            // wordIdDiv.innerHTML = wordId;
            // wordValueDiv.innerHTML = " not found";
          }
        }
      }

      xhr.open("PUT", uri);
      xhr.responseType = 'json';
      console.log("displayWordData(): "+uri);
      xhr.send();
    });
  }

});
