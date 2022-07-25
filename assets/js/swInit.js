// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").then(registration => 
        {
            console.log("SW registered");
    }).catch(error=>{
        console.Error ("SW registration error:", error);
    })
}else{
    console.log("application not supported");
}

