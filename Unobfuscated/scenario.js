/**
 * Created by Eddy on 3/28/2016.
 */

$(document).ready(function () {
    $.ajax({
        async: false,
        type: 'GET',
        url: '/api/scenario/all',
        success: function (data) {
            $.ajax({
                async: false,
                type: 'GET',
                url: '/api/scenario/inv',
                success: function (invData) {
                    $.ajax({
                        async: false,
                        type: 'GET',
                        url: '/api/scenario/lateness',
                        success: function (lateData) {
                            //console.log(lateData);
                            drawTable(data, invData, lateData);
                        }
                    });
                }
            });
        }
    });


    function drawTable(data, invData, lateData) {
        var firstTime = 1;
        var scenTable = $('#scenarioTable');
        var headerRow = $('<tr id="header-row"><th>Scenario</th><th>Description</th><th>Last Order Completion Date</th><th>Direct Labor</th><th>Inventory</th><th>Order Lateness</th>').appendTo(scenTable);


        //populate table
        data.forEach(function (scen) {
            var dataRow = $('<tr>').appendTo(scenTable);

            $('<td>' + scen.expID + '</td>').appendTo(dataRow);
            $('<td width="150">' + scen.description + '</td>').appendTo(dataRow);
            $('<td>' + scen.completionDate + '</td>').appendTo(dataRow);
            $('<td>' + Math.floor((scen.laborUtilization / 1) * 100) + '%' + '<p>' + 'Head Count: ' + scen.totalHeadCount + '</p>' + '</td>').appendTo(dataRow);
            $('<td id="invTD" width="380" height="380">' + "Average: " + scen.avgInventory + '<p>' + '</p></td>').appendTo(dataRow);
            $('<td id="lateTD">' + '<p>' +  '</p></td>').appendTo(dataRow);

            addInvChart(scen.expID,scen.avgInventory);
            addLateChart(scen.expID);

        });


        function addInvChart(expID,avgInventory) {
            var dateList = [];
            invData.forEach(function (entry) {
                if (entry.expID == expID) {
                    dateList.push([Date.parse(entry.datetime), entry.inv]);
                    dateList.sort(dateList.datetime);
                }
            });
            $('#invTD').attr('id', "inv" + expID);
            var chart = $('#' + "inv" + expID).highcharts({
                chart: {
                    type: 'line',
                    width: 350,
                    height: 350
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        month: '%e. %b',
                        year: '%b'
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    plotLines: [{
                        color: 'red',
                        value: avgInventory,
                        label: {
                            text: 'Average'
                        },
                        width: '1',
                        zIndex: 2
                    }]
                },
                tooltip: {
                    crosshairs: true,
                    shared: true
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'WIP During Planning Horizon',
                    data: dateList
                }]
            })

        }


        function addLateChart(expID) {

            var uniquePO = {};
            for (var i = 0; i < lateData.length; i++) {
                if (!uniquePO.hasOwnProperty(lateData[i].PO)){
                    uniquePO[lateData[i].PO] = 0;
                }

            }

            //console.log("The id is "+expID+"   "+uniquePO);


            lateData.forEach(function (entry) {

                //console.log(lateData);
                if (entry.expID == expID && uniquePO[entry.PO] != null) {
                    entry.actualDate = Date.parse(entry.actualDate);
                    entry.planDate = Date.parse(entry.planDate);
                    entry.lateness = (days_between(entry.actualDate,entry.planDate));
                    uniquePO[entry.PO] += parseInt(entry.lateness);
                    //console.log("expID: "+entry.expID);
                }


            })

            var chartData = $.map(uniquePO, function(value,index){
                return [value];
            })
            var POlist = $.map(uniquePO, function(value,index){
                return [index];
            })
            //console.log(uniquePO);
            //console.log(chartData);
            $('#lateTD').attr('id', "late" + expID);
            var chart = $('#' + "late" + expID).highcharts({
                chart: {
                    type: 'column',
                    width: 350,
                    height: 350
                },
                title: {
                    text: null
                },
                xAxis: {
                    title: {
                        text: 'Purchase Order'
                    },
                    categories: POlist
                },
                yAxis: {
                    title: {
                        text: 'Days Late'
                    }
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                series: [{
                    name: 'Lateness (days)',
                    data: chartData
                }]
            });


            delete uniquePO;

            function days_between(date1, date2) {
                // The number of milliseconds in one day
                var ONE_DAY = 1000 * 60 * 60 * 24

                // Calculate the difference in milliseconds
                var difference_ms = Math.abs(date1 - date2)

                // Convert back to days and return
                return Math.round(difference_ms/ONE_DAY)
            }

            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
        }
    }
});

