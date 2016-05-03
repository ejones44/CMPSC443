/**
 * This javascript retrieves data from the DB and displays station shifts on a d3.js gantt chart.
 *
 *
 *
 *
 * Eddy Jones       eaj5073@psu.edu
 *
 */
var tasks = [];
var viewData = '';
var firstTime = 1;
var gantt = [];
$(document).ready(function () {
    $('#shiftLink').addClass("active");
    viewData = $('.view-Data').val();
    $.ajax("/api/scheduleEvents/all", {
        //if success, run this function with the data that is returned
        success : function (data) {
            viewData = data;
            //this print will show data structures in browser console:
            //console.log(viewData);
        },
        //on error
        error : function () {
            console.log('An error occurred');
        }
    });
});
//OK button for Order+Station input
function POandStationUpdate() {
    $("#chartModule").hide();
    var selectedStation = $("#StationSelect option:selected").val();
    if (selectedStation == "paint") {
        selectedStation = "maskAndSpray";
    }
    var selectedPO = $("#POSelect option:selected").val();
    //console.log('POandStationUpdate for ' + selectedStation + ',' + selectedPO);
    try {
        if (selectedPO == 0) {
            //console.log('selected PO=0, PO=' + selectedPO);
            renderGanttStation(viewData, selectedStation)
        } else {
            //console.log('selected PO!=0, PO=' + selectedPO);
            renderGanttPOandStation(viewData, selectedStation, selectedPO);
        }
    } catch (e) {
        alert("No data in DB for those parameters.")
        console.log(e);
    }
    $("#chartModule").show();
}
//OK button for Station only input (see all locomotives passing through station)
function StationUpdate() {
    var selectedStation = $("#StationSelectOnly option:selected").val();
    if (selectedStation == "paint") {
        selectedStation = "maskAndSpray";
    }
    //console.log('StationUpdate for ' + selectedStation);
    try {
        renderGanttStation(viewData, selectedStation);
    } catch (e) {
        alert("No data in DB for those parameters.")
        console.log(e)
    }
}
//Uses the DB data, a dropdown selected order (PO), and dropdown selected station to render a gantt view
function renderGanttPOandStation(incData, selectedStation, selectedPO) {
    console.log('renderGanttPOandStation ' + selectedStation + ',' + selectedPO);
    viewData = incData;
    var locomotives = [];
    var startTimes = [];
    var endTimes = [];
    if (firstTime == 0) {
        tasks = [];
        locomotives = [];
    }
    for (var i = 0; i < viewData.Events.length; i++) {
        if ((viewData.Events[i].PO == selectedPO) && (viewData.Events[i].station == selectedStation) && (viewData.Events[i].completionTime != viewData.Events[i].startTime)) {
            //also get a customer name from the Names Json
            for (var j = 0; j < viewData.Names.length; j++) {
                if (viewData.Names[j].PO == selectedPO) {
                    var custName = viewData.Names[j].customer;
                    //console.log(custName);
                }
            }
            //console.log(viewData.Events[i]);
            locomotives.push(custName + " " + viewData.Events[i].seq);
            endTimes.push(new Date(parseInt(viewData.Events[i].completionTime)));
            startTimes.push(new Date(parseInt(viewData.Events[i].startTime)));
            tasks.push({
                "endDate" : new Date(parseInt(viewData.Events[i].completionTime)),
                "startDate" : new Date(parseInt(viewData.Events[i].startTime)),
                "locomotive" : custName + " " + viewData.Events[i].seq,
                "status" : "BLUE"
            });
        }
    }
    //console.log(locomotives);
    //console.log(startTimes);
    //console.log(endTimes);
    //console.log(tasks);
    //locomotives.sort();
    //now add customer names
    var taskStatus = {
        "BLUE" : "bar-blue",
        "RED" : "bar-red",
        "GREEN" : "bar-green",
        "YELLOW" : "bar-yellow"
    };
    tasks.sort(function (a, b) {
        return a.endDate - b.endDate;
    });
    var maxDate = tasks[tasks.length - 1].endDate;
    tasks.sort(function (a, b) {
        return a.startDate - b.startDate;
    });
    var minDate = tasks[0].startDate;
    /**FORMAT FOR X AXIS DATES CAN BE CHANGED HERE USING d3.time.format
     * SEE https://github.com/mbostock/d3/wiki/Time-Formatting
     **/
    var format = " %a,  %x";
    if (firstTime == 0) { //the view is being redrawn
        //remove current view
        d3.select("svg").remove();
        //draw a new one with new input
        gantt = d3.gantt(tasks).taskTypes(locomotives).taskStatus(taskStatus).tickFormat(format);
        gantt(tasks);
    } else { //the view is being drawn first time
        firstTime = 0;
        gantt = d3.gantt(tasks).taskTypes(locomotives).taskStatus(taskStatus).tickFormat(format);
        gantt(tasks);
    }
}
//Uses the DB data, and a dropdown selected station to render a gantt view of every SEQ to pass through that station
function renderGanttStation(incData, selectedStation) {
    //console.log('renderGanttStation ' + selectedStation);
    viewData = incData;
    var locomotives = [];
    var startTimes = [];
    var endTimes = [];
    if (firstTime == 0) {
        tasks = [];
        locomotives = [];
    }
    for (var i = 0; i < viewData.Events.length; i++) {
        if ((viewData.Events[i].station == selectedStation) && (viewData.Events[i].completionTime != viewData.Events[i].startTime)) {
            //also get a customer name from the Names Json
            for (var j = 0; j < viewData.Names.length; j++) {
                if (viewData.Names[j].PO == viewData.Events[i].PO) {
                    var custName = viewData.Names[j].customer;
                    //console.log(custName);
                }
            }
            locomotives.push(custName + " " + viewData.Events[i].seq);
            endTimes.push(new Date(parseInt(viewData.Events[i].completionTime)));
            startTimes.push(new Date(parseInt(viewData.Events[i].startTime)));
            tasks.push({
                "endDate" : new Date(parseInt(viewData.Events[i].completionTime)),
                "startDate" : new Date(parseInt(viewData.Events[i].startTime)),
                "locomotive" : custName + " " + viewData.Events[i].seq,
                "status" : "YELLOW"
            });
        }
    }
    //locomotives.sort();
    //now add customer names
    var taskStatus = {
        "BLUE" : "bar-blue",
        "RED" : "bar-red",
        "GREEN" : "bar-green",
        "YELLOW" : "bar-yellow"
    };
    tasks.sort(function (a, b) {
        return a.endDate - b.endDate;
    });
    var maxDate = tasks[tasks.length - 1].endDate;
    tasks.sort(function (a, b) {
        return a.startDate - b.startDate;
    });
    var minDate = tasks[0].startDate;
    /**FORMAT FOR X AXIS DATES CAN BE CHANGED HERE using d3.time.format
     * SEE https://github.com/mbostock/d3/wiki/Time-Formatting
     **/
    var format = " %a,  %x";
    if (firstTime == 0) { //the view is being redrawn
        //remove current view
        d3.select("svg").remove();
        //draw a new one with new input
        gantt = d3.gantt(tasks).taskTypes(locomotives).taskStatus(taskStatus).tickFormat(format);
        gantt(tasks);
    } else { //the view is being drawn first time
        firstTime = 0;
        gantt = d3.gantt(tasks).taskTypes(locomotives).taskStatus(taskStatus).tickFormat(format);
        gantt(tasks);
    }
}