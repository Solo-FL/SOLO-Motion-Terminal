// Copyright: (c) 2020, SOLO motor controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

window.onload = function () {
    toogleSignalsSwitch();
    toogleActionsSwitch();
    toogleMonitorsSwitch();
    toogleHelpSwitch();
  }

document.querySelector('#conversionFloat').oninput = function () {
    conversionFromFloat();
};

document.querySelector('#conversionInt32').oninput = function () {
    conversionFromInt32();
};

document.querySelector('#conversionDecimal').oninput = function () {
    conversionFromDecimal();
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
