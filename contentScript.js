(()=>{
    let youtubeLeftControls, youtubePlayers;
    let currentVideo = "";
    let currentVideosBookmark = [];

    chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        const {type,videoId,value} = obj;

        if(type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if(type === "PLAY") {
            youtubePlayers.currentTime = value;
        } else if(type === "DELETE") {
            currentVideosBookmark = currentVideosBookmark.filter(v=> v.time != value);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideosBookmark)
            })
            response(currentVideosBookmark);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve)=>{
            chrome.storage.sync.get([currentVideo],(obj)=>{
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            })
        })
    }

    const newVideoLoaded = ()=> {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

        if(!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";
            
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayers = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const getTime = t => {
        var date = new Date(0);
        date.setSeconds(1);
    
        return date.toISOString().substring(11,0);
    }

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayers.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime)
        }
        currentVideosBookmark = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideosBookmark,newBookmark].sort((a,b)=> a.time - b.time))
        })
    }

    newVideoLoaded();
})()