const searchBar = document.querySelector(".search-bar");
const userReadingList = document.querySelector(".userReadingList");
const sponsors = document.querySelector(".sponsors");
const about = document.querySelector(".about");
const contact = document.querySelector(".contact");

const userReadingListSide = document.querySelector(".userReadingList-side");

const sponsorsSide = document.querySelector(".sponsors-side");
const aboutSide = document.querySelector(".about-side");
const contactSide = document.querySelector(".contact-side");
const searchBarClick = document.querySelector(".search-bar-click");
const searchLogo = document.querySelector(".search-logo");
const hamburger = document.querySelector(".hamburger");
const sideBarMenuContainer = document.querySelector(".sideBarMenuContainer");

if (hamburger) {
  hamburger.addEventListener("click", (e) => {
    if (sideBarMenuContainer.style.display === "block") {
      sideBarMenuContainer.style.display = "none";
    } else {
      sideBarMenuContainer.style.display = "block";
    }
  });
}

if (searchLogo) {
  searchLogo.addEventListener("click", (e) => {
    if (searchBarClick) {
      searchBarClick.classList.toggle("block");
    }
  });
}

if (searchBar) {
  searchBar.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      let mainSubContainer = document.querySelector(".mainSubContainer");

      mainSubContainer.innerHTML = `
        <h2>Search Results:</h2>
        `;
      fetch(`blog/search?query=${e.target.value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data.length === 0) {
            mainSubContainer.innerHTML =
              mainSubContainer.innerHTML + `<p>Nothing Found!</p>`;
          } else {
            data.data.forEach((post) => {
              mainSubContainer.innerHTML =
                mainSubContainer.innerHTML +
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

if (searchBarClick) {
  searchBarClick.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      let mainSubContainer = document.querySelector(".mainSubContainer");

      mainSubContainer.innerHTML = `
        <h2>Search Results:</h2>
        `;
      fetch(`/blog/search?query=${e.target.value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data.length === 0) {
            mainSubContainer.innerHTML =
              mainSubContainer.innerHTML + `<p>Nothing Found!</p>`;
          } else {
            data.data.forEach((post) => {
              mainSubContainer.innerHTML =
                mainSubContainer.innerHTML +
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

if (userReadingList) {
  userReadingList.addEventListener("click", (e) => {
    console.log("clicked");
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = "<h2>ReadingList</h2>";

    fetch(`auth/readingList`)
      .then((res) => res.json())
      .then((data) => {
        if (data.readingList.length === 0) {
          mainSubContainer.innerHTML =
            mainSubContainer.innerHTML +
            `<p>You Dont Have any Posts in Reading List</p>`;
        } else {
          data.readingList.forEach((post) => {
            mainSubContainer.innerHTML =
              mainSubContainer.innerHTML +
              `<div class="readingList">
                        <a href="/blog/post/${post._id}"><h1 class="readingListTitle">${post.title}</h1></a>
                        <div class ="readingListLike">Total Likes: ${post.likes.length}</div>
                        <div class="readingListComment">Total Comments: ${post.comments.length}</div>
                </div>`;
          });
        }
      });
  });
}

if (userReadingListSide) {
  userReadingListSide.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = "<h2>ReadingList</h2>";

    fetch(`auth/readingList`)
      .then((res) => res.json())
      .then((data) => {
        if (data.readingList.length === 0) {
          mainSubContainer.innerHTML =
            mainSubContainer.innerHTML +
            `<p>You Dont Have any Posts in Reading List</p>`;
        } else {
          data.readingList.forEach((post) => {
            mainSubContainer.innerHTML =
              mainSubContainer.innerHTML +
              `<div class="readingList">
                        <a href="/blog/post/${post._id}"><h1 class="readingListTitle">${post.title}</h1></a>
                        <div class ="readingListLike">Total Likes: ${post.likes.length}</div>
                        <div class="readingListComment">Total Comments: ${post.comments.length}</div>
                </div>`;
          });
        }
      });
  });
}

if (sponsors) {
  sponsors.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = `<div class="info">
    <h2>Sponsors:</h2>
    <p>Currently We Dont have any Sponsors</h2>
  </div>`;
  });
}

if (sponsorsSide) {
  sponsorsSide.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = `<div class="info">
    <h2>Sponsors:</h2>
    <p>Currently We Dont have any Sponsors</h2>
  </div>`;
  });
}

if (about) {
  about.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = `
    <div class="info">
      <h2>About:</h2>
      <p>This App Was Built for Fun and not for any business usage with an Inspiration from dev.to Community</h2>
    </div>
    `;
  });
}

if (aboutSide) {
  aboutSide.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = `
    <div class="info">
      <h2>About:</h2>
      <p>This App Was Built for Fun and not for any business usage with an Inspiration from dev.to Community</h2>
    </div>
    `;
  });
}

if (contact) {
  contact.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = `<div class="info">
    <h2>Contact Me:</h2>
    <p>Please Mail to: prakashamtara07@gmail.com for further queries.</h2>
    
    </div>`;
  });
}

if (contactSide) {
  contactSide.addEventListener("click", (e) => {
    let mainSubContainer = document.querySelector(".mainSubContainer");
    mainSubContainer.innerHTML = `<div class="info">
    <h2>Contact Me:</h2>
    <p>Please Mail to: prakashamtara07@gmail.com for further queries.</h2>
    
    </div>`;
  });
}

const codeTags = document.querySelectorAll("code");

// codeTags.forEach((tag) => {
//   tag.classList.add("language-markup");
//   tag.classList.add("language-css");
//   tag.classList.add("language-javascript");
//   tag.classList.add("language-c");
//   tag.classList.add("language-csharp");
//   tag.classList.add("language-cpp");
//   tag.classList.add("language-django");
//   tag.classList.add("language-git");
//   tag.classList.add("language-go");
//   tag.classList.add("language-graphql");
//   tag.classList.add("language-groovy");
//   tag.classList.add("language-handlebars");
//   tag.classList.add("language-java");
//   tag.classList.add("language-kotlin");
//   tag.classList.add("language-less");
//   tag.classList.add("language-php");
//   tag.classList.add("language-plsql");
//   tag.classList.add("language-pug");
//   tag.classList.add("language-sass");
//   tag.classList.add("language-scss");
//   tag.classList.add("language-typescript");
// });
