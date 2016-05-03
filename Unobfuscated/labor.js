//On document ready
$(document).ready(function(){
  $("#week-select").slider({});
  $("#summary-week-select").slider({});
  $("#summary-week-select").on("change", function(slideEvt){
    addChart();
    addSummaryTable();
  });
  $("#week-select").on("change", function(changeEvt){
    week = changeEvt.value.newValue[0];
    $("#labor-input-table").remove();
    addInputTable();
    recalculateSums();
  });


  $( "input:radio[name=chartRadios]").change(function(){
    addChart();
  });

  $("#Stage_Dropdown").change(function() {
    addChart();
  });

  //make this page the active link on the navbar
  $("#laborLink").addClass("active");
  //initialize current week to 1, init laborSnapshots
  var week = 1;
  var laborSnapshots;

  //download all laborSnaps from server
  $.ajax("/api/labor/all", {
    //if success, run this function with the data that is returned
    success: function(data) {
      processData(data);
      //create the input table
      addInputTable();
      //recalc sums (this does the totals on the right hand side)
      recalculateSums();
      addChart();
      //create summary table (bottom)
      addSummaryTable();
    },
    //on error
    error: function() {
      console.log('An error occurred');
    }
  });


  //on save button
  $("#save").click(function()
  {

    //set the end week to the selected value
    var endWeek = parseInt($('#week-select').slider('getValue')[1]);

    //create a data structure to send to the server
    var jsonData = {
      //startWeek will be the global 'week' variable, parseInt ensures it is an integer
      startWeek : parseInt(week),
      endWeek : endWeek,
      //snapshot will be this week's array position of laborSnapshots
      snapshot: laborSnapshots[week]
    };

    console.log(jsonData);
    //send it over to the server
    $.ajax({
      url: '/api/labor/update',
      type: 'POST',
      dataType: 'json',
      contentType : 'application/json; charset=utf-8',
      data: JSON.stringify(jsonData),
      //on success of the POST to server, refetch the labor data
      success: function(data){
        $.ajax("/api/labor/all", {
          //if success, run this function with the new data
          success: function(data) {
            $("#labor-input-table").remove();
            processData(data);
            //create the input table
            addInputTable();
            //recalc sums (this does the totals on the right hand side)
            recalculateSums();
            //create summary table (bottom)
            addSummaryTable();
            addChart();
          },
          //on error
          error: function() {
            console.log('An error occurred');
          }
        });
      },
      error: function(){
        alert("An error has occurred");
      }
    });
  });

  //
  function addInputTable()
  {
    //create the table element
    var table = $('<table id="labor-input-table" class="table table-bordered">').appendTo($("#labor-input-form"));

    //create the table headers
    $('<tr class="header-row">' +
        '<th colspan="2">Labor Resource Pool</th>' +
        '<th id="avail-header">Availability</th>' +
        '<th class="shorter">Shift 1</th>' +
        '<th class="shorter">Shift 2</th>' +
        '<th class="shorter">Shift 3</th>' +
        '<th class="shorter">Overtime Weekdays</th>' +
        '<th class="shorter">Overtime Weekends</th>' +
        '<th class="shorter">Total Hours</th>' +
        '<th class="shorter">Max Working Hours</th>')
      .appendTo($(table));

    //For each stationKey in laborSnapshots[week]
    Object.keys(laborSnapshots[week]).forEach(function(stationKey) {
      //determine station building
      var building;
      if(stationKey=="PipeRack"||stationKey=="LAG1"||stationKey=="LAG2+3"||stationKey=="LAG4") {
        building = 10;
      } else {
        building = 26;
      }

      var unitCount = 0;
      //count the units in each station (for station rowspan)
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
        unitCount++;
      });
      //create the row for the station
      var stationRow = $('<tr id="'+stationKey+'-row"></tr>').appendTo($(table));
      //create station cell, note the rowspan, append it to the stationRow
      var stationNameCell = $('<td rowspan="'+unitCount+'">'+stationKey+'</td>').appendTo($(stationRow));
      //reset unitCount
      unitCount = 0;
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
        var unitRow;
        //if we are the first unit in the station, the unit row is the same row as the station
        if(unitCount==0){
          $('<td>'+unitKey+'</td>').appendTo($(stationRow));
          unitRow = stationRow;
        }
        //otherwise create a new row!
        else{
          unitRow = $('<tr><td>'+unitKey+'</td>').appendTo($(table));
        }
        var avail = laborSnapshots[week][stationKey][unitKey].availability;
        $(unitRow)
          .append(
            '<td>' +
              '<div class="input-group">' +
              '<input data-building="' + building +
              '" data-station="' + stationKey +
              '" data-unit="' + unitKey +
              '" data-inputType="availability" id="availability-input-' + stationKey + '-' + unitKey +
              '" class="form-control labor-input">' +
              '<div class="input-group-addon">%</div></div>' +
            '</td>');
        $("#availability-input-"+stationKey+'-'+unitKey).val(avail);

        var headcount_shift1 = laborSnapshots[week][stationKey][unitKey].headcount_shift1;
        $(unitRow)
          .append(
            '<td>' +
            '<input data-building="' + building +
            '" data-station="' + stationKey +
            '" data-unit="' + unitKey +
            '" data-inputType="headcount_shift1" id="headcount_shift1-input-' + stationKey + '-' + unitKey +
            '" class="form-control labor-input">' +
            '</td>');
        $("#headcount_shift1-input-"+stationKey+'-'+unitKey).val(headcount_shift1);

        var headcount_shift2 = laborSnapshots[week][stationKey][unitKey].headcount_shift2;
        $(unitRow)
          .append(
            '<td>' +
            '<input data-building="' + building +
            '" data-station="' + stationKey +
            '" data-unit="' + unitKey +
            '" data-inputType="headcount_shift2" id="headcount_shift2-input-' + stationKey + '-' + unitKey +
            '" class="form-control labor-input">' +
            '</td>');
        $("#headcount_shift2-input-"+stationKey+'-'+unitKey).val(headcount_shift2);

        var headcount_shift3 = laborSnapshots[week][stationKey][unitKey].headcount_shift3;
        $(unitRow)
          .append(
            '<td>' +
            '<input data-building="' + building +
            '" data-station="' + stationKey +
            '" data-unit="' + unitKey +
            '" data-inputType="headcount_shift3" id="headcount_shift3-input-' + stationKey + '-' + unitKey +
            '" class="form-control labor-input">' +
            '</td>');
        $("#headcount_shift3-input-"+stationKey+'-'+unitKey).val(headcount_shift3);

        var over0 = laborSnapshots[week][stationKey][unitKey].overtime_weekday;
        $(unitRow)
          .append(
          '<td>' +
          '<input data-building="' + building +
          '" data-station="' + stationKey +
          '" data-unit="' + unitKey +
          '" data-inputType="overtime_weekday" id="overtime_weekday-input-' + stationKey + '-' + unitKey +
          '" class="form-control labor-input">' +
          '</td>');
        $("#overtime_weekday-input-"+stationKey+'-'+unitKey).val(over0);

        var over1 = laborSnapshots[week][stationKey][unitKey].overtime_weekend;
        $(unitRow)
          .append(
            '<td>' +
            '<input data-building="' + building +
            '" data-station="' + stationKey +
            '" data-unit="' + unitKey +
            '" data-inputType="overtime_weekend" id="overtime_weekend-input-' + stationKey + '-' + unitKey +
            '" class="form-control labor-input">' +
            '</td>');
        $("#overtime_weekend-input-"+stationKey+'-'+unitKey).val(over1);

        var ttlHrs = laborSnapshots[week][stationKey][unitKey].totalHours;
        $(unitRow)
          .append('<td class="labor-output" id="total-hours-'+stationKey+'-'+unitKey+'"></td>');
        $("#total-hours-"+stationKey+'-'+unitKey).text(ttlHrs);

        var wkgHrs = laborSnapshots[week][stationKey][unitKey].maxWorkingHours;
        $(unitRow)
          .append('<td class="labor-output" id="working-hours-'+stationKey+'-'+unitKey+'"></td>');
        $("#working-hours-"+stationKey+'-'+unitKey).text(wkgHrs);
        $(unitRow).addClass("color-row-"+unitKey);

        //incrememnt unit count
        unitCount++;

      });//END FOREACH UNIT IN STATION
      //LAGs get a total
      if(stationKey.substr(0, 3)=="LAG"){
        var totalRow = $('<tr class="color-row-Total" id="'+stationKey+'-total-row"><td colspan="2">TOTAL</td></tr>').appendTo($(table));
        stationNameCell.attr("rowspan", unitCount+1);
        var headcount_shift1Total = 0;
        var headcount_shift2Total = 0;
        var headcount_shift3Total = 0;
        var overTimeWkendTotal = 0;
        var overTimeWkdyTotal = 0;
        var maxWorkingHoursTotal = 0;
        var totalHoursTotal = 0;
        Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
          headcount_shift1Total += laborSnapshots[week][stationKey][unitKey].headcount_shift1;
          headcount_shift2Total += laborSnapshots[week][stationKey][unitKey].headcount_shift2;
          headcount_shift3Total += laborSnapshots[week][stationKey][unitKey].headcount_shift3;

          overTimeWkendTotal += laborSnapshots[week][stationKey][unitKey].overtime_weekend;
          overTimeWkdyTotal += laborSnapshots[week][stationKey][unitKey].overtime_weekday;
          maxWorkingHoursTotal += laborSnapshots[week][stationKey][unitKey].maxWorkingHours;
          totalHoursTotal += laborSnapshots[week][stationKey][unitKey].totalHours;
        });
        $('<td class="labor-output" id="'+stationKey+'-headcount_shift1-total">'+headcount_shift1Total+'</td><td class="labor-output" id="'+stationKey+'-headcount_shift2-total">'+headcount_shift2Total+'</td><td class="labor-output" id="'+stationKey+'-headcount_shift3-total">'+headcount_shift3Total+'</td><td class="labor-output" id="'+stationKey+'-overtime_weekday-total">'+overTimeWkdyTotal+'</td><td class="labor-output" id="'+stationKey+'-overtime_weekend-total">'+overTimeWkendTotal+'</td><td class="labor-output" id="'+stationKey+'-totalHours-total">'+totalHoursTotal+'</td><td class="labor-output" id="'+stationKey+'-maxHours-total">'+maxWorkingHoursTotal+'</td>').appendTo($(totalRow));

      }
    });//END FOREACH STATION
    $('#building-table').remove();
    var buildingTable = $('<table id="building-table" class="table table-bordered">').appendTo($("#labor-input-form"));
    $('<tr class="header-row">' +
        '<th>Location</th>th>' +
        '<th>Headcount</th>th>' +
        '<th>Overtime Weekdays</th>' +
        '<th>Overtime Weekend</th>' +

    '<th>Total Hours</th>'+
        '<th>Max Working Hours</th>'+
      '</tr>')
    .appendTo($(buildingTable));
    $('<tr>' +
        '<td>Building 10</td>' +
        '<td class="labor-output" id="building-10-headcount">-</td>' +
        '<td class="labor-output" id="building-10-overtime_weekday">-</td>' +
        '<td class="labor-output" id="building-10-overtime_weekend">-</td>' +

        '<td class="labor-output" id="building-10-total-hours">-</td>' +
        '<td class="labor-output" id="building-10-total-working-hours">-</td>' +
      '</tr>')
    .appendTo($(buildingTable));

    $('<tr>' +
        '<td>Building 10 & 26</td>' +
        '<td class="labor-output" id="building-10-26-headcount">-</td>' +
        '<td class="labor-output" id="building-10-26-overtime_weekday">-</td>' +
        '<td class="labor-output" id="building-10-26-overtime_weekend">-</td>' +

        '<td class="labor-output" id="building-10-26-total-hours">-</td>' +
        '<td class="labor-output" id="building-10-26-total-working-hours">-</td>' +
      '</tr>')
    .appendTo($(buildingTable));

    //add this event to labor-inputs
    //NOTE: this event attachement MUST occur inside this function
    //      otherwise when the table gets deleted the event will cease
    $(".labor-input").change(function(){
      recalculateRow($(this));
      recalculateSums();
      addSummaryTable();
      addChart();
    });
  }

  function processData(data)
  {
    //set laborSnapshots = data from response
    laborSnapshots = data;
    //the data structure:

    //this loop runs through the data and creates a 'totalHours' and 'maxWorkingHours' in each unit, inside each station, inside each week
    for(var w=1; w<=52; w++){
      Object.keys(laborSnapshots[w]).forEach(function(station) {
        Object.keys(laborSnapshots[w][station]).forEach(function(unit) {
          var avail = laborSnapshots[w][station][unit].availability;
          var head = laborSnapshots[w][station][unit].headcount_shift1 + laborSnapshots[w][station][unit].headcount_shift2 + laborSnapshots[w][station][unit].headcount_shift3;
          var over0 = laborSnapshots[w][station][unit].overtime_weekend;
          var over1 = laborSnapshots[w][station][unit].overtime_weekday;
          var totalHrs = head*40+over0;
          var workingHrs = (head*40+over0)*(avail/100);
          laborSnapshots[w][station][unit].totalHours = totalHrs;
          laborSnapshots[w][station][unit].maxWorkingHours = workingHrs;
        });
      });
    }
  }

  //this function recalculates the sum inside of the laborSnapshots data structure for the given input throughout the selected weeks
  function recalculateRow(input)
  {
    var station = input.data("station");
    var unit = input.data("unit");
    var inputType = input.data("inputtype");
    var value = parseFloat($("#"+inputType+'-input-'+station+'-'+unit).val());
    if(value==null || isNaN(value))
    {
      value = 0;
    }
    var endingWeek = parseInt($('#week-select').slider('getValue')[1]);
    for(var w=week; w<=endingWeek; w++){
      laborSnapshots[w][station][unit][inputType] = value;
      var avail = laborSnapshots[w][station][unit].availability;
      var head = laborSnapshots[w][station][unit].headcount_shift1 + laborSnapshots[w][station][unit].headcount_shift2 + laborSnapshots[w][station][unit].headcount_shift3;
      var over = laborSnapshots[w][station][unit].overtime_weekend;
      var totalHrs = head*40+over;
      var workingHrs = (head*40+over)*(avail/100);
      laborSnapshots[w][station][unit].totalHours = totalHrs;
      laborSnapshots[w][station][unit].maxWorkingHours = workingHrs;
    }
  }
  //
  function recalculateSums()
  {
    var building10availability = 0;
    var building10headcount = 0;
    var building10overtimeWkdys = 0;
    var building10overtimeWkend = 0;

    var building10totalHours = 0;
    var building10totalWorkingHours = 0;
    var building26availability = 0;
    var building26headcount = 0;
    var building26overtimeWkdys = 0;
    var building26overtimeWkend = 0;

    var building26totalHours = 0;
    var building26totalWorkingHours = 0;
    Object.keys(laborSnapshots[week]).forEach(function(stationKey)
    {
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey)
      {
        var avail = laborSnapshots[week][stationKey][unitKey].availability;
        var head = laborSnapshots[week][stationKey][unitKey].headcount_shift1 + laborSnapshots[week][stationKey][unitKey].headcount_shift2 + laborSnapshots[week][stationKey][unitKey].headcount_shift3;
        var over1 = laborSnapshots[week][stationKey][unitKey].overtime_weekend;
        var over0 = laborSnapshots[week][stationKey][unitKey].overtime_weekday;

        var totalHrs = laborSnapshots[week][stationKey][unitKey].totalHours;
        var workingHrs = laborSnapshots[week][stationKey][unitKey].maxWorkingHours;
        $("#total-hours-"+stationKey+"-"+unitKey).text(totalHrs);
        $("#working-hours-"+stationKey+"-"+unitKey).text(workingHrs);
        if($('#availability-input-'+stationKey+'-'+unitKey).data("building")==10)
        {
          building10headcount += head;
          building10overtimeWkdys += over0;
          building10overtimeWkend += over1;
          building10availability += avail;
          building10totalHours += totalHrs;
          building10totalWorkingHours += workingHrs;
        }else if($('#availability-input-'+stationKey+'-'+unitKey).data("building")==26)
        {
          building26headcount += head;
          building26overtimeWkdys += over0;
          building26overtimeWkend += over1;
          building26availability += avail;
          building26totalHours += totalHrs;
          building26totalWorkingHours += workingHrs;
        }
      });
      if(stationKey.substr(0,3)=="LAG"){
        var headcount_shift1Total = 0;
        var headcount_shift2Total = 0;
        var headcount_shift3Total = 0;
        var overTimeWkdysTotal = 0;
        var overTimeWkendTotal = 0;

        var maxWorkingHoursTotal = 0;
        var totalHoursTotal = 0;
        Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
          headcount_shift1Total += laborSnapshots[week][stationKey][unitKey].headcount_shift1;
          headcount_shift2Total += laborSnapshots[week][stationKey][unitKey].headcount_shift2;
          headcount_shift3Total += laborSnapshots[week][stationKey][unitKey].headcount_shift3;
          overTimeWkdysTotal += laborSnapshots[week][stationKey][unitKey].overtime_weekday;
          overTimeWkendTotal += laborSnapshots[week][stationKey][unitKey].overtime_weekend;
          maxWorkingHoursTotal += laborSnapshots[week][stationKey][unitKey].maxWorkingHours;
          totalHoursTotal += laborSnapshots[week][stationKey][unitKey].totalHours;
        });
        $("#"+stationKey+'-headcount_shift1-total').text(headcount_shift1Total);
        $("#"+stationKey+'-headcount_shift2-total').text(headcount_shift2Total);
        $("#"+stationKey+'-headcount_shift3-total').text(headcount_shift3Total);
        $("#"+stationKey+'-overtime_weekday-total').text(overTimeWkdysTotal);
        $("#"+stationKey+'-overtime_weekend-total').text(overTimeWkendTotal);
        $("#"+stationKey+'-totalHours-total').text(totalHoursTotal);
        $("#"+stationKey+'-maxHours-total').text(maxWorkingHoursTotal);
      }
    });
    $('#building-10-headcount').text(building10headcount);
    $('#building-10-overtime_weekday').text(building10overtimeWkdys);
    $('#building-10-overtime_weekend').text(building10overtimeWkend);

    $('#building-10-total-hours').text(building10totalHours);
    $('#building-10-total-working-hours').text(building10totalWorkingHours);

    $('#building-10-26-headcount').text(building10headcount + building26headcount);
    $('#building-10-26-overtime_weekday').text(building10overtimeWkdys + building26overtimeWkdys);
    $('#building-10-26-overtime_weekend').text(building10overtimeWkend + building26overtimeWkend);

    $('#building-10-26-total-hours').text(building10totalHours + building26totalHours);
    $('#building-10-26-total-working-hours').text(building10totalWorkingHours + building26totalWorkingHours);

  }
  function addChart(){
    var selectedStation = $("#Stage_Dropdown option:selected").text();
    var chartData = [];
    if(selectedStation != "Totals"){
      Object.keys(laborSnapshots[1][selectedStation]).forEach(function(unit){
        var unitSeries = {
          name: unit,
          data: []
        };
        chartData.push(unitSeries)
      });
      var totalSeries = {
        name: "Total",
        data: []
      };
      for(var i=1; i<=52; i++){
        var station = laborSnapshots[i][selectedStation];
        var unitCounter = 0;
        var totalHeadcount = 0;
        Object.keys(station).forEach(function(unitKey){
          var unit = laborSnapshots[i][selectedStation][unitKey];
          var head = unit.headcount_shift1+unit.headcount_shift2+unit.headcount_shift3;
          totalHeadcount += head;
          chartData[unitCounter].data.push(head);
          unitCounter++;
        });
        totalSeries.data.push(totalHeadcount);

      }
      chartData.push(totalSeries);
    }else{
      var units = {};
      for(var i=1; i<=52; i++){
        Object.keys(laborSnapshots[i]).forEach(function(stationKey){
          Object.keys(laborSnapshots[i][stationKey]).forEach(function(unitKey){
            var uBlock = laborSnapshots[i][stationKey][unitKey];
            var headCount = uBlock.headcount_shift1 + uBlock.headcount_shift2 + uBlock.headcount_shift3;
            if(!units[unitKey]){
              var dataArray = new Array(53);
              for(var k=0; k<=52; k++){
                dataArray[k] = 0;
              }
              units[unitKey] = { name: unitKey, data: dataArray};
              units[unitKey].data[i] = headCount;
            }else{
              var current = parseInt(units[unitKey].data[i]);
              var next = parseInt(headCount);
              units[unitKey].data[i] =  current + next;
            }
          });
        });
      }
      Object.keys(units).forEach(function(j){
        units[j].data[0] = units[j].data[1];
        chartData.push(units[j]);
      });
    }
    var min = $('#summary-week-select').slider('getValue')[0];
    var max = $('#summary-week-select').slider('getValue')[1];
    var chartType = $( "input:radio[name=chartRadios]:checked" ).val();

    $('#labor-chart-container').highcharts({
      chart: {
        type: chartType
      },
      title: {
        text: 'Labor Resource Pool'
      },
      subtitle: {
        text: 'By Week'
      },
      xAxis: {
        min: min,
        max: max,
        "type": "category"
      },
      yAxis: {
        min: 1,
        title: {
          text: 'Headcount'
        }
      },
      legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        backgroundColor: '#FFFFFF'
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      credits: {
        position: {
          align: 'left',
          verticalAlign: 'bottom',
          x: -100,
          y: -10
        }
      },
      series: chartData
    });

  }


  function addSummaryTable(){
    var table = $("#labor-summary-table");
    table.html(" ");
    var min = $('#summary-week-select').slider('getValue')[0];
    var max = $('#summary-week-select').slider('getValue')[1];
    $('<tr id="summary-heading-row"><th colspan="2">Labor Resource Pool</th>').appendTo($(table));
    Object.keys(laborSnapshots[week]).forEach(function(stationKey) {
      var unitCount = 0;
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
        unitCount++;
      });
      var stationRow = $('<tr></tr>').appendTo($(table));
      var stationNameCell = $('<td rowspan="'+unitCount+'">'+stationKey+'</td>').appendTo($(stationRow));
      unitCount = 0;

      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
        var unitRow;
        if(unitCount==0){
          $('<td>'+unitKey+'</td>').appendTo($(stationRow));
          unitRow = stationRow;
          unitRow.attr("id", 'summary-'+stationKey+'-'+unitKey+'-row');
        }
        else{
          unitRow = $('<tr id="summary-'+stationKey+'-'+unitKey+'-row"><td>'+unitKey+'</td>').appendTo($(table));
        }
        unitCount++;
      });
    });

    //populate data
    for(var i=min; i<=max; i++){
      $('<th>WK '+i+'</th>').appendTo("#summary-heading-row");
      Object.keys(laborSnapshots[i]).forEach(function(stationKey) {
        Object.keys(laborSnapshots[i][stationKey]).forEach(function(unitKey){
          var unitRow = $('#summary-'+stationKey+'-'+unitKey+'-row');
          var headCount = laborSnapshots[i][stationKey][unitKey].headcount_shift1 + laborSnapshots[i][stationKey][unitKey].headcount_shift2 + laborSnapshots[i][stationKey][unitKey].headcount_shift3;
          $('<td class="labor-output">'+headCount+'</td>').appendTo($(unitRow));
        });
      });
    }
  }


});

