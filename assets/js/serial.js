// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

class Serial {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
        this.myport;
        this.commandsStrings;
        this.commandsStringsTimer=[];
        this.writingStatus ="OFF";
        this.connectionStatus = "none";
        this.writer;
        this.isMonitoring = false;
        this.readingList = [];
        this.readingPreList = "";
        this.isRecordingActivated = false;
        this.recordingIndex = 0;
    }

    async disconnect(){
      if(this.myport){
      console.log('disconnection start');
      
      await this.reader.cancel();
      console.log('disconnected reader');

      await this.writer.close();
      console.log('disconnected writer');

      await this.myport.close();
      console.log('disconnected port');
      this.connectionStatus = "none";
      }
      return;
    }
    
    async init() {
        if ('serial' in navigator) {
            try {
                const port = await navigator.serial.requestPort();
                this.myport = port;
                var baudRate = 937500;

                var dataBitsVal = "eight";
                var parityBitVal = "no";
                var stopBitsVal = "one";

                await port.open({ 
                    baudRate: baudRate,
                    dataBitsVal:dataBitsVal,
                    parityBitVal: parityBitVal,
                    stopBitsVal:stopBitsVal });
                this.connectionStatus = "connected"
                console.log('LOG: '+port.log);
                this.reader = port.readable.getReader();
                this.writer = port.writable.getWriter();
                let signals = await port.getSignals();
                console.log('SIGNALS: ');
                console.log(signals);
                
                
                while (true) {
                  const { value, done } = await this.reader.read();
                  if (value) {
                    var packetReceived ="";
                    var packetReceivedStart =0;
                    var packetReceivedList =[];

                    var newMessage = this.arrayAlementsToString(value);
                    
                    console.log('read: '+ newMessage);
                    
                    this.readingPreList += newMessage;
                    packetReceivedStart = this.readingPreList.indexOf("FFFF",0);
                    

                    packetReceived = this.readingPreList.substr
                      (packetReceivedStart,
                      this.readingPreList.lastIndexOf("00FE")-packetReceivedStart+4);
                    packetReceivedList = packetReceived.match(/.{20}/g);
                    if(packetReceivedList!=null){
                      this.readingList=this.readingList.concat(packetReceivedList);
                      this.readingPreList = this.readingPreList.substr(packetReceivedStart+packetReceivedList.length*20);
                    }


                    if(this.isMonitoring){
                      for(var li = 0; li <this.readingList.length;li++){
                        var messageToCheck = this.readingList[li];
                        if(messageToCheck.substr(0,8)=="FFFF00A1" && !(messageToCheck.substr(8,12)=="0000000000FE")){
                          document.getElementById("myChart").classList.add("bg-warning");
                          document.getElementById("myPerformanceChart").classList.add("bg-warning");
                          var errorText="";
                            switch ( messageToCheck.substring(8, 16)){
                              case 0:
                                errorText= "0: No Errors";
                                break;
                              case 1:
                                errorText= "1: O.C. (Over-Current)";
                                break;
                              case 2:
                                errorText= "2: O.V. (Over-Voltage)";
                                break;
                              case 3:
                                errorText= "3: O.V., O.C.";
                                break;
                              case 4:
                                errorText= "4: O.T. (Over-Temp.)";
                                break;
                              case 5:
                                errorText= "5: O.C., O.T.";
                                break;
                              case 6:
                                errorText= "6: O.V., O.T.";
                                break;
                              case 7: 
                                errorText= "7: O.C., O.V., O.T";
                                break;
                            }
                            document.querySelector('boxActionErrorRegister').value=errorText;
                        }
                      }
                    }

                  
                    if (typeof(Storage) !== "undefined" && this.isRecordingActivated) {
                      localStorage.setItem(this.recordingIndex, newMessage);
                      this.recordingIndex++;
                    } else {
                     // console.log("Sorry, your browser does not support Web Storage...");
                    }
                  
                  }
                  if (done) {
                    console.log('[readLoop] DONE', done);
                    this.reader.releaseLock();
                    break;
                  }
                }
            }
            catch (err) {
                console.error('There was an error opening the serial port:', err);
                this.connectionStatus = "error";
            }
        }
        else {
            console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
            console.error('chrome://flags/#enable-experimental-web-platform-features');
            console.error('opera://flags/#enable-experimental-web-platform-features');
            console.error('edge://flags/#enable-experimental-web-platform-features');
            alert('Serial API not supported.\n'+
            'Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:\n'+
            'chrome://flags/#enable-experimental-web-platform-features \n'+
            'opera://flags/#enable-experimental-web-platform-features \n'+
            'edge://flags/#enable-experimental-web-platform-features \n');
            this.connectionStatus = "error";
        }
    }

    clearRed(){
      document.getElementById("bMonitorStop").classList.remove("bg-danger","bg-success", "bg-info", "bg-warning");
    }
    
    async write(data) {
      if(data!=null){
        const array = this.hexStringToByteArray(data);
        const arrayBuffer = new Uint8Array(array)
        console.log(`message: ${data} , ${arrayBuffer}`);

          await this.writer.write(arrayBuffer);
      }
    }

    multipleWriteStart(data){
      if(this.writingStatus =="OFF"){
        this.commandsStrings = this.truncateBy20(data);
        if(this.commandsStrings != null){
          console.log('Execute multiple commands size ' + this.commandsStrings.length);
          this.writingStatus ="ON";

          this.commandsStringsTimer.push(setInterval(this.multipleWrite.bind(this), 10));
        }
      }
    }

    multipleWrite() {
        this.write(this.commandsStrings.shift());
    
        if (this.commandsStrings.length == 0) {
            clearInterval(this.commandsStringsTimer.shift());
            this.writingStatus ="OFF";
            //setTimeout(this.writingStatusOff.bind(this),200);
        }
    }

    writingStatusOff(){
      this.writingStatus ="OFF";
    }

    truncateBy20 (data){
        var hexStringOnlyText = data.replace(/(\r\n|\n|\r|\s)/gm, "");
        //hexStringOnlyText += "FFFF00930000000000FE "; //TODO add control request
        var splitCommands = hexStringOnlyText.match(/.{20}/g);
        if (splitCommands!= null && splitCommands.length>0){
          splitCommands.push("FFFF00930000000000FE"); //TODO add control request
        }
        return splitCommands;
    }

    breackInput(str, maxLength) {
        var buff = "";
        var numOfLines = Math.floor(str.length / maxLength);
        for (var i = 0; i < numOfLines + 1; i++) {
          buff += str.substr(i * maxLength, maxLength);
          if (i !== numOfLines) { buff += "\n"; }
        }
        return buff;
      }

      hexStringToByteArray(hexString) {
        var splitHexString = hexString.match(/.{1,2}/g);
      
        var byteBuffer = new ArrayBuffer(splitHexString.length);
        var byteBufferView = new Int8Array(byteBuffer);
      
        for (var i = 0; i < splitHexString.length; i++) {
          //form each byte 
          //http://www.w3schools.com/jsref/jsref_parseint.asp
          var byte = parseInt(splitHexString[i], '16'); //it is a hex string, 16
          byteBufferView[i] = byte;
        }
      
        return byteBuffer;
      }

      

      getLastReadingsByCommand(command, historySize ,isToPop){
        var size = 0;
        for(var px = this.readingList.length-1; px>=0; px--){
          var read = this.readingList[px];
          
          if(read.substr(6,2)==command){
            if(isToPop){
              return this.readingList.splice(px,1);
            }
            return read;
          }

          if(historySize!=null && historySize<size){
            return "";
          }

          size++;
        }
        return "";
      }


      readingSize(){
        return this.readingList.length;
      }

      readingSizeByCommand(command){
        var count = 0;
        for(var px = 0; px < this.readingList.length; px++){
          var read = this.readingList[px];
          if(read.substr(6,2)==command){
            count++;
          }
          
        }
        
        return count;
      }

      itHasAllReadingsByCommand(command,size){
        var count = 0;
        for(var px = 0; px < this.readingList.length; px++){
          var read = this.readingList[px];
          if(read.substr(6,2)==command){
            count++;
          }

          if (count>=size){
            return true;
          }
          
        }
        
        return false;
      }

      shiftAllReadingsByCommand(command, size){
        var readings = [];
        var count = 0;
        for(var px = 0; px < this.readingList.length; px++){
          var read = this.readingList[px];
          if(read.substr(6,2)==command){
            readings.push(this.readingList.splice(px,1));
            px--;
            count++;
          }

          if (size != null && count>=size){
            break;
          }
          
        }
        return readings;
      }


      monitorStart(monitorType){
        this.isMonitoring=true;
        this.multipleWriteStart("FFFF0019000000"+monitorType+"00FE");
      }
      
      arrayElementsToString(arrayData) {
        var output = "";
      
        for (var i = 0; i < arrayData.byteLength; i++) {
          output += this.padByteString(arrayData[i].toString(16)).toUpperCase();
        }
      
        return output;
      }

      padByteString(stringData) {
        if (stringData.length === 1)
          return "0" + stringData;
        else
          return stringData;
      }

      arrayAlementsToString(arrayData) {
        var output = "";
      
        for (var i = 0; i < arrayData.byteLength; i++) {
          output += this.padByteString(arrayData[i].toString(16)).toUpperCase();
        }
      
        return output;
      }

      getConnectionStatus(){
          return this.connectionStatus;
      }

      getWritingStatus(){
        return this.writingStatus;
      }

      setRecording(newRecordingStatus){
        if(this.isRecordingActivated != newRecordingStatus){
          if(newRecordingStatus==true){
            this.recordingIndex = 0;
            localStorage.clear();
          }
          this.isRecordingActivated = newRecordingStatus;
        }
      }


      cleanMonitorBuffer(){
        document.getElementById("bMonitorStop").classList.add("bg-danger");
        this.readingPreList="";
        this.readingList = [];
        this.multipleWriteStart(
        'FFFF00190000000000FE'+
        'FFFF00190000000000FE')
      }

      saveRecording(){
        let a = document.createElement('a');
        
        a.href = "data:application/octet-stream,";

        for(var i = 0; i < this.recordingIndex; i++ ){
          a.href = a.href + encodeURIComponent(localStorage.getItem(i));
        }
    
        a.download = 'SOLO-log.txt';
        a.click();
      }
}