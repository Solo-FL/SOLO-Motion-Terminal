// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

const serial = new Serial();

const connect = document.getElementById('buttonConnection');
const messageInput = document.getElementById('termTx'); 
const submitButton = document.getElementById('buttonSimpleTX');  
const clearButton = document.getElementById('buttonClearBuffer'); 
const serialMessagesContainer = document.getElementById('termRx');

const bActionPoleSize = document.getElementById('?');
const bActionMaxTorque = document.getElementById('?');
const bActionMaxSpeed = document.getElementById('?');

this.timeoutBoxToColor = null; 
this.timeoutIsBoxToColor = false;
this.timeoutCommandSent = null;
this.timeoutCommandRecived = null;
this.timeoutReadValueToSetId = null;
this.timeoutReadTypeToSet = null;
this.timeoutClearTimeout = null;
this.timeoutMultiply = 1;
this.timeoutIsMultiply = false;

this.serialWritingStatus="OFF";

connect.addEventListener('click', () => {
  switch(serial.getConnectionStatus()){
    case "connected":
      serial.disconnect();
      break;
    default:
      serial.init();
  }
});

setInterval(checkStatus,1000);

function checkStatus(){
  switch(serial.getConnectionStatus()){
    case "error":
      connect.style.color = "orange";
      break;
    case "none":
      connect.style.color = "gray";
      break;
    case "connected":
      connect.style.color = "LimeGreen";
      break;
  }
}

submitButton.addEventListener('click', event => {
  if(serial.getConnectionStatus() == "connected" && this.serialWritingStatus == "OFF"){
    serial.multipleWriteStart(messageInput.value);
    serialMessagesContainer.value="";
    this.serialWritingStatus = "START";
    setTimeout(updateAndFlush,250,messageInput.value.substr(6,2));
  }
});

clearButton.addEventListener('click', event => {
  serial.flushreadings();
  serialMessagesContainer.value="";
});

function updateAndFlush(command){
  
  serialMessagesContainer.value=serial.getLastReadingsByCommand(command,2);

  termRxSize= document.querySelector('#termRx').value.replace(/(\r\n|\n|\r|\s)/gm, "").length;
  termTxSize= document.querySelector('#termTx').value.replace(/(\r\n|\n|\r|\s)/gm, "").length;
  if(termRxSize>=termTxSize){
    this.serialWritingStatus = "OFF";
    //FIXME serial.flushreadings();
    //document.querySelector('#termRx').value=document.querySelector('#termRx').value.replace(/(\r\n|\n|\r|\s)/gm, "").substring(0,20*Math.floor(termTxSize/20));
  }else{
    if(this.serialWritingStatus == "START"){
      if(serial.getWritingStatus() =="OFF"){
        this.serialWritingStatus = "OFF";
      }
      setTimeout(updateAndFlush,250,command);
    }
  }

  prettifyHex();
}

function doDisbale(checkbox,elements){
  var toDisable = true;
  if(document.getElementById(checkbox).checked==false){
    toDisable = false;
    alert("The current Controller Gains are automatically identified by SOLO when you do the 'Motor Identification'");
  }
  disablePart(toDisable,elements);
}

