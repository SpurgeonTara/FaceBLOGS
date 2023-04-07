const postSearchBarClick = document.querySelector(".post-search-bar-click");
// const mainContainerSingle = document.querySelector(".mainContainerSingle");
document.addEventListener("DOMContentLoaded", function (event) {
  var scrollpos = localStorage.getItem("scrollpos");
  if (scrollpos) window.scrollTo(0, scrollpos);
});

const restOfSeriesNames = document.querySelectorAll(`.seriesPostName`);
const moreSeries = document.querySelector(".moreSeries");
restOfSeriesNames.forEach((ser) => {
  ser.style.display = "none";
});

if (searchLogo) {
  searchLogo.addEventListener("click", (e) => {
    if (postSearchBarClick) {
      postSearchBarClick.classList.toggle("block");
    }
  });
}

if (moreSeries) {
  moreSeries.addEventListener("click", (e) => {
    restOfSeriesNames.forEach((ser) => {
      ser.style.display = "block";
      e.target.style.display = "none";
    });
  });
}

if (postSearchBarClick) {
  postSearchBarClick.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      let mainContainerSingle = document.querySelector(".mainContainerSingle");

      mainContainerSingle.innerHTML = `
        <h2>Search Results:</h2>
        `;
      fetch(`/blog/search?query=${e.target.value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data.length === 0) {
            mainContainerSingle.innerHTML =
              mainContainerSingle.innerHTML + `<p>Nothing Found!</p>`;
          } else {
            data.data.forEach((post) => {
              mainContainerSingle.innerHTML =
                mainContainerSingle.innerHTML +
                `<div class="searchResult">
                        <a href="/blog/post/${post._id}"><h1 class="searchResultTitle">${post.title}</h1></a>
                        <div class ="searchResultLikes">Total Likes: ${post.likes.length}</div>
                        <div class="searchResultComments">Total Comments: ${post.comments.length}</div>
                </div>`;
            });
          }
        });
    }
  });
}

window.onbeforeunload = function (e) {
  localStorage.setItem("scrollpos", window.scrollY);
};

// const searchBar = document.querySelector(".search-bar");

// searchBar.addEventListener("keyup", (e) => {
//   if (e.keyCode === 13) {
//     let postContentContainer = document.querySelector(".postContentContainer");
//     postContentContainer.innerHTML = "<h2>Search Results:</h2>";
//     fetch(`http://localhost:3000/blog/search?query=${e.target.value}`)
//       .then((res) => res.json())
//       .then((data) => {
//         data.data.forEach((post) => {
//           postContentContainer.innerHTML =
//             postContentContainer.innerHTML +
//             `<div class="searchResult">
//                     <a href="/blog/post/${post._id}"><h1 class="searchResultTitle">${post.title}</h1></a>
//                     <div class ="searchResultLikes">Total Likes: ${post.likes.length}</div>
//                     <div class="searchResultComments">Total Comments: ${post.comments.length}</div>

//             </div>`;
//         });
//       });
//   }
// });
