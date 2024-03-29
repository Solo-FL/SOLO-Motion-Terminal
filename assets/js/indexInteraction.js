// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

 function onWindowLoad() {
    //HAVE TO BE ORDERED FROM BOTTOM TO TOP
    toogleHelpSwitch();
    toogleTutorialsSwitch();
    toogleMonitorsSwitch();
    toogleActionsSwitch();
    toogleSignalsSwitch();
    document.querySelector('#content-wrapper').scrollIntoView();

    disablePart(true,
        [
            'boxActionCurrentControllerKp','rangeActionCurrentControllerKp','bActionCurrentControllerKp',
            'boxActionCurrentControllerKi','rangeActionCurrentControllerKi','bActionCurrentControllerKi',
            'boxActionMotorInductance','rangeActionMotorInductance','bActionMotorInductance',
            'boxActionMotorResistance','rangeActionMotorResistance','bActionMotorResistance',
            'boxActionNBOG','rangeActionNBOG','bActionNBOG',
            'boxActionNBFG','rangeActionNBFG','bActionNBFG',
            'boxActionFBOG','rangeActionFBOG','bActionFBOG',
            'boxActionFBFG','rangeActionFBFG','bActionFBFG',
            'boxActionDCOG','rangeActionDCOG','bActionDCOG',
            'boxActionCcwO','rangeActionCcwO','bActionCcwO',
            'boxActionCwO','rangeActionCwO','bActionCwO'
        
        ]);
  }

document.querySelector('#conversionFloat').oninput = function () {
    var value = document.querySelector('#conversionFloat').value;
    if(value.trim().length == 0){
        document.querySelector('#conversionDecimal').value = '';
        document.querySelector('#conversionHex').value = '';
        document.querySelector('#conversionInt32').value = '';
        return;
    }

    var hexValue = document.querySelector('#conversionHex').value = conversionFromFloat(value);
    document.querySelector('#conversionDecimal').value = conversionToDecimal(hexValue);
    document.querySelector('#conversionInt32').value = conversionToInt32(hexValue);
};

document.querySelector('#conversionInt32').oninput = function () {
    var value = document.querySelector('#conversionInt32').value;
    if(value.trim().length == 0){
        document.querySelector('#conversionDecimal').value = '';
        document.querySelector('#conversionHex').value = '';
        document.querySelector('#conversionFloat').value = '';
        return;
    }

    var hexValue = document.querySelector('#conversionHex').value = conversionFromInt32(value);
    document.querySelector('#conversionDecimal').value = conversionToDecimal(hexValue);
    document.querySelector('#conversionFloat').value = conversionToFloat(hexValue);
};

document.querySelector('#conversionDecimal').oninput = function () {
    var value = document.querySelector('#conversionDecimal').value;
    if(value.trim().length == 0){
        document.querySelector('#conversionFloat').value = '';
        document.querySelector('#conversionHex').value = '';
        document.querySelector('#conversionInt32').value = '';
        return 0;
    }

    var hexValue = document.querySelector('#conversionHex').value = conversionFromDecimal(value);
    document.querySelector('#conversionFloat').value = conversionToFloat(hexValue);
    document.querySelector('#conversionInt32').value = conversionToInt32(hexValue);
};

document.querySelector('#conversionHex').oninput = function () {
    conversionFromHex();
};


document.querySelector('#signalsSwitches').onclick = function () {
    toogleSignalsSwitch();
};

document.querySelector('#actionsSwitches').onclick = function () {
    toogleActionsSwitch();
};

document.querySelector('#monitorsSwitches').onclick = function () {
    toogleMonitorsSwitch();
};

document.querySelector('#helpSwitches').onclick = function () {
    toogleHelpSwitch();
};

document.querySelector('#tutorialsSwitches').onclick = function () {
    toogleTutorialsSwitch();
};

//update textarea size automatic
$(document).on('input', 'textarea', function () {
    if(this.scrollHeight<=310){
        $(this).outerHeight(38).outerHeight(this.scrollHeight); // 38 or '1em' -min-height
    }else{
        $(this).outerHeight(310);
    }
});
$("textarea").each(function () {
    if(this.scrollHeight<=310){
        $(this).outerHeight(38).outerHeight(this.scrollHeight); // 38 or '1em' -min-height
    }else{
        $(this).outerHeight(310);
    }
});


$("#sidebarToggleTop").on('click', function (e) {
    $(".sidebar").toggleClass("toggled");

    if ($(".sidebar").hasClass("toggled")) {
        $('.sidebar').collapse('hide');
        $('.sidebar-text').css('display', 'none');
    } else {
        $('.sidebar-text').css('display', 'revert');
    }
});


//action on left click of recived value
document.querySelector('#termRx').onclick = function () {
    conversionFromInput();
};