function doActionSemplification(boxValueId){
  if(boxValueId=='boxActionControlType'){
    var actionValue = document.getElementById(boxValueId).value;

    disablePart(false, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
    disablePart(false, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
    disablePart(false, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
    disablePart(false, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
    disablePart(false, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
    disablePart(false, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
    disablePart(false, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );
    disablePart(false, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
    disablePart(false, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );
    disablePart(false, ["boxActionMotorDirection","bActionMotorDirection"] );
    disablePart(false, ["boxActionControlMode","bActionControlMode"] );
    
    switch (actionValue){
      case '0':
        disablePart(true, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
        disablePart(true, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
        disablePart(true, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
        disablePart(true, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
        disablePart(true, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
        break;
      case '1':
        disablePart(true, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
        disablePart(true, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
        disablePart(true, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
        disablePart(true, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
        
        disablePart(true, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
        disablePart(true, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );
        disablePart(true, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
        disablePart(true, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );

        break;

      case '2':
        disablePart(true, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
        disablePart(true, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
        disablePart(true, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );

        disablePart(true, ["boxActionMotorDirection","bActionMotorDirection"] );
        disablePart(true, ["boxActionControlMode","bActionControlMode"] );

      break;
    }

  }
}

function disablePart(value, ids){
  for(var i in ids){
    document.getElementById(ids[i]).disabled = value;
  }
}

function doActionReadMultiply(address, command, typeToSet, valueToSetId, boxToColorId, valueToMultiply ){
  this.timeoutMultiply = parseFloat(valueToMultiply);
  this.timeoutIsMultiply = true;
  doActionRead(address, command, typeToSet, valueToSetId, boxToColorId );
}

function doActionRead(address, command, typeToSet, valueToSetId, boxToColorId ){
  clearTimeoutBoxToColor();
  var commandToSend= "FFFF" + address + command + "00000000" + "00FE";
  doSimpleActionRead(commandToSend, typeToSet , valueToSetId, boxToColorId);
}

function doActionStopMotor(){
  setTimeout(doAction, 1, '00','04','UINT32','bActionMotorStop','bActionMotorStop');
  setTimeout(doAction, 350,'00','05','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 700,'00','1B','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 1050,'00','1F','UINT32','01','bActionMotorStop'); 
}

function doAction(address, command, type, valueOrValueId, boxToColorId ){
  clearTimeoutBoxToColor();
  
  var value = valueOrValueId;
  if(valueOrValueId.toString().length>2){
    value = document.getElementById(valueOrValueId).value
  }
  
  var commandToSend= "FFFF" + address + command + convertFromType(type,value) + "00FE";
  console.log('Do action: ' + commandToSend);
  doSimpleAction (commandToSend,boxToColorId);
}

function convertFromType(type,value){
  switch (type){
    case "INT32":
      return conversionFromInt32(value);
    case "UINT32":
      return conversionFromDecimal(value);
    case "SFXT":
      return conversionFromFloat(value);
  }
}

function convertToType(type,value){
  switch (type){
    case "INT32":
      return conversionToInt32(value);
    case "UINT32":
      return conversionToDecimal(value);
    case "SFXT":
      return conversionToFloat(value);
    case "NONE":
      return value;
    case "ERROR":
      return conversionToError(value);
  }
}

function doSimpleActionRead (commandToSend, typeToSet, valueToSetId ,boxToColorId){
  var boxToColor = document.getElementById(boxToColorId)
  if(serial.getConnectionStatus() == "connected" && this.serialWritingStatus == "OFF"){
    this.serialWritingStatus = "START";

    this.timeoutIsBoxToColor= false;
    
    if(boxToColorId!=null){
      this.timeoutBoxToColor = boxToColor;
      this.timeoutIsBoxToColor = true;
    }
    
    this.timeoutCommandSent = commandToSend;
    this.timeoutReadValueToSetId = valueToSetId;
    this.timeoutReadTypeToSet = typeToSet;
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleActionRead,250,commandToSend.substr(6,2));
  }
}


function doSimpleAction(commandToSend,boxToColorId){
  var boxToColor = document.getElementById(boxToColorId)
  if(serial.getConnectionStatus() == "connected" && this.serialWritingStatus == "OFF"){
    this.serialWritingStatus = "START";
    this.timeoutIsBoxToColor= false;
    
    if(boxToColorId!=null){
      this.timeoutBoxToColor = boxToColor;
      this.timeoutIsBoxToColor = true;
    }

    this.timeoutCommandSent = commandToSend;
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleAction,250,commandToSend.substr(6,2));
  }
}
function updateAndFlushSimpleActionRead(command){
  this.timeoutCommandRecived=serial.getLastReadingsByCommand(command,2);

  var termRxSize= this.timeoutCommandRecived.length;
  var termTxSize= this.timeoutCommandSent.length;
  if(termRxSize>=termTxSize){
    this.serialWritingStatus = "OFF";
    //serial.flushreadings();
    //this.timeoutCommandRecived=this.timeoutCommandRecived.replace(/(\r\n|\n|\r|\s)/gm, "").substring(0,20*Math.floor(termTxSize/20));

    
   
    var commandRead = this.timeoutCommandRecived.substring(8, 16);
    var commandToSet= convertToType(this.timeoutReadTypeToSet, commandRead)
    if(this.timeoutIsMultiply){
      document.getElementById(this.timeoutReadValueToSetId).value = commandToSet * this.timeoutMultiply; 
      this.timeoutMultiply = 1;
      this.timeoutIsMultiply= false;
    }else{
      document.getElementById(this.timeoutReadValueToSetId).value = commandToSet; 
    }

    if(this.timeoutReadValueToSetId=='boxActionControlType'){
      document.getElementById(this.timeoutReadValueToSetId).onchange(); 
    }
    if(this.timeoutIsBoxToColor){
      this.timeoutBoxToColor.classList.add("bg-info");
      this.timeoutClearTimeout=setTimeout(clearTimeoutBoxToColor,500);
    }
  }else
    if(this.serialWritingStatus == "START"){
      if(serial.getWritingStatus() =="OFF"){
        this.serialWritingStatus = "OFF";
      }
      setTimeout(updateAndFlushSimpleActionRead,250,command);
    }
  }


function updateAndFlushSimpleAction(command){
  this.timeoutCommandRecived=serial.getLastReadingsByCommand(command,2);

  var termRxSize= this.timeoutCommandRecived.length;
  var termTxSize= this.timeoutCommandSent.length;
  if(termRxSize>=termTxSize){
    this.serialWritingStatus = "OFF";
    //serial.flushreadings();
    ///this.timeoutCommandRecived=this.timeoutCommandRecived.replace(/(\r\n|\n|\r|\s)/gm, "").substring(0,20*Math.floor(termTxSize/20));
    if(this.timeoutIsBoxToColor){
      if(this.timeoutCommandRecived == this.timeoutCommandSent){
        this.timeoutBoxToColor.classList.add("bg-success");
      }else{
        this.timeoutBoxToColor.classList.add("bg-danger");
      }
      this.timeoutClearTimeout = setTimeout(clearTimeoutBoxToColor,500);
    }
  }else
    if(this.serialWritingStatus == "START"){
      if(serial.getWritingStatus() =="OFF"){
        this.serialWritingStatus = "OFF";
      }
      setTimeout(updateAndFlushSimpleAction,250,command);
    }
  }

function clearTimeoutBoxToColor(){
  if(this.timeoutBoxToColor!=null){
    this.timeoutBoxToColor.classList.remove("bg-danger","bg-success", "bg-info");
  }
  if(this.timeoutClearTimeout!=null){
    clearTimeout(this.timeoutClearTimeout);
  }
}


function logStart(){
  serial.setRecording(true);
}

function logStopAndSave(){
  serial.setRecording(false);
  serial.saveRecording();
}

