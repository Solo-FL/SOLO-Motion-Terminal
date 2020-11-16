// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

const serial = new Serial();

const connect = document.getElementById('buttonConnection');
const messageInput = document.getElementById('termTx'); 
const submitButton = document.getElementById('buttonSimpleTX');  
const clearButton = document.getElementById('buttonClearBuffer'); 
const serialMessagesContainer = document.getElementById('termRx');

this.serialOldConnectionStatus;

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
  if(this.serialOldConnectionStatus != serial.getConnectionStatus()){
    this.serialOldConnectionStatus=serial.getConnectionStatus();
    switch(this.serialOldConnectionStatus){
      case "error":
        connect.style.color = "orange";
        break;
      case "none":
        connect.style.color = "gray";
        break;
      case "connected":
        connect.style.color = "LimeGreen";
        doReadAll(convertToCammandToSend('00','19','UINT32',"0"));
        setTimeout(stopAndCleanMonitor,500);
        break;
    }
  }

}

function stopAndCleanMonitor(){
  serial.readingList = [];
}

submitButton.addEventListener('click', event => {
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(messageInput.value);
    serialMessagesContainer.value="";
    setTimeout(updates,250,serial.truncateBy20(messageInput.value));
  }
});

clearButton.addEventListener('click', event => {
  serial.flushreadings();
  serialMessagesContainer.value="";
});

