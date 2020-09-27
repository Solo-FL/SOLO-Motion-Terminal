// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

class Serial {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
        this.myport;
        this.commandsStrings;
        this.commandsStringsTimer;
        this.readings = "";
        this.writingStatus ="OFF";
        this.connectionStatus = "none";
        this.writer;
    }

    async disconnect(){
      if(this.myport){
      console.log('disconnection start');
      //this.writer.close();
      //await  this.myport.close();
      //this.connectionStatus="none";
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
                    baudrate: baudRate,
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
                    console.log('read: '+ this.arrayAlementsToString(value));
                    this.readings +=  this.arrayAlementsToString(value);
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
            alert('Serial API not supported.');
            this.connectionStatus = "error";
        }
    }

    async write(data) {
        const array = this.hexStringToByteArray(data);
        const arrayBuffer = new Uint8Array(array)
        console.log(`message: ${arrayBuffer}`);

        await this.writer.write(arrayBuffer);
    }

    multipleWriteStart(data){
        this.commandsStrings = this.truncateBy20(data);
        if(this.commandsStrings != null){
          console.log('Execute multiple commands size ' + this.commandsStrings.length);
          this.writingStatus ="ON";

          this.commandsStringsTimer = setInterval(this.multipleWrite.bind(this), 80);
        }
    }

    multipleWrite() {
        this.write(this.commandsStrings.shift());
    
        if (this.commandsStrings.length == 0) {
            clearInterval(this.commandsStringsTimer);
            this.writingStatus ="OFF";
        }
    }

    truncateBy20 (data){
        var hexStringOnlyText = data.replace(/(\r\n|\n|\r|\s)/gm, "");
        //hexStringOnlyText += "FFFF008B0000000000FE"; //TODO add control request
        var splitCommands = hexStringOnlyText.match(/.{20}/g);
        if (splitCommands!= null && splitCommands.length>0){
          splitCommands.push("FFFF008B0000000000FE"); //TODO add control request
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

      getReadings(){
          return this.readings;
      }
      
      getReadingsFilterd(){
        return this.readings.substr(this.readings.indexOf("FFFF",0),this.readings.lastIndexOf("FFFF"));
      }

      flushreadings(){
          this.readings="";
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
}