class soloLog{
    recordingIndex = 0;
    isRecordingActivated = false;

    start(){
        this._setRecording(true);
      }
      
    stopAndSave(){
        this._setRecording(false);
        this._saveRecording();
      }
    
    saveItem(type, value){
        if (this.isRecordingActivated && typeof(Storage) !== "undefined") {
            localStorage.setItem(this.recordingIndex,  JSON.stringify({'type':type, 'value':value}));
            this.recordingIndex++;
          } else {
           // console.log("Sorry, your browser does not support Web Storage...");
          }
    }

    _saveRecording(){
        let a = document.createElement('a');
        
        a.href = "data:application/octet-stream,";
        
        /*
        for(var i = 0; i < this.recordingIndex; i++ ){
          var myLine = JSON.parse(localStorage.getItem(i));
          a.href = a.href + encodeURIComponent(myLine.type)+ ','+ encodeURIComponent(myLine.value) + encodeURIComponent('\n');
        }
        */
        let myMap = new Map();

        //full the map
        for(var i = 0; i < this.recordingIndex; i++ ){
            var myLine = JSON.parse(localStorage.getItem(i));
            if(!myMap.has(myLine.type)){
                myMap.set(myLine.type, []);
            }
            myMap.get(myLine.type).push(...myLine.value);
        }

        //write the 1 line of file
        let myKeys = Array.from(myMap.keys());
        for (var i = 0 ; i<myKeys.length-1; i++) {
            a.href = a.href + encodeURIComponent(myKeys[i]) + ',';
        }
        a.href = a.href + encodeURIComponent(myKeys[myKeys.length-1]) + encodeURIComponent('\n');

        //write the value of file
        var maxValue = 0
        for (var i = 0 ; i<myKeys.length-1; i++) {
            var myValues = myMap.get(myKeys[i]);
            if(maxValue<myValues.length){
                maxValue = myValues.length;
            }
        }

        for (var i = 0 ; i<maxValue-1; i++) {
            for (var j = 0 ; j<myKeys.length-1; j++) {
                var myValues = myMap.get(myKeys[j]);
                a.href = a.href + encodeURIComponent(myValues[i]?myValues[i]:0) + ',';
            }
            a.href = a.href + encodeURIComponent(myValues[myKeys.length-1][i]?myValues[myKeys.length-1][i]:0 ) + encodeURIComponent('\n');
        }

    
        a.download = 'SOLO-log.csv';
        a.click();
      }

    _setRecording(newRecordingStatus){
        if(this.isRecordingActivated != newRecordingStatus){
          if(newRecordingStatus==true){
            this.recordingIndex = 0;
            localStorage.clear();
          }
          this.isRecordingActivated = newRecordingStatus;
        }
      }


}