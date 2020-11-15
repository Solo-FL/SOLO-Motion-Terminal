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
        doReadAll();
        break;
    }
  }

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
    text += serial.getLastReadingsByCommand(commands[i].substr(6,2),2);
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

function doReadAll(){
  serial.multipleWriteStart(
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
    setTimeout(updateAndFlushSimpleActionRead,20,"FFFF008B0000000000FE", 'UINT32', 0.001 , 'boxActionPWMFrequency', 'boxActionPWMFrequency',null);
    setTimeout(updateAndFlushSimpleActionRead,50,"FFFF008F0000000000FE", 'UINT32', 0 , 'boxActionPoles', 'boxActionPoles',null);
    setTimeout(updateAndFlushSimpleActionRead,70,"FFFF00900000000000FE", 'UINT32', 0 , 'boxActionEncoderLines', 'boxActionEncoderLines',null);
    setTimeout(updateAndFlushSimpleActionRead,90,"FFFF00970000000000FE", 'UINT32', 0 , 'boxActionMotorType', 'boxActionMotorType',null);
    setTimeout(updateAndFlushSimpleActionRead,110,"FFFF00910000000000FE", 'SFXT', 0 , 'boxActionCurrentControllerKp', 'boxActionCurrentControllerKp',null);
    setTimeout(updateAndFlushSimpleActionRead,130,"FFFF00920000000000FE", 'SFXT', 0.00005 , 'boxActionCurrentControllerKi', 'boxActionCurrentControllerKi',null);
    setTimeout(updateAndFlushSimpleActionRead,150,"FFFF009A0000000000FE", 'UINT32', 0 , 'boxActionCommandMode', 'boxActionCommandMode',null);
    setTimeout(updateAndFlushSimpleActionRead,170,"FFFF00990000000000FE", 'UINT32', 0 , 'boxActionControlMode', 'boxActionControlMode',null);
    setTimeout(updateAndFlushSimpleActionRead,190,"FFFF009B0000000000FE", 'UINT32', 0 , 'boxActionControlType', 'boxActionControlType',null);
    setTimeout(updateAndFlushSimpleActionRead,210,"FFFF00890000000000FE", 'SFXT', 0 , 'boxActionSpeedControllerKp', 'boxActionSpeedControllerKp',null);
    setTimeout(updateAndFlushSimpleActionRead,230,"FFFF008A0000000000FE", 'SFXT', 0 , 'boxActionSpeedControllerKi', 'boxActionSpeedControllerKi',null);
    setTimeout(updateAndFlushSimpleActionRead,250,"FFFF009D0000000000FE", 'SFXT', 0 , 'boxActionPositionControllerKp', 'boxActionPositionControllerKp',null);
    setTimeout(updateAndFlushSimpleActionRead,270,"FFFF009E0000000000FE", 'SFXT', 0 , 'boxActionPositionControllerKi', 'boxActionPositionControllerKi',null);
    setTimeout(updateAndFlushSimpleActionRead,290,"FFFF009C0000000000FE", 'UINT32', 0 , 'boxActionSpeedLimit', 'boxActionSpeedLimit',null);
    setTimeout(updateAndFlushSimpleActionRead,310,"FFFF00A00000000000FE", 'INT32', 0 , 'boxActionDesiredPosition', 'boxActionDesiredPosition',null);
    setTimeout(updateAndFlushSimpleActionRead,330,"FFFF008E0000000000FE", 'SFXT', 0 , 'boxActionMagnetizingCurrentId', 'boxActionMagnetizingCurrentId',null);
    setTimeout(updateAndFlushSimpleActionRead,350,"FFFF00860000000000FE", 'SFXT', 0 , 'boxActionSupplyVoltage', 'boxActionSupplyVoltage',null);
    setTimeout(updateAndFlushSimpleActionRead,370,"FFFF00930000000000FE", 'SFXT', 0 , 'boxActionTemperature', 'boxActionTemperature',null);
    setTimeout(updateAndFlushSimpleActionRead,390,"FFFF00930000000000FE", 'SFXT', 0 , 'boxActionTemperature', 'boxActionTemperature',null);
    setTimeout(updateAndFlushSimpleActionRead,410,"FFFF00A10000000000FE", 'ERROR', 0 , 'boxActionErrorRegister', 'boxActionErrorRegister',null);
    setTimeout(updateAndFlushSimpleActionRead,430,"FFFF00A20000000000FE", 'NONE', 0 , 'boxActionFirmwareVersion', 'boxActionFirmwareVersion',null);
    setTimeout(updateAndFlushSimpleActionRead,450,"FFFF00960000000000FE", 'UINT32', 0 , 'boxActionSpeed', 'boxActionSpeed',null);
    setTimeout(updateAndFlushSimpleActionRead,470,"FFFF008D0000000000FE", 'SFXT', 0 , 'boxActionTorqueIq', 'boxActionTorqueIq',null);
    setTimeout(updateAndFlushSimpleActionRead,490,"FFFF008E0000000000FE", 'SFXT', 0 , 'boxActionCurrentId', 'boxActionCurrentId',null);
    setTimeout(updateAndFlushSimpleActionRead,510,"FFFF00A00000000000FE", 'INT32', 0 , 'boxActionPosition', 'boxActionPosition',null);

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

function doAction(address, command, type, valueOrValueId, boxToColorId ){
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

function doSimpleActionRead (commandToSend, typeToSet, valueToSetId ,boxToColorId , multiply){
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleActionRead,250,commandToSend,typeToSet, multiply,valueToSetId, boxToColorId,2);
  }
}


function doSimpleAction(commandToSend,boxToColorId){
  
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleAction,250,commandToSend,boxToColorId);
  }
}
function updateAndFlushSimpleActionRead(fullcommand, typeToSet, multiply, readValueToSetId, boxToColorId, historySize) {
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

  }else
    if(serial.getWritingStatus() != "OFF"){
      setTimeout(updateAndFlushSimpleActionRead,250,fullcommand,typeToSet, multiply, readValueToSetId, boxToColorId, historySize);
    }
  }


function updateAndFlushSimpleAction(fullcommand, boxToColorId){
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
  }else
    if(serial.getWritingStatus()!= "OFF"){
      setTimeout(updateAndFlushSimpleAction,250,command, boxToColorId);
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

