// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

  function toogleSignalsSwitch() {
    toogle = document.querySelector('#signalsSwitches').checked;
    if (toogle) {
      document.querySelector('#signalsTable').style.display = "revert";
    } else {
      document.querySelector('#signalsTable').style.display = "none";
    }
  }
  
  function toogleActionsSwitch() {
    toogle = document.querySelector('#actionsSwitches').checked;
    if (toogle) {
      document.querySelector('#actionsTable').style.display = "revert";
    } else {
      document.querySelector('#actionsTable').style.display = "none";
    }
  }
  
  function toogleMonitorsSwitch() {
    toogle = document.querySelector('#monitorsSwitches').checked;
    if (toogle) {
      document.querySelector('#monitorsTable').style.display = "revert";
    } else {
      document.querySelector('#monitorsTable').style.display = "none";
    }
  }
  
  function toogleHelpSwitch() {
    toogle = document.querySelector('#helpSwitches').checked;
    if (toogle) {
      document.querySelector('#helpTable').style.display = "revert";
    } else {
      document.querySelector('#helpTable').style.display = "none";
    }
  }


  function conversionFromFloat(floatValue) {
    if (floatValue.trim().length == 0) {
      return;
    }

    console.log('float conversion of: ' + floatValue);
    dec = parseFloat(floatValue) * Math.pow(2, 17);
    isPositive = dec >= 0;
  
    dec = Math.abs(dec);
    dec = Math.floor(dec);
    if (!isPositive) {
      dec = 4294967295 - dec;
    }
  
    return decToHex(dec);
  }

  function conversionToInt32(hexValue){
    decValue = parseInt(hexValue, 16);
    i32Value = 0;

    if(decValue <= 2147483647){
      i32Value = decValue;
    }else{
      i32Value = -1 * (4294967295 - decValue + 1) ;
    }

    return i32Value;
  }

  function conversionFromInt32(i32Str) {
    if (i32Str.trim().length == 0) {
      return;
    }

    console.log('float conversion of: ' + i32Str);
    i32Value = parseFloat(i32Str);
    if(i32Value<0){
      i32Value = 4294967295 - Math.abs(i32Value) +1;
    }
  
    return decToHex(i32Value);
  }


  function conversionFromDecimal(decimalStr) {
    if (decimalStr.trim().length == 0) {
      return;
    }

    console.log('decimal conversion of: ' + decimalStr);
    return decToHex(parseInt(decimalStr));
  }
  
  function decToHex(decimalValue) {
    if(decimalValue>=0){
      return pad(parseInt(decimalValue).toString(16).toUpperCase(), 8);
    }else{
      return pad(parseInt(4294967295-Math.abs(decimalValue)+1).toString(16).toUpperCase(), 8);
    }
  }
  
  function conversionToDecimal(hexValue){
    decValue = parseInt(hexValue, 16);
    return decValue;
  }
  
  function conversionToFloat(hexValue){
    decValue = conversionToDecimal(hexValue);
    floatValue = 0;
    if (decValue < 2147352576) {
      floatValue = decValue / Math.pow(2, 17)
    }
    if (decValue > 2147352576) {
      floatValue = 4294967295 - decValue + 1
      floatValue = floatValue / Math.pow(2, 17) * -1
    }
    return  truncate(floatValue, 7)
  }

  function conversionFromHex() {
    hexValue = document.querySelector('#conversionHex').value;
    if (hexValue.trim().length == 0) {
      document.querySelector('#conversionDecimal').value = '';
      document.querySelector('#conversionFloat').value = '';
      document.querySelector('#conversionInt32').value = '';
      return;
    }
  
    console.log('hex conversion of: ' + hexValue);
    document.querySelector('#conversionDecimal').value = conversionToDecimal(hexValue);
    document.querySelector('#conversionFloat').value = conversionToFloat(hexValue);
    document.querySelector('#conversionInt32').value = conversionFromInt32(hexValue);
  }
  
  function truncate(num, places) {
    return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
  }
  
  function conversionFromInput() {
    document.querySelector('#conversionHex').value = document.querySelector('#termRx').value.substring(8, 16);
    conversionFromHex();
  }
  

  function prettifyHex(){
    document.querySelector('#termRx').value = breackInput(document.querySelector('#termRx').value.toUpperCase().replace(/(\r\n|\n|\r|\s)/gm, ""), 20);
    if(document.querySelector('#termRx').scrollHeight<=310){
      $("#termRx").outerHeight(38).outerHeight(document.querySelector('#termRx').scrollHeight);
    }else{
      $("#termRx").outerHeight(310);
    }

    document.querySelector('#termTx').value = breackInput(document.querySelector('#termTx').value.toUpperCase().replace(/(\r\n|\n|\r|\s)/gm, "") , 20);
    if(document.querySelector('#termTx').scrollHeight<=310){
      $("#termTx").outerHeight(38).outerHeight(document.querySelector('#termTx').scrollHeight);
    }else{
      $("#termTx").outerHeight(310);
    }
  }
  
  function breackInput(str, maxLength) {
    var buff = "";
    var numOfLines = Math.floor(str.length / maxLength);
    for (var i = 0; i < numOfLines + 1; i++) {
      buff += str.substr(i * maxLength, maxLength);
      if (i !== numOfLines) { buff += "\n"; }
    }
    return buff;
  }

  function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
  }

  function updateTextRangeInput(val,boxActionName) {
    document.getElementById(boxActionName).value=val; 
  }

  function updateRangeInput(val,rangeActionName) {
    document.getElementById(rangeActionName).value=val; 
  }