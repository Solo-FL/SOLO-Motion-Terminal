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
      setTimeout( checkFirmwareVersion, 8000);
  }
});

function checkFirmwareVersion(){
 if((document.querySelector('#boxActionFirmwareVersion').value!="0000B009" &&
  document.querySelector('#boxActionFirmwareVersion').value!="0002B008" &&
  document.querySelector('#boxActionFirmwareVersion').value!="0001B009" &&
  document.querySelector('#boxActionFirmwareVersion').value!="0002B009"&&
  document.querySelector('#boxActionFirmwareVersion').value!="0003B009" &&
  document.querySelector('#boxActionFirmwareVersion').value!="0004B009" &&
  document.querySelector('#boxActionFirmwareVersion').value!="0005B009" &&
  document.querySelector('#boxActionFirmwareVersion').value!="0006B009")
   && serial.connectionStatus=="connected"){
    console.log("The latest version of Firmware is the V009. Please update it for a better user experience, to get the updater tool please contact us.");
  }
}

setInterval(checkStatus,1000);

function checkStatus(){
  if(this.serialOldConnectionStatus != serial.getConnectionStatus()){
    this.serialOldConnectionStatus=serial.getConnectionStatus();
    switch(this.serialOldConnectionStatus){
      case "error":
        connect.style.color = "orange";
        document.getElementById("buttonConnectionTooltip").title="Connection Error";
        break;
      case "none":
        connect.style.color = "gray";
        document.getElementById("buttonConnectionTooltip").title="Press to get connected to SOLO";
        break;
      case "connected":
        connect.style.color = "LimeGreen";
        this.monitorIsInStopping=true;
        document.getElementById("buttonConnectionTooltip").title="Connection Established (Press to Disconnect)";
        doActionRead('FF','81','UINT32','boxActionDeviceAddress','boxActionDeviceAddress',null,'rangeActionDeviceAddress'); 
        doStoreIp('boxActionDeviceAddress');
        setTimeout(doReadAll, 200, 'FFFF'+'FF'+'190000000000FE'+'FFFF'+'FF'+'190000000000FE', serial);
        //doReadAll('FFFF'+serial.soloId+'190000000000FE'+'FFFF'+serial.soloId+'190000000000FE');
        break;
    }
  }

}


submitButton.addEventListener('click', event => {
  document.querySelector('#termRx').value="";
  var splitCommands = serial.truncateBy20(messageInput.value);
  if(splitCommands != null){
    var time = 1;
    for(var i = 0 ; i < splitCommands.length; i++){
      setTimeout(doSimpleAction, time, splitCommands[i] ,null);
      time += 100;
      if(i<splitCommands.length-1 || serial.isMonitoring){
        setTimeout(serial.getLastReadingsByCommandAndAppend.bind(serial), time, splitCommands[i].substr(6,2) ,null, true,document.querySelector('#termRx') );
        time += 100;
        setTimeout(prettifyHex,time);
      }
    }
    setTimeout(prettifyHex,time);
  }

});

clearButton.addEventListener('click', event => {
  //serial.flushreadings();
  serialMessagesContainer.value="";
});

function updates(commands){
  var text ="";
  
  if(serial.getWritingStatus() != "OFF"){
    setTimeout(updates,100,commands);
    return;
  }

  for(var i = commands.length-2; i>= 0; i--){
    text =  serial.getLastReadingsByCommand(commands[i].substr(6,2),null, true) + text;
  }

  document.querySelector('#termRx').value=text;

  prettifyHex();
  
}
function doAgree(...args){
  var limit = document.getElementById('boxActionMaxCurrent').value;
  if (confirm('ALERT: The calibration will be done with ' + limit + ' AMPs ( selected by current Limit), do you want to proceed? \n\nNote: Make sure the selected current limit is within the standard range for your motor')) {
    //OK SECTION
    //Previus version was in HTML doReadAll(.....), now we pass the arguments ..... but we cable doReadAll
    doReadAll(...args);
  } else {
    //NO SECTION
   
  }
}

function doDisbale(checkbox,elements){
  var toDisable = true;
  if(document.getElementById(checkbox).checked==false){
    toDisable = false;
    alert("The current Controller Gains are automatically identified by SOLO when you do the 'Motor Identification'");
  }
  disablePart(toDisable,elements);
}

function doDisbale2(checkbox,elements){
  var toDisable = true;
  if(document.getElementById(checkbox).checked==false){
    toDisable = false;
    alert("The Offsets are automatically identified by SOLO when you do the 'Encoder Calibration' or 'Hall Sensors Calibration'");
  }
  disablePart(toDisable,elements);
}