function updates(commands){
  var text ="";
  
  for(var i = 0; i< commands.length-1; i++){
    text += serial.getLastReadingsByCommand(commands[i].substr(6,2),null);
  }

  termRxSize= text.replace(/(\r\n|\n|\r|\s)/gm, "").length;
  termTxSize= document.querySelector('#termTx').value.replace(/(\r\n|\n|\r|\s)/gm, "").length;

  if(termRxSize>=termTxSize){
    document.querySelector('#termRx').value=text;
    document.querySelector('#termRx').value=document.querySelector('#termRx').value.replace(/(\r\n|\n|\r|\s)/gm, "").substring(0,20*Math.floor(termTxSize/20));
  }else{
    if(serial.getWritingStatus() != "OFF"){
      setTimeout(updates,250,commands);
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

function doReadAll(extraCommand){
  if(extraCommand==null){
    extraCommand="";
  }
  serial.multipleWriteStart(
    extraCommand+
    "FFFF008C0000000000FE"+ 
    "FFFF008B0000000000FE"+
    "FFFF008F0000000000FE"+
    "FFFF00900000000000FE"+
    "FFFF00970000000000FE"+
    "FFFF00910000000000FE"+
    "FFFF00920000000000FE"+
    "FFFF009A0000000000FE"+
    "FFFF00990000000000FE"+
    "FFFF009B0000000000FE"+
    "FFFF00890000000000FE"+
    "FFFF008A0000000000FE"+
    "FFFF009D0000000000FE"+
    "FFFF009E0000000000FE"+
    "FFFF009C0000000000FE"+
    "FFFF00A00000000000FE"+
    "FFFF008E0000000000FE"+
    "FFFF00860000000000FE"+
    "FFFF00930000000000FE"+
    "FFFF00A10000000000FE"+
    "FFFF00A20000000000FE"+
    "FFFF00960000000000FE"+
    "FFFF008D0000000000FE"
    );
  
    updateAndFlushSimpleActionRead("FFFF008C0000000000FE", 'SFXT', 0 , 'boxActionMaxCurrent', 'boxActionMaxCurrent',null);
    updateAndFlushSimpleActionRead("FFFF008B0000000000FE", 'UINT32', 0.001 , 'boxActionPWMFrequency', 'boxActionPWMFrequency',null);
    updateAndFlushSimpleActionRead("FFFF008F0000000000FE", 'UINT32', 0 , 'boxActionPoles', 'boxActionPoles',null);
    updateAndFlushSimpleActionRead("FFFF00900000000000FE", 'UINT32', 0 , 'boxActionEncoderLines', 'boxActionEncoderLines',null);
    updateAndFlushSimpleActionRead("FFFF00970000000000FE", 'UINT32', 0 , 'boxActionMotorType', 'boxActionMotorType',null);
    updateAndFlushSimpleActionRead("FFFF00910000000000FE", 'SFXT', 0 , 'boxActionCurrentControllerKp', 'boxActionCurrentControllerKp',null);
    updateAndFlushSimpleActionRead("FFFF00920000000000FE", 'SFXT', 0.00005 , 'boxActionCurrentControllerKi', 'boxActionCurrentControllerKi',null);
    updateAndFlushSimpleActionRead("FFFF009A0000000000FE", 'UINT32', 0 , 'boxActionCommandMode', 'boxActionCommandMode',null);
    updateAndFlushSimpleActionRead("FFFF00990000000000FE", 'UINT32', 0 , 'boxActionControlMode', 'boxActionControlMode',null);
    updateAndFlushSimpleActionRead("FFFF009B0000000000FE", 'UINT32', 0 , 'boxActionControlType', 'boxActionControlType',null);
    updateAndFlushSimpleActionRead("FFFF00890000000000FE", 'SFXT', 0 , 'boxActionSpeedControllerKp', 'boxActionSpeedControllerKp',null);
    updateAndFlushSimpleActionRead("FFFF008A0000000000FE", 'SFXT', 0 , 'boxActionSpeedControllerKi', 'boxActionSpeedControllerKi',null);
    updateAndFlushSimpleActionRead("FFFF009D0000000000FE", 'SFXT', 0 , 'boxActionPositionControllerKp', 'boxActionPositionControllerKp',null);
    updateAndFlushSimpleActionRead("FFFF009E0000000000FE", 'SFXT', 0 , 'boxActionPositionControllerKi', 'boxActionPositionControllerKi',null);
    updateAndFlushSimpleActionRead("FFFF009C0000000000FE", 'UINT32', 0 , 'boxActionSpeedLimit', 'boxActionSpeedLimit',null);
    updateAndFlushSimpleActionRead("FFFF00A00000000000FE", 'INT32', 0 , 'boxActionDesiredPosition', 'boxActionDesiredPosition',null);
    updateAndFlushSimpleActionRead("FFFF008E0000000000FE", 'SFXT', 0 , 'boxActionMagnetizingCurrentId', 'boxActionMagnetizingCurrentId',null);
    updateAndFlushSimpleActionRead("FFFF00860000000000FE", 'SFXT', 0 , 'boxActionSupplyVoltage', 'boxActionSupplyVoltage',null);
    updateAndFlushSimpleActionRead("FFFF00930000000000FE", 'SFXT', 0 , 'boxActionTemperature', 'boxActionTemperature',null);
    updateAndFlushSimpleActionRead("FFFF00930000000000FE", 'SFXT', 0 , 'boxActionTemperature', 'boxActionTemperature',null);
    updateAndFlushSimpleActionRead("FFFF00A10000000000FE", 'ERROR', 0 , 'boxActionErrorRegister', 'boxActionErrorRegister',null);
    updateAndFlushSimpleActionRead("FFFF00A20000000000FE", 'NONE', 0 , 'boxActionFirmwareVersion', 'boxActionFirmwareVersion',null);
    updateAndFlushSimpleActionRead("FFFF00960000000000FE", 'UINT32', 0 , 'boxActionSpeed', 'boxActionSpeed',null);
    updateAndFlushSimpleActionRead("FFFF008D0000000000FE", 'SFXT', 0 , 'boxActionTorqueIq', 'boxActionTorqueIq',null);
    updateAndFlushSimpleActionRead("FFFF008E0000000000FE", 'SFXT', 0 , 'boxActionCurrentId', 'boxActionCurrentId',null);
    updateAndFlushSimpleActionRead("FFFF00A00000000000FE", 'INT32', 0 , 'boxActionPosition', 'boxActionPosition',null);

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
  doActionRead(address, command, typeToSet, valueToSetId, boxToColorId, parseFloat(valueToMultiply));
}

function doActionRead(address, command, typeToSet, valueToSetId, boxToColorId, multiply){
  var commandToSend= "FFFF" + address + command + "00000000" + "00FE";

  if(multiply==null){
    multiply =0;
  }

  doSimpleActionRead(commandToSend, typeToSet , valueToSetId, boxToColorId, multiply);
}

function doActionStopMotor(){
  setTimeout(doAction, 1, '00','04','UINT32','bActionMotorStop','bActionMotorStop');
  setTimeout(doAction, 350,'00','05','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 700,'00','1B','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 1050,'00','1F','UINT32','01','bActionMotorStop'); 
}

function convertToCammandToSend(address, command, type, valueOrValueId){
  var value = valueOrValueId;
  if(valueOrValueId.toString().length>2){
    value = document.getElementById(valueOrValueId).value
  }
  var commandToSend= "FFFF" + address + command + convertFromType(type,value) + "00FE";
  
  return commandToSend;
}

function doAction(address, command, type, valueOrValueId, boxToColorId ){
  var commandToSend= convertToCammandToSend(address, command, type, valueOrValueId);
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

function doSimpleActionRead (commandToSend, typeToSet, valueToSetId ,boxToColorId , multiply){
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleActionRead,250,commandToSend,typeToSet, multiply,valueToSetId, boxToColorId, null);
  }
}


function doSimpleAction(commandToSend,boxToColorId){
  
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleAction,250,commandToSend,boxToColorId);
  }
}
function updateAndFlushSimpleActionRead(fullcommand, typeToSet, multiply, readValueToSetId, boxToColorId, historySize) {
  if(serial.getWritingStatus() != "OFF"){
    setTimeout(updateAndFlushSimpleActionRead,250,fullcommand,typeToSet, multiply, readValueToSetId, boxToColorId, historySize);
  }else{

    var recivedCommand =serial.getLastReadingsByCommand(fullcommand.substr(6,2),historySize);

    if(recivedCommand.length>0){

      var commandRead = recivedCommand.substring(8, 16);
      var commandToSet= convertToType(typeToSet, commandRead);
      if(multiply!=0){
        commandToSet = commandToSet * multiply;
      }
      
      document.getElementById(readValueToSetId).value = commandToSet; 
      
      if(readValueToSetId=='boxActionControlType'){
        document.getElementById(readValueToSetId).onchange(); 
      }

      if(boxToColorId!=null){
        document.getElementById(boxToColorId).classList.add("bg-info");
        setTimeout(clearTimeoutBoxToColor,500, boxToColorId);
      }

    }
  }
}


function updateAndFlushSimpleAction(fullcommand, boxToColorId){
  if(serial.getWritingStatus()!= "OFF"){
    setTimeout(updateAndFlushSimpleAction,250,fullcommand, boxToColorId);
  }else{
    var commandRecived =serial.getLastReadingsByCommand(fullcommand.substr(6,2),2);

    if(commandRecived.length>0){

      if(boxToColorId!=null){
        if(commandRecived == fullcommand){
          document.getElementById(boxToColorId).classList.add("bg-success");
        }else{
          document.getElementById(boxToColorId).classList.add("bg-danger");
        }
        setTimeout(clearTimeoutBoxToColor,500,boxToColorId);
      }
    }
  }
    
  }

function clearTimeoutBoxToColor(boxToColorId){
  if(boxToColorId!=null){
    document.getElementById(boxToColorId).classList.remove("bg-danger","bg-success", "bg-info");
  }
}


function logStart(){
  serial.setRecording(true);
}

function logStopAndSave(){
  serial.setRecording(false);
  serial.saveRecording();
}

