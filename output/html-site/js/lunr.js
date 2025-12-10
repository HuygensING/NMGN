//js/lunr_index.min.js

var idx = null;
var documents = [];

// Load the lunr library and index when search button is clicked
function loadLunrIndex() {
  if (idx === null) {
    // First load the lunr library from CDN
    var lunrScript = document.createElement('script');
    lunrScript.src = 'https://unpkg.com/lunr/lunr.js';
    lunrScript.onload = function() {
      // Now load the lunr index script
      var indexScript = document.createElement('script');
      indexScript.src = 'js/lunr_index.min.js';
      indexScript.onload = function() {
        // Initialize lunr index after both scripts are loaded
        idx = lunr(function () {
          this.ref('name');
          this.field('text');

          documents.forEach(function (doc) {
            this.add(doc);
          }, this);
        });
        
        // Now perform the search
        performSearch();
      };
      document.head.appendChild(indexScript);
    };
    document.head.appendChild(lunrScript);
  } else {
    // Index already loaded, perform search directly
    performSearch();
  }
}

// Perform the actual search
function performSearch() {
  var searchField = document.getElementById('searchField');
  var searchResults = document.getElementById('searchResults');
  var searchResultsList = document.getElementById('searchResultsList');
  
  if (!searchField || !searchResults || !searchResultsList) {
    console.error('Required search elements not found');
    return;
  }
  
  var keyword = searchField.value.trim();
  
  if (keyword === '') {
    searchResults.style.display = 'none';
    return;
  }
  
  try {
    // Perform the search
    var results = idx.search(keyword);
    console.log(results);
    

    
    // Clear previous results
    searchResultsList.innerHTML = '';
    
    if (results.length === 0) {
      searchResultsList.innerHTML = '<li>No results found for "' + keyword + '"</li>';
    } else {
      // Display results
      results.forEach(function(result) {
        var li = document.createElement('li');
        
        // Extract the document data from the result
        var docData = result.ref.split("%"); // This contains the name object
        var href = docData[0] || '';
        var title = docData[1] || 'Untitled';
        console.log('d',docData);
        
        
        li.innerHTML = '<a href="/' + href + '">' + title.replaceAll("±", "")  ; //'</a> (Score: ' + result.score.toFixed(3) + ')'
        searchResultsList.appendChild(li);
      });
    }
    
    // Make search results visible
    searchResults.style.display = 'block';
    
  } catch (error) {
    console.error('Search error:', error);
    searchResultsList.innerHTML = '<li>Error performing search</li>';
    searchResults.style.display = 'block';
  }
}

// Add event listener to search button
document.addEventListener('DOMContentLoaded', function() {
  var searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', loadLunrIndex);
  }
  
  // Also allow search on Enter key in search field
  var searchField = document.getElementById('searchField');
  if (searchField) {
    searchField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        loadLunrIndex();
      }
    });
  }
});

// window.onload = function() {
//     console.log('1');
//   console.log(idx.search("kolfstokken"));
// }

