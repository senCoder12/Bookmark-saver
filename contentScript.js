(()=>{
    let youtubeLeftControls, youtubePlayers;
    let currentVideo = "";

    chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        const {type,videoId,value} = obj;

        if(type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
    });

    const newVideoLoaded = ()=> {
        
    }
})()