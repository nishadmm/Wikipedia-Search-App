const searchInput = document.querySelector("#searchInput"),
  searchBtn = document.querySelector(".searchBtn"),
  clearBtn = document.querySelector(".clearBtn"),
  loader = document.getElementById("loader-container");

document.addEventListener("readystatechange", (e) => {
  if (e.target.readyState === "complete") {
    initApp();
  }
});


const initApp = () => {
  // Events

  // Showing clear btn
  searchInput.addEventListener("input", (e) => {
    if (searchInput.value.length) {
      clearBtn.classList.remove("none");
      clearBtn.classList.add("flex");
    } else {
      clearBtn.classList.remove("flex");
      clearBtn.classList.add("none");
    }
    e.preventDefault();
  });

  // clear btn listner
  clearBtn.addEventListener('click', (e) => {
    searchInput.value = "";
    clearBtn.classList.remove("flex");
    clearBtn.classList.add("none");
    e.preventDefault();
  });

  // Search btn listner
  searchBtn.addEventListener("click", (e) => {
    // delete search history
    const parentElemet = document.querySelector(".results");
    let child = parentElemet.lastElementChild;
    while (child) {
      parentElemet.removeChild(child);
      child = parentElemet.lastElementChild;
    }
    loader.style.display = "flex";
    document.getElementById("stats").textContent = "";
    const rawSearchTerm = searchInput.value.trim();
    if (rawSearchTerm === "") return;
    const regex = /[" "]{2,}/gi;
    const searchTerm = rawSearchTerm.replaceAll(regex, " ");
    processSearch(searchTerm);

    e.preventDefault();
  });
}

const processSearch = async (searchTerm) => {
  const maxChars = getMaxChars();
  let wikiApiLink = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
  wikiApiLink = encodeURI(wikiApiLink);
  try {

    const response = await fetch(wikiApiLink);
    const data = await response.json();
    let resultArray = [];
    if (data.hasOwnProperty("query")) {
      const pages = data.query.pages;
      Object.keys(pages).forEach((key) => {
        let id = key,
          title = pages[key].title,
          text = pages[key].extract,
          img = pages[key].hasOwnProperty("thumbnail")
            ? pages[key].thumbnail.source
            : null;

        let item = {
          id,
          title,
          text,
          img
        }
        resultArray.push(item);
      });
      showResult(resultArray);
      showStats(resultArray.length);
    } else {
      loader.style.display = "none";
      let content = `Sorry, No Results...`;
      document.getElementById("stats").textContent = content;
    }
  } catch (err) {
    console.log(err);
  }
}

const getMaxChars = () => {
  let maxChar;
  let width = window.innerWidth;
  if (width < 414) maxChar = 65;
  if (width >= 414 && width < 1400) maxChar = 100;
  if (width >= 1400) maxChar = 140;
  return maxChar;
}

const showResult = (resultArray) => {
  loader.style.display = "none";
  resultArray.forEach(item => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("resultItem");
    const resulttitle = document.createElement("div");
    resulttitle.classList.add("resultTitle");
    const link = document.createElement("a");
    link.href = `https://wikipedia.org/?curid=${item.id}`;
    link.target = "_blank";
    link.textContent = item.title;
    resulttitle.append(link);
    resultItem.append(resulttitle);
    const resultContents = document.createElement("div");
    resultContents.classList.add("resultContents");
    if (item.img) {
      const resultimage = document.createElement("div")
      resultimage.classList.add("resultImage");
      const img = document.createElement("img");
      img.src = item.img;
      img.alt = item.title;
      resultimage.append(img);
      resultContents.append(resultimage);
    }
    const resulttext = document.createElement("div");
    resulttext.classList.add("resultText");
    const p = document.createElement("p");
    p.textContent = item.text;
    resulttext.append(p);
    resultContents.append(resulttext);
    resultItem.append(resultContents);
    const searchResults = document.querySelector(".results");
    searchResults.append(resultItem);
  });
}

const showStats = (lenght) => {
  let content = `Displaying ${lenght} results...`;
  document.getElementById("stats").textContent = content;
}