function doReadAll(extraCommand){
  soloId = convertFromType('UINT32',document.getElementById('boxActionDeviceAddress').value).slice(-2);
  if (serial.connectionStatus!= "connected"){
    alert("please check the connection of SOLO");
    return;
  }
  //console.log("Extra command: "+extraCommand);
  if(extraCommand==null || extraCommand==undefined){
    extraCommand="";
  }
  serial.multipleWriteStart(
    extraCommand+
    "FFFF"+"FF"+"810000000000FE"+
    "FFFF"+soloId+"8C0000000000FE"+ 
    "FFFF"+soloId+"8B0000000000FE"+
    "FFFF"+soloId+"8F0000000000FE"+
    "FFFF"+soloId+"900000000000FE"+
    "FFFF"+soloId+"970000000000FE"+
    "FFFF"+soloId+"B30000000000FE"+
    "FFFF"+soloId+"910000000000FE"+
    "FFFF"+soloId+"920000000000FE"+
    "FFFF"+soloId+"950000000000FE"+
    "FFFF"+soloId+"940000000000FE"+
    "FFFF"+soloId+"AA0000000000FE"+
    "FFFF"+soloId+"AD0000000000FE"+
    "FFFF"+soloId+"AB0000000000FE"+
    "FFFF"+soloId+"AE0000000000FE"+
    "FFFF"+soloId+"AC0000000000FE"+
    "FFFF"+soloId+"B10000000000FE"+
    "FFFF"+soloId+"B20000000000FE"+
    "FFFF"+soloId+"9A0000000000FE"+
    "FFFF"+soloId+"990000000000FE"+
    "FFFF"+soloId+"9B0000000000FE"+
    "FFFF"+soloId+"A90000000000FE"+
    "FFFF"+soloId+"890000000000FE"+
    "FFFF"+soloId+"8A0000000000FE"+
    "FFFF"+soloId+"9D0000000000FE"+
    "FFFF"+soloId+"9E0000000000FE"+
    "FFFF"+soloId+"A40000000000FE"+
    "FFFF"+soloId+"A50000000000FE"+
    "FFFF"+soloId+"9C0000000000FE"+
    "FFFF"+soloId+"A70000000000FE"+
    "FFFF"+soloId+"A60000000000FE"+
    "FFFF"+soloId+"A80000000000FE"+
    "FFFF"+soloId+"8E0000000000FE"+
    "FFFF"+soloId+"860000000000FE"+
    "FFFF"+soloId+"930000000000FE"+
    "FFFF"+soloId+"A10000000000FE"+
    "FFFF"+soloId+"A20000000000FE"+
    "FFFF"+soloId+"960000000000FE"+
    "FFFF"+soloId+"8D0000000000FE"+
    "FFFF"+soloId+"A00000000000FE"+
    "FFFF"+soloId+"B60000000000FE"+
    "FFFF"+soloId+"B40000000000FE"+
    "FFFF"+soloId+"B50000000000FE"+
    "FFFF"+soloId+"A30000000000FE"
    );
  
    updateAndFlushSimpleActionRead("FFFF"+soloId+"8C0000000000FE", 'SFXT', 0 , 'boxActionMaxCurrent', 'boxActionMaxCurrent',null , 'rangeActionMaxCurrent');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"8B0000000000FE", 'UINT32', 0.001 , 'boxActionPWMFrequency', 'boxActionPWMFrequency',null, 'rangeActionPWMFrequency');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"8F0000000000FE", 'UINT32', 0 , 'boxActionPoles', 'boxActionPoles',null , 'rangeActionPoles');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"900000000000FE", 'UINT32', 0 , 'boxActionEncoderLines', 'boxActionEncoderLines',null , 'rangeActionEncoderLines');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"970000000000FE", 'UINT32', 0 , 'boxActionMotorType', 'boxActionMotorType',null, null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B30000000000FE", 'UINT32', 0 , 'boxActionUartBaudRate', 'boxActionUartBaudRate',null, null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B60000000000FE", 'UINT32', 0 , 'boxActionCanopenBaudRate', 'boxActionCanopenBaudRate',null, null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"910000000000FE", 'SFXT', 0 , 'boxActionCurrentControllerKp', 'boxActionCurrentControllerKp',null, 'rangeActionCurrentControllerKp');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"920000000000FE", 'SFXT', 0.00005 , 'boxActionCurrentControllerKi', 'boxActionCurrentControllerKi',null, 'rangeActionCurrentControllerKi');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"950000000000FE", 'SFXT', 0 , 'boxActionMotorInductance', 'boxActionMotorInductance',null, 'rangeActionMotorInductance');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"940000000000FE", 'SFXT', 0 , 'boxActionMotorResistance', 'boxActionMotorResistance',null, 'rangeActionMotorResistance');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"AA0000000000FE", 'SFXT', 0 , 'boxActionNBOG', 'boxActionNBOG',null, 'rangeActionNBOG');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"AD0000000000FE", 'SFXT', 0 , 'boxActionNBFG', 'boxActionNBFG',null, 'rangeActionNBFG');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"AB0000000000FE", 'SFXT', 0 , 'boxActionFBOG', 'boxActionFBOG',null, 'rangeActionFBOG');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"AE0000000000FE", 'SFXT', 0 , 'boxActionFBFG', 'boxActionFBFG',null, 'rangeActionFBFG');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"AC0000000000FE", 'SFXT', 0 , 'boxActionDCOG', 'boxActionDCOG',null, 'rangeActionDCOG');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B10000000000FE", 'SFXT', 0 , 'boxActionCcwO', 'boxActionCcwO',null, 'rangeActionCcwO');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B20000000000FE", 'SFXT', 0 , 'boxActionCwO', 'boxActionCwO',null, 'rangeActionCwO');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"9A0000000000FE", 'UINT32', 0 , 'boxActionCommandMode', 'boxActionCommandMode',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"990000000000FE", 'UINT32', 0 , 'boxActionControlMode', 'boxActionControlMode',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"9B0000000000FE", 'UINT32', 0 , 'boxActionControlType', 'boxActionControlType',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A90000000000FE", 'UINT32', 0 , 'boxActionMotorDirection', 'boxActionMotorDirection',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"890000000000FE", 'SFXT', 0 , 'boxActionSpeedControllerKp', 'boxActionSpeedControllerKp',null, 'rangeActionSpeedControllerKp');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"8A0000000000FE", 'SFXT', 0 , 'boxActionSpeedControllerKi', 'boxActionSpeedControllerKi',null, 'rangeActionSpeedControllerKi');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"9D0000000000FE", 'SFXT', 0 , 'boxActionPositionControllerKp', 'boxActionPositionControllerKp',null, 'rangeActionPositionControllerKp');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"9E0000000000FE", 'SFXT', 0 , 'boxActionPositionControllerKi', 'boxActionPositionControllerKi',null, 'rangeActionPositionControllerKi');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A40000000000FE", 'SFXT', 0 , 'boxActionTorqueReferenceIq', 'boxActionTorqueReferenceIq',null, 'rangeActionTorqueReferenceIq');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A50000000000FE", 'UINT32', 0 , 'boxActionSpeedReference', 'boxActionSpeedReference',null, 'rangeActionSpeedReference');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"9C0000000000FE", 'UINT32', 0 , 'boxActionSpeedLimit', 'boxActionSpeedLimit',null, 'rangeActionSpeedLimit');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A70000000000FE", 'INT32', 0 , 'boxActionDesiredPosition', 'boxActionDesiredPosition',null, 'rangeActionDesiredPosition');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A60000000000FE", 'SFXT', 0 , 'boxActionMagnetizingCurrentId', 'boxActionMagnetizingCurrentId',null, 'rangeActionMagnetizingCurrentId');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A80000000000FE", 'SFXT', 0 , 'boxActionPowerReference', 'boxActionPowerReference',null, 'rangeActionPowerReference');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B40000000000FE", 'SFXT', 0 , 'boxActionSpeedAcceleration', 'boxActionSpeedAcceleration',null, 'rangeActionSpeedAcceleration');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B50000000000FE", 'SFXT', 0 , 'boxActionSpeedDeceleration', 'boxActionSpeedDeceleration',null, 'rangeActionSpeedDeceleration');
    updateAndFlushSimpleActionRead("FFFF"+soloId+"860000000000FE", 'SFXT', 0 , 'boxActionSupplyVoltage', 'boxActionSupplyVoltage',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"930000000000FE", 'SFXT', 0 , 'boxActionTemperature', 'boxActionTemperature',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"930000000000FE", 'SFXT', 0 , 'boxActionTemperature', 'boxActionTemperature',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A10000000000FE", 'ERROR', 0 , 'boxActionErrorRegister', 'boxActionErrorRegister',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A20000000000FE", 'NONE', 0 , 'boxActionFirmwareVersion', 'boxActionFirmwareVersion',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"960000000000FE", 'INT32', 0 , 'boxActionSpeed', 'boxActionSpeed',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"8D0000000000FE", 'SFXT', 0 , 'boxActionTorqueIq', 'boxActionTorqueIq',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"8E0000000000FE", 'SFXT', 0 , 'boxActionCurrentId', 'boxActionCurrentId',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A00000000000FE", 'INT32', 0 , 'boxActionPosition', 'boxActionPosition',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"A30000000000FE", 'NONE', 0 , 'boxActionHardwareVersion', 'boxActionHardwareVersion',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+"FF"+"810000000000FE", 'UINT32', 0 , 'boxActionDeviceAddress', 'boxActionDeviceAddress',null ,null);
    setTimeout(doStoreIp, 500,'boxActionDeviceAddress');
    setTimeout(doActionSemplifications, 1000,['boxActionCommandMode','boxActionControlType']);
    
}


