$(document).ready(function(){
  //$("#labor-input-table").hide();
  $("#laborLink").addClass("active");
  var week = 1;
  var laborSnapshots=[];
  for(var i=1;i<=52;i++)
  {
    var snap = {
      "PipeRack":{
        "Mech":{
          availability: 85,
          headCount: 8,
          overtimeHours: 0
        },
        Weld:{
          availability: 85,
          headCount: 6,
          overtimeHours: 0
        }
      },
      LAG1:{
        Mech:{
          availability: 85,
          headCount: 4,
          overtimeHours: 0
        },
        Pipe:{
          availability: 85,
          headCount: 3,
          overtimeHours: 0
        },
        Wire:{
          availability: 85,
          headCount: 5,
          overtimeHours: 0
        },
        Weld:{
          availability: 85,
          headCount: 6,
          overtimeHours: 0
        }
      },
      LAG2:{
        Mech:{
          availability: 85,
          headCount: 6,
          overtimeHours: 0
        },
        Pipe:{
          availability: 85,
          headCount: 4,
          overtimeHours: 0
        },
        Wire:{
          availability: 85,
          headCount: 3,
          overtimeHours: 0
        },
        Weld:{
          availability: 85,
          headCount: 6,
          overtimeHours: 0
        }
      },
      LAG4:{
        Mech:{
          availability: 85,
          headCount: 4,
          overtimeHours: 0
        },
        Pipe:{
          availability: 85,
          headCount: 3,
          overtimeHours: 0
        },
        Wire:{
          availability: 85,
          headCount: 5,
          overtimeHours: 0
        },
        Weld:{
          availability: 85,
          headCount: 6,
          overtimeHours: 0
        }
      },
      Paint:{
        Painter:{
          availability: 85,
          headCount: 12,
          overtimeHours: 0
        }
      },
      Test:{
        Green:{
          availability: 85,
          headCount: 4,
          overtimeHours: 0
        },
        TestPersonel:{
          availability: 85,
          headCount: 5,
          overtimeHours: 0
        },
        Inspector:{
          availability: 85,
          headCount: 5,
          overtimeHours: 0
        }
      }
    };
    laborSnapshots[i]=snap;
  }//end populating for loop
  for(var w=1; w<=52; w++){
    Object.keys(laborSnapshots[w]).forEach(function(station) {
      Object.keys(laborSnapshots[w][station]).forEach(function(unit) {
        var avail = laborSnapshots[w][station][unit].availability;
        var head = laborSnapshots[w][station][unit].headCount;
        var over = laborSnapshots[w][station][unit].overtimeHours;
        var totalHrs = head*40+over;
        var workingHrs = (head*40+over)*(avail/100);
        laborSnapshots[w][station][unit].totalHours = totalHrs;
        laborSnapshots[w][station][unit].maxWorkingHours = workingHrs;
      });
    });
  }
  addInputTable();
  recalculateSums();
  addSummaryTable();

  $("#save").click(function()
  {
    saveTable();
  });

  $(".week-select").change(function(){
    var startWeek = parseInt($("#start-week-select").val());
    var endWeek = parseInt($("#end-week-select").val());
    if(endWeek < startWeek){
      console.log("check fail");
      $("#end-week-select").val($("#start-week-select").val());
    }
    $("#labor-input-table").remove();
    week = $("#start-week-select").val();
    addInputTable();
    recalculateSums();
  });

  function addInputTable()
  {
    console.log("redrawing input table");
    var table = $('<table id="labor-input-table" class="table table-striped table-bordered">').appendTo($("#labor-input-form"));
    $('<tr><th colspan="2">Labor Resource Pool</th><th>Availability</th><th>Head Count</th><th>Overtime Hours</th><th>Total Hours</th><th>Max Working Hours</th>').appendTo($(table));
    Object.keys(laborSnapshots[week]).forEach(function(stationKey) {
      var building;
      if(stationKey=="PipeRack"||stationKey=="LAG1"||stationKey=="LAG23"||stationKey=="LAG4") {
        building = 10;
      } else {
        building = 26;
      }
      var unitCount = 0;
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
        unitCount++;
      });
      var stationRow = $('<tr id="'+stationKey+'-row"></tr>').appendTo($(table));
      var stationNameCell = $('<td rowspan="'+unitCount+'">'+stationKey+'</td>').appendTo($(stationRow));
      unitCount = 0;
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey){
        var unitRow;
        if(unitCount==0){
          $('<td>'+unitKey+'</td>').appendTo($(stationRow));
          unitRow = stationRow;
        }
        else{
          unitRow = $('<tr><td>'+unitKey+'</td>').appendTo($(table));
        }

        var avail = laborSnapshots[week][stationKey][unitKey].availability;
        $(unitRow).append('<td><input data-building="'+building+'" data-station="'+stationKey+'" data-unit="'+unitKey+'" data-inputType="availability" id="availability-input-'+stationKey+'-'+unitKey+'" class="labor-input"></td>');
        $("#availability-input-"+stationKey+'-'+unitKey).val(avail);

        var head = laborSnapshots[week][stationKey][unitKey].headCount;
        $(unitRow).append('<td><input data-building="'+building+'" data-station="'+stationKey+'" data-unit="'+unitKey+'" data-inputType="headCount" id="headCount-input-'+stationKey+'-'+unitKey+'" class="labor-input"></td>');
        $("#headCount-input-"+stationKey+'-'+unitKey).val(head);

        var over = laborSnapshots[week][stationKey][unitKey].overtimeHours;
        $(unitRow).append('<td><input data-building="'+building+'" data-station="'+stationKey+'" data-unit="'+unitKey+'" data-inputType="overtimeHours" id="overtimeHours-input-'+stationKey+'-'+unitKey+'" class="labor-input"></td>');
        $("#overtimeHours-input-"+stationKey+'-'+unitKey).val(over);

        var ttlHrs = laborSnapshots[week][stationKey][unitKey].totalHours;
        $(unitRow).append('<td id="total-hours-'+stationKey+'-'+unitKey+'"></td>');
        $("#total-hours-"+stationKey+'-'+unitKey).text(ttlHrs);

        var wkgHrs = laborSnapshots[week][stationKey][unitKey].maxWorkingHours;
        $(unitRow).append('<td id="working-hours-'+stationKey+'-'+unitKey+'"></td>');
        $("#working-hours-"+stationKey+'-'+unitKey).text(wkgHrs);
        unitCount++;

      });
    });

    $('<tr><td colspan="3">Building 10</td><td id="building-10-headcount">-</td><td id="building-10-overtime">-</td><td id="building-10-total-hours">-</td><td id="building-10-total-working-hours">-</td></tr>').appendTo($(table));
    $('<tr><td colspan="3">Building 10 & 26</td><td id="building-10-26-headcount">-</td><td id="building-10-26-overtime">-</td><td id="building-10-26-total-hours">-</td><td id="building-10-26-total-working-hours">-</td></tr>').appendTo($(table));


    $(".labor-input").change(function(){
      recalculateRow($(this));
      recalculateSums();
      addSummaryTable();
    });
  }





  function recalculateRow(input)
  {
    console.log("recalcuating rows");
    var station = input.data("station");
    var unit = input.data("unit");
    var inputType = input.data("inputtype");
    var value = parseFloat($("#"+inputType+'-input-'+station+'-'+unit).val());
    if(value==null || isNaN(value))
    {
      value = 0;
    }
    var endingWeek = parseInt($("#end-week-select").val());
    for(var w=week; w<=endingWeek; w++){
      laborSnapshots[w][station][unit][inputType] = value;
      var avail = laborSnapshots[w][station][unit].availability;
      var head = laborSnapshots[w][station][unit].headCount;
      var over = laborSnapshots[w][station][unit].overtimeHours;
      var totalHrs = head*40+over;
      var workingHrs = (head*40+over)*(avail/100);
      laborSnapshots[w][station][unit].totalHours = totalHrs;
      laborSnapshots[w][station][unit].maxWorkingHours = workingHrs;
    }
  }

  function recalculateSums()
  {
    console.log("recalculating sums");
    var building10availability = 0;
    var building10headcount = 0;
    var building10overtime = 0;
    var building10totalHours = 0;
    var building10totalWorkingHours = 0;
    var building26availability = 0;
    var building26headcount = 0;
    var building26overtime = 0;
    var building26totalHours = 0;
    var building26totalWorkingHours = 0;
    Object.keys(laborSnapshots[week]).forEach(function(stationKey)
    {
      Object.keys(laborSnapshots[week][stationKey]).forEach(function(unitKey)
      {
        var avail = laborSnapshots[week][stationKey][unitKey].availability;
        var head = laborSnapshots[week][stationKey][unitKey].headCount;
        var over = laborSnapshots[week][stationKey][unitKey].overtimeHours;
        var totalHrs = laborSnapshots[week][stationKey][unitKey].totalHours;
        var workingHrs = laborSnapshots[week][stationKey][unitKey].maxWorkingHours;
        $("#total-hours-"+stationKey+"-"+unitKey).text(totalHrs);
        $("#working-hours-"+stationKey+"-"+unitKey).text(workingHrs);
        if($('#availability-input-'+stationKey+'-'+unitKey).data("building")==10)
        {
          building10headcount += head;
          building10overtime += over;
          building10availability += avail;
          building10totalHours += totalHrs;
          building10totalWorkingHours += workingHrs;
        }else if($('#availability-input-'+stationKey+'-'+unitKey).data("building")==26)
        {
          building26headcount += head;
          building26overtime += over;
          building26availability += avail;
          building26totalHours += totalHrs;
          building26totalWorkingHours += workingHrs;
        }
      });
    });
    $('#building-10-headcount').text(building10headcount);
    $('#building-10-overtime').text(building10overtime);
    $('#building-10-total-hours').text(building10totalHours);
    $('#building-10-total-working-hours').text(building10totalWorkingHours);

    $('#building-10-26-headcount').text(building10headcount + building26headcount);
    $('#building-10-26-overtime').text(building10overtime + building26overtime);
    $('#building-10-26-total-hours').text(building10totalHours + building26totalHours);
    $('#building-10-26-total-working-hours').text(building10totalWorkingHours + building26totalWorkingHours);

  }

  function addSummaryTable(){
    console.log("redrawing summary table");
    var table = $("#labor-summary-table");
    table.html(" ");
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
    for(var i=1; i<=52; i++){
      $('<th>wk '+i+'</th>').appendTo("#summary-heading-row");
      Object.keys(laborSnapshots[i]).forEach(function(stationKey) {
        Object.keys(laborSnapshots[i][stationKey]).forEach(function(unitKey){
          var unitRow = $('#summary-'+stationKey+'-'+unitKey+'-row');
          $('<td>'+laborSnapshots[i][stationKey][unitKey].headCount+'</td>').appendTo($(unitRow));
        });
      });
    }
  }


});

