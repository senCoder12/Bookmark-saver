async function getCurrentTab() {
    let qO = {active: true,currentWindow: true};
    let [tab] = await chrome.tabs.query(qO);
    return tab;
}

async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
    return tabs[0];
}

const addNewBookmark = (bookmarkElement,bookmark) => {
    const bookmarkTitleElement = document.createElement('div');
    const newBookmarkElement = document.createElement('div');
    const controlElement = document.createElement('div');


    bookmarkTitleElement.innerHTML = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlElement.className = "bookmark-controls";

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp",bookmark.time);

    setBookmarkAttributes("play",onPlay,controlElement);
    setBookmarkAttributes("delete",onDelete,controlElement);


    newBookmarkElement.append(bookmarkTitleElement);
    newBookmarkElement.append(controlElement);
    bookmarkElement.append(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarkElement = document.getElementById("bookmarks");
    bookmarkElement.innerHTML = "";

    if(currentBookmarks.length > 0) {
        currentBookmarks.map(bookmark => {
            addNewBookmark(bookmarkElement,bookmark);
        })
    } else {
        bookmarkElement.innerHTML = "<i class='row'>No Bookmarks to show</i>";
    }
}; 

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    });
};

const onDelete = async e => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-"+ bookmarkTime);

    chrome.tabs.sendMessage(activeTab.id , {
        type: "DELETE",
        value: bookmarkTime
    },viewBookmarks);
};

const setBookmarkAttributes =  (src,eventListener,controlParentElement) => {
    const controlElm = document.createElement("img");

    controlElm.src = "assets/" + src + ".png";
    controlElm.title = src;
    controlElm.addEventListener("click",eventListener);
    controlParentElement.append(controlElm);
};

document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getCurrentTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");
    if(activeTab.url.includes("youtube,com/watch")) {
        chrome.storage.sync.get([currentVideo],(data)=>{
            const currentVideosBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []; 
            viewBookmarks(currentVideosBookmarks);
        })
    } else {
        const containeer = document.getElementsByClassName("container");
        containeer.innerHTML = "<div class='title'>This is not a youtube video page.</div>";
    }
});