function doActionSemplifications(boxValueIds){
  for(var boxValueId of boxValueIds){
    doActionSemplification(boxValueId);
  }
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
      case '0': //SPEED
        disablePart(true, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
        disablePart(true, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
        disablePart(true, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
        disablePart(true, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
        disablePart(true, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
        break;
      case '1': //TORQUE
        disablePart(true, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
        disablePart(true, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
        disablePart(true, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
        disablePart(true, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
        
        disablePart(true, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
        disablePart(true, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );
        disablePart(true, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
        disablePart(true, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );

        break;

      case '2': //POSITION
        disablePart(true, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
        disablePart(true, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
        disablePart(true, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );

        disablePart(true, ["boxActionMotorDirection","bActionMotorDirection"] );
        disablePart(true, ["boxActionControlMode","bActionControlMode"] );

      break;
    }

  }
  if(boxValueId=='boxActionCommandMode'){
    var actionValue = document.getElementById(boxValueId).value;
    
    disablePart(false, ["boxActionMotorType","bActionMotorType"] );
    disablePart(false, ["boxActionControlType","bActionControlType"] );
    disablePart(false, ["boxActionMotorDirection","bActionMotorDirection"] );

    disablePart(false, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
    disablePart(false, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );
    disablePart(false, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
    disablePart(false, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );

    disablePart(false, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
    disablePart(false, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
    disablePart(false, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );

    disablePart(false, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
    disablePart(false, ["boxActionMagnetizingCurrentId","rangeActionMagnetizingCurrentId","bActionMagnetizingCurrentId"] );
    disablePart(false, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );
    
    disablePart(false, ["bActionMotorStop"] );
    
    
    switch (actionValue){
      case '0': //ANALOGUE
      disablePart(true, ["boxActionMotorType","bActionMotorType"] );
      disablePart(true, ["boxActionControlType","bActionControlType"] );
      disablePart(true, ["boxActionMotorDirection","bActionMotorDirection"] );
  
      disablePart(true, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
      disablePart(true, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );
      disablePart(true, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
      disablePart(true, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
  
      disablePart(true, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
      disablePart(true, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
      disablePart(true, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
  
      disablePart(true, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
      disablePart(true, ["boxActionMagnetizingCurrentId","rangeActionMagnetizingCurrentId","bActionMagnetizingCurrentId"] );
      disablePart(true, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );
      
      disablePart(true, ["bActionMotorStop"] );
        break;
      case '1': //DIGITAL
        
        break;
    }
  }

}

function disablePart(value, ids){
  for(var i in ids){
    document.getElementById(ids[i]).disabled = value;
  }
}

function doActionReadMultiplyCore(command, typeToSet, valueToSetId, boxToColorId, valueToMultiply,slideToUpdate ){
  doActionReadMultiply(serial.soloId, command, typeToSet, valueToSetId, boxToColorId, valueToMultiply,slideToUpdate )
}

function doActionReadMultiply(address, command, typeToSet, valueToSetId, boxToColorId, valueToMultiply,slideToUpdate ){
  doActionRead(address, command, typeToSet, valueToSetId, boxToColorId, parseFloat(valueToMultiply),slideToUpdate);
}

function doActionReadCore(command, typeToSet, valueToSetId, boxToColorId, multiply, slideToUpdate){
  doActionRead(serial.soloId, command, typeToSet, valueToSetId, boxToColorId, multiply, slideToUpdate);
}

function doActionRead(address, command, typeToSet, valueToSetId, boxToColorId, multiply, slideToUpdate){
  if (serial.connectionStatus!= "connected"){
    alert("please check the connection of SOLO");
    return
  }

  var commandToSend= "FFFF" + address + command + "00000000" + "00FE";

  if(multiply==null){
    multiply =0;
  }
  doSimpleActionRead(commandToSend, typeToSet , valueToSetId, boxToColorId, multiply, slideToUpdate);
}

function doActionStopMotor(){
  setTimeout(doAction, 1,  serial.soloId,'04','UINT32','bActionMotorStop','bActionMotorStop');
  setTimeout(doAction, 350,serial.soloId,'05','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 700,serial.soloId,'1B','UINT32','bActionMotorStop','bActionMotorStop'); 
}
function convertToCammandToSendCore( command, type, valueOrValueId){
  return convertToCammandToSend(serial.soloId, command, type, valueOrValueId);
}

function convertToCammandToSend(address, command, type, valueOrValueId){
  var value = valueOrValueId;
  if(valueOrValueId.toString().length>2){
    value = document.getElementById(valueOrValueId).value
  }
  var commandToSend= "FFFF" + address + command + convertFromType(type,value) + "00FE";
  //console.log('command to send: '+ commandToSend);
  return commandToSend;
}

function doStoreIp(valueOrValueId){
  serial.soloId = convertFromType('UINT32',document.getElementById(valueOrValueId).value).slice(-2); 
  if( messageInput.value.toString().match(/FFFF..860000000000FE/)  ){
    messageInput.value = "FFFF"+ serial.soloId +"860000000000FE";
  } 

  //console.log("new ip: " +serial.soloId );
}

function doActionCore(command, type, valueOrValueId, boxToColorId ){
  doAction(serial.soloId , command, type, valueOrValueId, boxToColorId )
}

function doAction(address, command, type, valueOrValueId, boxToColorId ){
  if (serial.connectionStatus!= "connected"){
    alert("please check the connection of SOLO");
    return;
  }

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

function doSimpleActionRead (commandToSend, typeToSet, valueToSetId ,boxToColorId , multiply, slideToUpdate){
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleActionRead,200,commandToSend,typeToSet, multiply,valueToSetId, boxToColorId, null, slideToUpdate);
  }
}


function doSimpleAction(commandToSend,boxToColorId){
  
  if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
    serial.multipleWriteStart(commandToSend);
    setTimeout(updateAndFlushSimpleAction,200,commandToSend,boxToColorId);
  }
}
function updateAndFlushSimpleActionRead(fullcommand, typeToSet, multiply, readValueToSetId, boxToColorId, historySize, slideToUpdate) {
  if(serial.getWritingStatus() != "OFF"){
    setTimeout(updateAndFlushSimpleActionRead,200,fullcommand,typeToSet, multiply, readValueToSetId, boxToColorId, historySize, slideToUpdate);
  }else{

    var recivedCommand =serial.getLastReadingsByCommand(fullcommand.substr(6,2),historySize, false);

    if(recivedCommand.length>0){

      var commandRead = recivedCommand.substring(8, 16);
      var commandToSet= convertToType(typeToSet, commandRead);
      if(multiply!=0){
        commandToSet = commandToSet * multiply;
      }
      
      document.getElementById(readValueToSetId).value = commandToSet; 

      if(slideToUpdate!=null){
        document.getElementById(slideToUpdate).value = commandToSet;
      }
      
      //if(readValueToSetId=='boxActionControlType'){
      //  document.getElementById(readValueToSetId).onchange(); 
      //}

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

    var commandRecived = null;

    if(performanceMonitorActivation==false && monitorActivation == false){
      commandRecived = serial.getLastReadingsByCommand(fullcommand.substr(6,2),2, false);
    }else{
      commandRecived = serial.getLastReadingsByCommand(fullcommand.substr(6,2),null, false);
    }

    if(boxToColorId!=null){
         
          if(commandRecived.substr(6,2) == fullcommand.substr(6,2)){
            document.getElementById(boxToColorId).classList.add("bg-success");
          }else{
            document.getElementById(boxToColorId).classList.add("bg-danger");
          }
          
        setTimeout(clearTimeoutBoxToColor,500,boxToColorId);
  
    }

  }
    
  }

function clearTimeoutBoxToColor(boxToColorId){
  if(boxToColorId!=null){
    document.getElementById(boxToColorId).classList.remove("bg-danger","bg-success", "bg-info", "bg-warning");
  }
}


function logStart(){
  serial.setRecording(true);
}

function logStopAndSave(){
  serial.setRecording(false);
  serial.saveRecording();
}

