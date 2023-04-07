const uititle = document.querySelector(".ui-title");
const uidescription = document.querySelector(".ui-description");
const uiCoverImg = document.querySelector(".ui-coverImgUrl");
const uiSubmitButton = document.querySelector(".postuiSubmitbtn");
const submitSeries = document.querySelector(".submitSeries");
const uiSeriesName = document.querySelector(".uiSeriesName");
const seriesSelection = document.querySelector(".seriesSelection");
const publishType = document.querySelector(".publishType");

const postSettings = document.querySelector(".postSettings");

const coverImageUrl = document.querySelector(".imageUrl");
const seriesName = document.querySelector(".seriesName");
const publish = document.querySelector(".publish");

if (uititle.value.toString() === "") {
  uititle.placeholder = "New Post title here..";
}
if (uidescription.value.toString() === "") {
  uidescription.placeholder = "Write your post content here..";
}

uititle.addEventListener("keyup", (e) => {
  e.target.style.height = "1px";
  e.target.style.height = 25 + e.target.scrollHeight + "px";
  if (e.target.value === "") {
    e.target.placeholder = "New Post title here..";
  }
});

uidescription.addEventListener("keyup", (e) => {
  e.target.style.height = "1px";
  e.target.style.height = 25 + e.target.scrollHeight + "px";
  if (e.target.value === "") {
    e.target.placeholder = "Write your post content here..";
  }
});

const sectionDescription = document.querySelector(".sectionDescription");

const titleMessage = document.createElement("div");
titleMessage.innerHTML = `<h2>Writing a Great Post Title</h2>
<p>Think of your post title as a super short (but compelling!) description — like an overview of the actual post in one short sentence.
Use keywords where appropriate to help ensure people can find your post by search. </p>`;

const descriptionMessage = document.createElement("div");
descriptionMessage.innerHTML = `<h2>Editor Basics</h2>
<p>Use Markdown to write and format posts. — You can use Liquid tags to add rich content such as Tweets, YouTube videos, etc.
In addition to images for the post's content, you can also drag and drop a cover image. </p>`;

uititle.addEventListener("focus", (e) => {
  sectionDescription.innerHTML = "";
  sectionDescription.style.margin = "9rem 0 0 0";
  sectionDescription.appendChild(titleMessage);
});

uidescription.addEventListener("focus", (e) => {
  sectionDescription.innerHTML = "";
  sectionDescription.style.margin = "18rem 0 0 0";
  sectionDescription.appendChild(descriptionMessage);
});

uiCoverImg.addEventListener("click", (e) => {
  coverImageUrl.click();
});

coverImageUrl.addEventListener("change", (e) => {
  const arr = e.target.value.split("\\");
  const fileName = arr[arr.length - 1];
  const coverFileName = document.querySelector(".coverFileName");
  coverFileName.innerText = fileName;
});

seriesSelection.addEventListener("change", (e) => {
  if (e.target.value == "dots" || e.target.value == "none") {
    uiSeriesName.value = "";
  } else {
    uiSeriesName.value = e.target.value;
  }
});

submitSeries.addEventListener("click", (e) => {
  let selectedSeries;
  selectedSeries = uiSeriesName.value.toLowerCase().trim();
  if (selectedSeries == "") {
    selectedSeries = seriesSelection.value;
  }
  seriesName.value = selectedSeries;
  publish.value = publishType.value;
  document.querySelector(".postOptions").style.display = "none";
});

postSettings.addEventListener("click", (e) => {
  document.querySelector(".postOptions").style.display = "block";
});

uiSubmitButton.addEventListener("click", (e) => {
  const title = uititle.value.trim();
  const description = uidescription.value.trim();
  const nameSeries = seriesName.value;
  document.querySelector(".title").value = title;
  document.querySelector(".description").value = DOMPurify.sanitize(
    marked(description)
  );

  const isEditing = document.querySelector(".isEditing").value;

  if (isEditing.toString() === "true") {
    const postId = document.querySelector(".postId").value;
    if (nameSeries == "") {
      document.querySelector(".myForm").action = "/blog/edit/post/" + postId;
    } else if (nameSeries == "dots") {
      document.querySelector(".myForm").action =
        "/blog/edit/post/" + postId + "?series=dots";
    } else {
      document.querySelector(
        ".myForm"
      ).action = `/blog/edit/post/${postId}?series=${nameSeries}`;
    }
    document.querySelector(".myForm").submit();
  } else {
    if (nameSeries == "dots" || nameSeries == "") {
      document.querySelector(".myForm").action = "/blog/new";
    } else {
      document.querySelector(
        ".myForm"
      ).action = `/blog/new?series=${nameSeries}`;
    }

    document.querySelector(".myForm").submit();
  }
});
