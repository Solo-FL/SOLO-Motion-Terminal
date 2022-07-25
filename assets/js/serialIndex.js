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
      initConnection();
  }
});

function initConnection(){
  serial.init();
  setTimeout( checkFirmwareVersion, 8000);
}

function checkFirmwareVersion(){
  var version = document.querySelector('#boxActionFirmwareVersion').value;
 if(serial.connectionStatus=="connected" && 
    (version.length>5 && version!="0000B00B" && version!="0009B00A")){
    document.getElementById('buttonErrorTooltip1').style.display= "inline" ;
    document.getElementById('buttonErrorTooltip2').style.display= "inline" ;
    console.log("The latest version of Firmware is different. Please update it for a better user experience, to get the updater tool please contact us.");
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
      time += 25;
      if(i<splitCommands.length-1 || serial.isMonitoring){
        setTimeout(serial.getLastReadingsByCommandAndAppend.bind(serial), time, splitCommands[i].substr(6,2) ,null, true,document.querySelector('#termRx') );
        time += 10;
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
    if(confirm("Please check the connection of SOLO, \nTry to connect?")){
      initConnection();
    }
    return
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
    "FFFF"+soloId+"B90000000000FE"+
    "FFFF"+soloId+"BA0000000000FE"+
    "FFFF"+soloId+"930000000000FE"+
    "FFFF"+soloId+"A10000000000FE"+
    "FFFF"+soloId+"A20000000000FE"+
    "FFFF"+soloId+"960000000000FE"+
    "FFFF"+soloId+"8D0000000000FE"+
    "FFFF"+soloId+"A00000000000FE"+
    "FFFF"+soloId+"B60000000000FE"+
    "FFFF"+soloId+"B40000000000FE"+
    "FFFF"+soloId+"B50000000000FE"+
    "FFFF"+soloId+"B80000000000FE"+
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
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B9000000000FE", 'UINT32', 0 , 'boxActionStall', 'boxActionStall',null ,null);
    updateAndFlushSimpleActionRead("FFFF"+soloId+"BA0000000000FE", 'UINT32', 0 , 'boxActionHeartbeat', 'boxActionHeartbeat',null ,null);
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
    updateAndFlushSimpleActionRead("FFFF"+soloId+"B80000000000FE", 'UINT32', 0 , 'boxActionEconderIndexCount', 'boxActionEconderIndexCount',null ,null);
    setTimeout(doStoreIp, 500,'boxActionDeviceAddress');
    setTimeout(doActionReadComplexCore, 700,'B7','SFXT','boxActionAnalogueMaxSpeed','boxActionAnalogueMaxSpeed',0,'rangeActionAnalogueMaxSpeed');
    setTimeout(doActionSemplifications, 1000,['boxActionControlType','boxActionCommandMode']);
    
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
    

    
    
    switch (actionValue){
      case '0': //ANALOGUE
      disablePart(true, ["boxActionControlType","bActionControlType"] );
      disablePart(true, ["boxActionMotorDirection","bActionMotorDirection"] );
      if(!(document.querySelector('#boxActionFirmwareVersion').value=="0004B00A" || document.querySelector('#boxActionFirmwareVersion').value=="1006B00A")){
        disablePart(true, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
        disablePart(true, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );
      }else{
        disablePart(false, ["boxActionSpeedControllerKp","rangeActionSpeedControllerKp","bActionSpeedControllerKp"] );
        disablePart(false, ["boxActionSpeedControllerKi","rangeActionSpeedControllerKi","bActionSpeedControllerKi"] );
      }

      disablePart(true, ["boxActionPositionControllerKp","rangeActionPositionControllerKp","bActionPositionControllerKp"] );
      disablePart(true, ["boxActionPositionControllerKi","rangeActionPositionControllerKi","bActionPositionControllerKi"] );
  
      disablePart(true, ["boxActionTorqueReferenceIq","rangeActionTorqueReferenceIq","bActionTorqueReferenceIq"] );
      disablePart(true, ["boxActionSpeedReference","rangeActionSpeedReference","bActionSpeedReference"] );
      disablePart(true, ["boxActionSpeedLimit","rangeActionSpeedLimit","bActionSpeedLimit"] );
  
      disablePart(true, ["boxActionDesiredPosition","rangeActionDesiredPosition","bActionDesiredPosition"] );
      disablePart(true, ["boxActionMagnetizingCurrentId","rangeActionMagnetizingCurrentId","bActionMagnetizingCurrentId"] );
      disablePart(true, ["boxActionPowerReference","rangeActionPowerReference","bActionPowerReference"] );

      disablePart(false, ["boxActionAnalogueMaxSpeed","rangeActionAnalogueMaxSpeed","bActionAnalogueMaxSpeed"] );

      disablePart(true, ["boxActionMotorType","bActionMotorType"] );
      
      disablePart(true, ["bActionMotorStop"] );
        break;
      case '1': //DIGITAL
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

      disablePart(true, ["boxActionAnalogueMaxSpeed","rangeActionAnalogueMaxSpeed","bActionAnalogueMaxSpeed"] );

      disablePart(false, ["boxActionMotorType","bActionMotorType"] );
      
      disablePart(false, ["bActionMotorStop"] );
      doActionSemplification('boxActionControlType');
        break;
    }
  }

}

function generateAllParamsSet(){
  var allParamsSet="";
  allParamsSet = convertToCammandToSend('FF','01','UINT32','boxActionDeviceAddress')
  allParamsSet += convertToCammandToSendCore('03','SFXT','boxActionMaxCurrent');
  allParamsSet += convertToCammandToSendCore('09','UINT32','boxActionPWMFrequency');
  allParamsSet += convertToCammandToSendCore('0F','UINT32','boxActionPoles');
  allParamsSet += convertToCammandToSendCore('10','UINT32','boxActionEncoderLines');
  allParamsSet += convertToCammandToSendCore('15','UINT32','boxActionMotorType');
  allParamsSet += convertToCammandToSendCore('26','UINT32','boxActionUartBaudRate');
  allParamsSet += convertToCammandToSendCore('2C','UINT32','boxActionCanopenBaudRate');
  allParamsSet += convertToCammandToSendCore('2E','UINT32','boxActionStall');
  allParamsSet += convertToCammandToSendCore('2F','UINT32','boxActionHeartbeat');
  allParamsSet += convertToCammandToSendCoreComplex('2D','SFXT','boxActionAnalogueMaxSpeed',0);

  allParamsSet += convertToCammandToSendCore('17','SFXT','boxActionCurrentControllerKp');
  allParamsSet += convertToCammandToSendCore('18','SFXT','boxActionCurrentControllerKi');
  allParamsSet += convertToCammandToSendCore('0E','SFXT','boxActionMotorInductance');
  allParamsSet += convertToCammandToSendCore('0D','SFXT','boxActionMotorResistance');
  allParamsSet += convertToCammandToSendCore('21','SFXT','boxActionNBOG');
  allParamsSet += convertToCammandToSendCore('24','SFXT','boxActionNBFG');
  allParamsSet += convertToCammandToSendCore('22','SFXT','boxActionFBOG');
  allParamsSet += convertToCammandToSendCore('25','SFXT','boxActionFBFG');
  allParamsSet += convertToCammandToSendCore('23','SFXT','boxActionDCOG');

  allParamsSet += convertToCammandToSendCore('28','SFXT','boxActionCcwO');
  allParamsSet += convertToCammandToSendCore('29','SFXT','boxActionCwO');

  allParamsSet += convertToCammandToSendCore('02','UINT32','boxActionCommandMode');
  allParamsSet += convertToCammandToSendCore('13','UINT32','boxActionControlMode');
  allParamsSet += convertToCammandToSendCore('16','UINT32','boxActionControlType');
  allParamsSet += convertToCammandToSendCore('0C','UINT32','boxActionMotorDirection');
  allParamsSet += convertToCammandToSendCore('0A','SFXT','boxActionSpeedControllerKp');
  allParamsSet += convertToCammandToSendCore('0B','SFXT','boxActionSpeedControllerKi');
  allParamsSet += convertToCammandToSendCore('1C','SFXT','boxActionPositionControllerKp');
  allParamsSet += convertToCammandToSendCore('1D','SFXT','boxActionPositionControllerKi');
  allParamsSet += convertToCammandToSendCore('04','SFXT','boxActionTorqueReferenceIq');
  allParamsSet += convertToCammandToSendCore('05','UINT32','boxActionSpeedReference');
  allParamsSet += convertToCammandToSendCore('11','UINT32','boxActionSpeedLimit');
  allParamsSet += convertToCammandToSendCore('1B','INT32','boxActionDesiredPosition');
  allParamsSet += convertToCammandToSendCore('1A','SFXT','boxActionMagnetizingCurrentId');
  allParamsSet += convertToCammandToSendCore('06','SFXT','boxActionPowerReference');
  allParamsSet += convertToCammandToSendCore('2A','SFXT','boxActionSpeedAcceleration');
  allParamsSet += convertToCammandToSendCore('2B','SFXT','boxActionSpeedDeceleration');

  return allParamsSet;
}

function scanAllParams(){
  messageInput.value="";
  
  if (serial.connectionStatus!= "connected"){
    if(confirm("Please check the connection of SOLO, \nTry to connect?")){
      initConnection();
    }
    return
  }

  doReadAll();
  messageInput.value = generateAllParamsSet();
  prettifyHex();
}

function doActionSaveWorkspace(){
  var allParamsSet = generateAllParamsSet();
  let a = document.createElement('a');
  a.href = "data:application/octet-stream,";
  a.href = a.href + encodeURIComponent(allParamsSet);
  a.download = 'SOLO-Workspace.txt';
  a.click();
}

function parse(file) {
  // Always return a Promise
  return new Promise((resolve, reject) => {
    let content = '';
    const reader = new FileReader();
    // Wait till complete
    reader.onloadend = function(e) {
      content = e.target.result;
      //const result = content.split(/\r\n|\n/);
      const result = content;
      resolve(result);
    };
    // Make sure to handle error states
    reader.onerror = function(e) {
      reject(e);
    };
    reader.readAsText(file);
  });
}

function doActionLoadWorkspace(){
  messageInput.value="";

  const pickerOpts = {
    types: [
      {
        description: 'txt',
        accept: {
          'txt/*': ['.txt']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };
  
  window.showOpenFilePicker(pickerOpts)
  .then(fileHandleA=> {
    let [fileHandle] = fileHandleA;
    var fileData = fileHandle.getFile(); 
    return fileData}
    )
    .then(fileData => parse(fileData))
    .then(commands => {
      console.log('Worspeace:', commands);
      if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
        serial.multipleWriteStart(commands);
        doBgAnimationAndRead("bActionLoadWorkspace");
      }
    });

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
function showWarning(){
  alert("Firmware update notifications are sent by email to all of our users. "+ "\n" +"Contact us at 'support@solomotorcontrollers.com' if you missed those notifications");
}
function doActionReadCore(command, typeToSet, valueToSetId, boxToColorId, multiply, slideToUpdate){
  doActionRead(serial.soloId, command, typeToSet, valueToSetId, boxToColorId, multiply, slideToUpdate);
}
function getAnalogueSpeed(){
  var motoryType = document.getElementById('boxActionMotorType').value;
  var encoderMode = document.getElementById('boxActionControlMode').value;
  switch (motoryType){
    case '0': //DC
      if(encoderMode==1){ //ENCODERS
        return 8000;
      }
      return 30000;
      break;
    case '1': //BLDC
      return 8000;
      break;
    case '2': //ACIM
      return 4000;
      break;
    case '3': //BLDC ultrafast
      return 30000;
      break;
    }
    return 1;
}
function doActionCoreComplex(command, type, valueId, complexSytuation, boxToColorId ){
  if (serial.connectionStatus!= "connected"){
    if(confirm("Please check the connection of SOLO, \nTry to connect?")){
      initConnection();
    }
    return
  }

  updateAndFlushSimpleActionRead("FFFF"+soloId+"970000000000FE", 'UINT32', 0 , 'boxActionMotorType', 'boxActionMotorType',null, null);
  updateAndFlushSimpleActionRead("FFFF"+soloId+"990000000000FE", 'UINT32', 0 , 'boxActionControlMode', 'boxActionControlMode',null ,null);
  var commandToSend= convertToCammandToSendCoreComplex(command, type, valueId,complexSytuation);
  doSimpleAction (commandToSend,boxToColorId);
}

function convertToCammandToSendCoreComplex(command,type,valueId,complexSytuation){
  var valA = document.getElementById(valueId).value;
  switch(complexSytuation){
    case 0:
      var valB =getAnalogueSpeed();
      var value = (valB/valA).toFixed(2);
      break;
    }

  return convertToCammandToSendCoreWithValue(command, type, value);
}

function doActionReadComplexCore(command, typeToSet, valueToSetId, boxToColorId, complexSytuation, slideToUpdate){
  updateAndFlushSimpleActionRead("FFFF"+soloId+"970000000000FE", 'UINT32', 0 , 'boxActionMotorType', 'boxActionMotorType',null, null);
  updateAndFlushSimpleActionRead("FFFF"+soloId+"990000000000FE", 'UINT32', 0 , 'boxActionControlMode', 'boxActionControlMode',null ,null);
  var value =1;
  switch(complexSytuation){
    case 0:
      value =getAnalogueSpeed();
      break;
    }
      
  doActionRead(serial.soloId, command, typeToSet, valueToSetId, boxToColorId, "I"+value, slideToUpdate);
}

function doActionRead(address, command, typeToSet, valueToSetId, boxToColorId, multiply, slideToUpdate){
  if (serial.connectionStatus!= "connected"){
    if(confirm("Please check the connection of SOLO, \nTry to connect?")){
      initConnection();
    }
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

function convertToCammandToSendCoreWithValue( command, type, value){
  return convertToCammandToSendWithValue(serial.soloId, command, type, value);
}

function convertToCammandToSendWithValue(address, command, type, value){
  var commandToSend= "FFFF" + address + command + convertFromType(type,value) + "00FE";
  //console.log('command to send: '+ commandToSend);
  return commandToSend;
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
    if(confirm("Please check the connection of SOLO, \nTry to connect?")){
      initConnection();
    }
    return
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
      return serial.conversionToError(value);
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


function doBgAnimationAndRead(boxToColorId) {
  if(serial.getWritingStatus() != "OFF"){
    setTimeout(doBgAnimationAndRead,200, boxToColorId);
  }else{
    if(boxToColorId!=null){
      document.getElementById(boxToColorId).classList.add("bg-info");
      doReadAll();
      setTimeout(clearTimeoutBoxToColor,1000, boxToColorId);
    }
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

      if(multiply.toString()[0]=='I'){
        commandToSet = Math.round(multiply.substr(1) / commandToSet) ;
      }else if(multiply!=0){
        commandToSet = commandToSet * multiply;
      }

      if(fullcommand.substr(6,2)=='8B'){ //Peculiar situation, rounded condition for 8B read command
        commandToSet = Math.round(commandToSet);
      }

      if(fullcommand.substr(6,2)=='92'){ //Peculiar situation, rounded condition for 92 read command
        commandToSet = commandToSet.toFixed(7);
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