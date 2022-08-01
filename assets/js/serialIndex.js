// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

const serial = new Serial();

const connect = document.getElementById('buttonConnection');
const messageInput = document.getElementById('termTx'); 
const submitButton = document.getElementById('buttonSimpleTX');  
const clearButton = document.getElementById('buttonClearBuffer'); 
const serialMessagesContainer = document.getElementById('termRx');
var calibrationWizardStatus = "none";
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


function initConnection(){
  serial.init();
}

function checkFirmwareVersion(){
  var version = document.querySelector('#boxActionFirmwareVersion').value;
 if(serial.connectionStatus=="connected" && 
    (version.length>5 && version!="0000B00C")){
    document.getElementById('buttonErrorTooltip1').style.display= "inline" ;
    document.getElementById('buttonErrorTooltip2').style.display= "inline" ;
    console.log("The latest version of Firmware is different. Please update it for a better user experience, to get the updater tool please contact us.");
  }
}

setInterval(checkStatus,1000);

function checkStatus(){
  //console.log("CHECK STATUS: start");

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
        //console.log("CHECK STATUS: connected");
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

const delay = ms => new Promise(res => setTimeout(res, ms));

async function doInversion(){
  printWizzartLog("\r\nOffsets are Inverted ( new offset = 1 - previous offset )");

  inversionDone = true;
  var ccwo = parseFloat(document.getElementById('boxActionCcwO').value);
  var cwo = parseFloat(document.getElementById('boxActionCwO').value);
  document.getElementById('boxActionCcwO').value = (1 - ccwo).toFixed(7);
  document.getElementById('boxActionCwO').value = (1 - cwo).toFixed(7);
  await delay(700);

  doActionCore('28','SFXT','boxActionCcwO','boxActionCcwO');
  await delay(700);
  doActionCore('29','SFXT','boxActionCwO','boxActionCwO');
  await delay(700);
}

async function errorIsPresent(){
  doActionReadCore('A1','ERROR','boxActionErrorRegister','boxActionErrorRegister')
  await delay(700);
  return "No Errors" != document.getElementById('boxActionErrorRegister').value;
}

async function printWizzartLog(message){
  var boxWizardStatus = document.getElementById('boxWizardStatus');
  boxWizardStatus.value +=  message;
  if(boxWizardStatus.scrollHeight<=100){
    $("#boxWizardStatus").outerHeight(38).outerHeight(boxWizardStatus.scrollHeight);
  }else{
    $("#boxWizardStatus").outerHeight(100);
  }
  boxWizardStatus.scrollTop = boxWizardStatus.scrollHeight;
  await delay(700);
}

async function doFeedbackTest(encoderIndex){
  var encoderWorking = false;
  var lastPox=0;
  var actualPox;
  var waiting = 5;
  var timeOut = 40;


  while (waiting>0) {
    await delay(500);
    doActionReadCore('A0','INT32','boxActionPosition','boxActionPosition')
    await delay(500);
    actualPox = Math.abs(parseFloat(document.getElementById('boxActionPosition').value));
      if(lastPox != actualPox && Math.abs(lastPox-actualPox)>3){
        lastPox = Math.abs(actualPox);
        encoderWorking = true;
      }else{
        waiting-=1;
        console.log("FeedbackTest no changed");
      }
      if(calibrationWizardStatus == "none"){
        encoderWorking = false;
        break;
      }
    timeOut--;
    if(timeOut<0){
      doReadAll(convertToCammandToSendCore('27','UINT32','bActionCalibrationStop'));
      break
    }
  }
  
  if(encoderIndex != null){
    doActionReadCore('B8','UINT32','boxActionEconderIndexCount','boxActionEconderIndexCount')
    await delay(700);
    if (encoderIndex == document.getElementById('boxActionEconderIndexCount').value){
      throw new Error("No Index");
    }
  }

  if(timeOut<0){
    throw new Error("Time Out");
  }

  if(!encoderWorking){
    doActionCore('27','UINT32','bActionCalibrationStop');
    await delay(500);
  }

  return encoderWorking;
}

async function endFullCalibartion(message){
  document.getElementById('bActionFullCalibration').classList.remove("bg-danger","bg-success", "bg-info", "bg-warning");
  document.getElementById('boxWizardStatus').value = "";
  document.getElementById('rawWizardStatus').style.display= "none";
  await delay(300);
  calibrationWizardStatus = "none";

  if (message!=null){
    alert(message);
  }
}

async function doFullCalibartion(){
  if (serial.connectionStatus!= "connected"){
    calibrationWizardStatus = "none";
    if(confirm("Please check the connection of SOLO, \nTry to connect?")){
      initConnection();
    }
    return;
  }

  if(calibrationWizardStatus != "none"){
    printWizzartLog( "\r\nProcess already started");
    return;
  }

  calibrationWizardStatus = "working";
  
  if(await errorIsPresent()){
    endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
    return;
  }

  document.getElementById('boxWizardStatus').value = "";
  document.getElementById('rawWizardStatus').style.display= "revert";
  await delay(700);

  printWizzartLog("Process starting...");
  document.getElementById('bActionFullCalibration').classList.add("bg-warning");

  doActionReadCore('8C','SFXT','boxActionMaxCurrent','boxActionMaxCurrent',null,'rangeActionMaxCurrent');
  await delay(700);
  var limit = document.getElementById('boxActionMaxCurrent').value;

  doActionReadCore('99','UINT32','boxActionControlMode','boxActionControlMode');
  await delay(700);
  var controlMode =  document.getElementById("boxActionControlMode");
  var controlModeText= controlMode.options[controlMode.selectedIndex].text;

  if(controlModeText == 'SENSOR LESS'){
    endFullCalibartion("Calibration needs Hall Sensors or Encoders, you can select the type it in input: \n Feedback Control Mode* ");
    return;
  }
  
  var confirmation = confirm(
    'The calibration will be: '+ controlModeText + ' (Feedback Control Mode*) \n' + 
    'The calibration will be done with: ' + limit + ' AMPs (Current Limit [A]*)\n\n' + 
    'NOTE: make sure to set SOLO in Close-loop mode'+
    '\nNOTE: the process will take a couple of minutes... '+ 
    '\nALERT: if necessary press CANCEL and change the Params. Make sure the Current Limit is within the standard range for your motor.');

  if (!confirmation){
    endFullCalibartion();
    return;
  }

  document.getElementById('boxActionCcwO').value = 0;
  document.getElementById('boxActionCwO').value = 0;
  await delay(700);

  doActionCore('28','SFXT','boxActionCcwO','boxActionCcwO');
  await delay(700);
  doActionCore('29','SFXT','boxActionCwO','boxActionCwO');
  await delay(700);
  var encoderIndex =null;
  if(controlModeText == 'USING HALL SENSORS'){
    printWizzartLog("\r\nnRunning HALL SENSORS Calibration...");
    doActionCore('27','UINT32','bActionHallSensorsCalibration','bActionHallSensorsCalibration');
  }
  else if(controlModeText == 'USING ENCODERS'){
    printWizzartLog("\r\nRunning ENCODER Calibration...");
    doActionReadCore('B8','UINT32','boxActionEconderIndexCount','boxActionEconderIndexCount')
    await delay(500);
    encoderIndex = document.getElementById('boxActionEconderIndexCount').value;
    await delay(500);
    doActionCore('27','UINT32','bActionEncoderCalibration','bActionEncoderCalibration');
  } else {
    endFullCalibartion("Calibration need Hall Sensors or Encoders");
    return;
  }
  await delay(400);
  
  if(await errorIsPresent()){
    endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
    return;
  }
  
  
  var isFeedback; 
  try{
    isFeedback = await doFeedbackTest(encoderIndex);
  }catch(e){
    if(e.message=="No Index"){
      endFullCalibartion("Calibration Failed! \r\nNo index signal");
      return;
    }
  
    if(e.message=="Time Out"){
      endFullCalibartion("Calibration Failed! \r\nTime Out Exception");
      return;
    }
  }
  
  printWizzartLog("\r\nCalibration Finished");
  
  


  if(!isFeedback){
    endFullCalibartion("Calibration Failed!, no Encoder/Hall Sensor feedback is sensed from the sensor, please check the connection and the wirings");
    return;
  }

  doReadAll();
  await delay(2000);

  if(await errorIsPresent()){
    endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
    return;
  }

  //TORQUE
  var isTorqueWork = await doTorqueTest(limit);
  var inversionDone = false;
  
  if(isTorqueWork == false ){
    await doInversion();
    await delay(700); 
    
    if(await errorIsPresent()){
      endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
      return;
    }
    isTorqueWork = await doTorqueTest(limit);
  }

  if(!isTorqueWork){
   document.getElementById('bActionFullCalibration').classList.remove("bg-danger","bg-success", "bg-info", "bg-warning");
    endFullCalibartion("Calibration for this Motor wiring Failed, Change the wirings and redo the process (Turn OFF  SOLO, change the motor wires to a new combination out of 6 possible combinations, turn ON SOLO, reconnect SOLO to Motion terminal, Run Calibration Wizard again)");
    return;
  }

  //TORQUE IS OK
  console.log("Torque calibration was good");

  //START SPEED TEST
  var maxSpeed = prompt("What is the nominal speed of your Motor? ( Not necessary to be precise, just required for some tastings)");
  if(maxSpeed == null){
    endFullCalibartion("Nominal Speed of the Motor is missing, Calibration ended.");
    return;
  }

  if(await errorIsPresent()){
    endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
    return;
  }
  var isSpeedWork = await doSpeedTest(maxSpeed);

  if(isSpeedWork == false && inversionDone == false ){
    inversionDone = true;
    isSpeedWork = false;

    await doInversion();

    if(await errorIsPresent()){
      endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
      return;
    }
    isTorqueWork = await doTorqueTest(limit);
    await delay(700);

    if(isTorqueWork){
        if(await errorIsPresent()){
          endFullCalibartion("An Error Occurred! \r\nThe Error register value is non-zero! check the error and redo the calibration...");
          return;
        }
        isSpeedWork = await doSpeedTest(maxSpeed);
    }
  }

  if(!isSpeedWork || !isTorqueWork){
    endFullCalibartion("Calibration for this Motor wiring Failed, Change the wirings and redo the process (Turn OFF  SOLO, change the motor wires to a new combination out of 6 possible combinations, turn ON SOLO, reconnect SOLO to Motion terminal, Run Calibration Wizard again)");
    return;
  }

  endFullCalibartion("Calibration Succeeded!\r\nNow you can use the Motor and the Calibration values will remain in NVM memory of SOLO after power recycling.");
}

async function doSpeedTestMotionTest(speedGoal, direction){
  //START MOVE THE MOTOR DIRECTION 1
  console.log("doSpeedTest start motor dir"+ direction);
  document.getElementById('boxActionMotorDirection').value = direction;
  document.getElementById('boxActionStall').value = 5000;
  document.getElementById('boxActionSpeedReference').value = speedGoal;

  await delay(500);
  doActionCore('0C','UINT32','boxActionMotorDirection','boxActionMotorDirection');
  await delay(500);
  doActionCore('2E','UINT32','boxActionStall','boxActionStall');
  await delay(500);
  doActionCore('05','UINT32','boxActionSpeedReference','boxActionSpeedReference');
  await delay(1000);

  var speed = 0;
  var iteration = 5;

  for (let i = 0; i < iteration; i++) {
    await delay(1000);
    doActionReadCore('96','INT32','boxActionSpeed','boxActionSpeed');
    await delay(500);
    var newSpeed = parseFloat(document.getElementById('boxActionSpeed').value);
      if(newSpeed == 0 ){
        speed=0;
        break
      }
    speed+= newSpeed;
  }

  //STOP MOVE THE MOTOR
  document.getElementById('boxActionSpeedReference').value = 0;
  await delay(500);
  doActionCore('05','UINT32','boxActionSpeedReference','boxActionSpeedReference');
  await delay(1500);

  speed = speed / iteration;
  console.log("SPEED test: " + speed);
  return speed;
}

async function doSpeedTest(maxSpeed){
  if(calibrationWizardStatus == "none"){
    return false;
  }

  printWizzartLog("\r\nStarting Speed Evaluation...");

  var speedGoal = Math.floor(parseFloat(maxSpeed)/2);

  //PUT IN SPEED
  document.getElementById('boxActionControlType').value = 0;
  await delay(4000);
  doActionCore('16','UINT32','boxActionControlType','boxActionControlType');
  doActionSemplifications(['boxActionControlType','boxActionCommandMode']);

  //SET KP KI
  await delay(700);
  document.getElementById('boxActionSpeedControllerKp').value = 0.2;
  document.getElementById('boxActionSpeedControllerKi').value = 0.005;
  await delay(700);
  doActionCore('0A','SFXT','boxActionSpeedControllerKp','boxActionSpeedControllerKp');
  doActionCore('0B','SFXT','boxActionSpeedControllerKi','boxActionSpeedControllerKi');
  await delay(1000);
  
  var speed = 0;
  var speed2 = 0;

  speed = await doSpeedTestMotionTest(speedGoal,0);
  speed2 = await doSpeedTestMotionTest(speedGoal,1);  
  
  printWizzartLog("\r\nSpeed Evaluation Ended");
  await delay(500);

  if((speed >= 0 && speed2 >= 0) || (speed <= 0 && speed2 <= 0) ){
    console.log("SPEED test: speed no direction changes or 0");
    return false;
  }

  var error = speedGoal*0.2;

  if( Math.abs(speedGoal-Math.abs(speed))>(error) || Math.abs(speedGoal-Math.abs(speed2))>(error) ){
    console.log("SPEED test: to much error ");
    return false;
  }

  return true;
}

async function doTorqueTest(currentLimit){
  if(calibrationWizardStatus == "none"){
    return false;
  }

  printWizzartLog("\r\nStarting Torque Evaluation...");

  //START MOVE THE MOTOR
  await delay(500);
  document.getElementById('boxActionControlType').value = 1;
  await delay(500);
  doActionCore('16','UINT32','boxActionControlType','boxActionControlType'); 
  doActionSemplifications(['boxActionControlType','boxActionCommandMode']);
  await delay(500);

  document.getElementById('boxActionTorqueReferenceIq').value = (parseFloat(currentLimit)/2).toFixed(2);
  await delay(500);
  doActionCore('04','SFXT','boxActionTorqueReferenceIq','boxActionTorqueReferenceIq');

  var speed = 0;
  var iteration = 5;
  for (let i = 0; i < iteration; i++) {
    await delay(1000);
    doActionReadCore('96','INT32','boxActionSpeed','boxActionSpeed');
    await delay(500);
    var newSpeed = Math.abs(parseFloat(document.getElementById('boxActionSpeed').value));
      if(newSpeed == 0 ){
        speed=0;
        break
      }
    speed+= newSpeed;
  }

  //STOP MOVE THE MOTOR
  document.getElementById('boxActionTorqueReferenceIq').value = 0;
  await delay(500);
  doActionCore('04','SFXT','boxActionTorqueReferenceIq','boxActionTorqueReferenceIq');
  await delay(1500);

  printWizzartLog("\r\nTorque Evaluation Ended");
  await delay(500);

  speed = speed / iteration;
  console.log("torque test: " + speed);
  if(speed <= 1 ){
    return false;
  }

  return true;
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
  //console.log("doActionSemplifications");
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
    return;
  }

  doReadAll();
  messageInput.value = generateAllParamsSet();
  prettifyHex();
}

function doActionSaveWorkspace(){
  doReadAll();
  setTimeout(saveWorkspace, 1500);
}

function saveWorkspace(){
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
      //('Worspeace:', commands);
      if(serial.getConnectionStatus() == "connected" && serial.getWritingStatus() == "OFF"){
        serial.multipleWriteStart(commands);
        doBgAnimationAndRead("bActionLoadWorkspace");
      }
    })
    .catch(e=> console.error("SAVE FILE ERROR: ", e));

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
  //console.log("doActionReadComplexCore");
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
  setTimeout(doAction, 300,serial.soloId,'05','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 600,serial.soloId,'1B','UINT32','bActionMotorStop','bActionMotorStop'); 
  setTimeout(doAction, 900,serial.soloId,'27','UINT32','bActionCalibrationStop','bActionCalibrationStop');
  calibrationWizardStatus ='none'; 
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
  //console.log("doStoreIp" );
  serial.soloId = convertFromType('UINT32',document.getElementById(valueOrValueId).value).slice(-2); 
  if( messageInput.value.toString().match(/FFFF..860000000000FE/)  ){
    messageInput.value = "FFFF"+ serial.soloId +"860000000000FE";
  } 

  
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
  //console.log('Do action: ' + commandToSend);
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