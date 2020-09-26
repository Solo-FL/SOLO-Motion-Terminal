// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

const serial = new Serial();

const connect = document.getElementById('buttonConnection');
const messageInput = document.getElementById('termTx'); 
const submitButton = document.getElementById('buttonSimpleTX');  
const serialMessagesContainer = document.getElementById('termRx');

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
  serial.multipleWriteStart(messageInput.value);
  serialMessagesContainer.value="";
  this.serialWritingStatus = "START";
  setTimeout(updateAndFlush,500);
});

function updateAndFlush(){
  serialMessagesContainer.value=serial.getReadingsFilterd();

  termRxSize= document.querySelector('#termRx').value.replace(/(\r\n|\n|\r|\s)/gm, "").length;
  termTxSize= document.querySelector('#termTx').value.replace(/(\r\n|\n|\r|\s)/gm, "").length;
  if(termRxSize>=termTxSize){
    serial.flushreadings();
    document.querySelector('#termRx').value=document.querySelector('#termRx').value.replace(/(\r\n|\n|\r|\s)/gm, "").substring(0,Math.floor(termTxSize/20));
  }else{
    if(this.serialWritingStatus == "START"){
      if(serial.getWritingStatus() =="OFF"){
        this.serialWritingStatus = "OFF";
      }
      setTimeout(updateAndFlush,500);
    }
  }

  prettifyHex();
}

document.getElementById('termTx').addEventListener('click', async () => {
    serial.log();
     getSerialMessage();
  });