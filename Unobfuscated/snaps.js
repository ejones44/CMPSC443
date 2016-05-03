/*When the document is ready, this function runs */
$(document).ready(function(){
  $("#snapLink").addClass("active");
  var tableData;
  var isDrawn = false;
  var startDate;
  var endDate;
  var selectedPO;
  var filterFunction = function(){
    return true;
  };
  $.ajax("/api/snapshots/all", {
    //if success, run this function with the data that is returned
    success: function(data) {
      tableData = data;
    },
    //on error present user with message
    error: function() {
      alert('An error occurred');
    }
  });

  $("#tableRightWrapper").scroll(function(){
    $("#tableLeftWrapper").prop("scrollTop", this.scrollTop);
  });

  $("#tableLeftWrapper").scroll(function(){
    $("#tableRightWrapper").prop("scrollTop", this.scrollTop);
  });

  $(".btn-switch").click(function(){
    $(".btn-switch").removeClass("btn-primary");
    $(".btn-switch").addClass("btn-default");
    $(this).addClass("btn-primary");
  });
  $("#allBtn").click(function(){
    filterFunction = function(){
      return true;
    };
    if(isDrawn){
      renderTableRange2(tableData, startDate, endDate, selectedPO, filterFunction);
    }

  });
  $("#dayBtn").click(function(){
    filterFunction = function(date){
      if(date.getHours() == 15)
        return true;
    };
    if(isDrawn){
      renderTableRange2(tableData, startDate, endDate, selectedPO, filterFunction);
    }

  });
  $("#weekBtn").click(function(){
    filterFunction = function(date){
      if(date.getHours() == 15 && date.getDay() == 1) {
        return true;
      }
    };
    if(isDrawn){
      renderTableRange2(tableData, startDate, endDate, selectedPO, filterFunction);
    }
  });

  //automatically select last option for endDate
  $('#endDate option:last-child').attr('selected', 'selected');
  //onclick handler for go button
  $("#go").click(function(){
    //retrieve selected values from dropdown selects
    startDate = $("#startDate option:selected").val();
    endDate = $("#endDate option:selected").val();
    selectedPO = $("#POSelect option:selected").val();
    renderTableRange2(tableData, startDate, endDate, selectedPO, filterFunction);
    isDrawn = true;
  });

  $("#POSelect").change(function(){
    startDate = $("#startDate option:selected").val();
    endDate = $("#endDate option:selected").val();
    selectedPO = $("#POSelect option:selected").val();
    renderTableRange2(tableData, startDate, endDate, selectedPO, filterFunction);
    isDrawn = true;
  });
});


function renderTableRange2(data, startDate, endDate, PO, filterFunction) {

  //recreate empty table on left with headings
  $("#leftTable").html("<thead class=\"fixedHeader\"<th><th>ExpID</th> <th>PO </th> <th>Seq</th> <th>Customer</th> <th>Completion</th><th>Lateness</th></thead><tbody class=\"scrollContent\"></tbody>");
  //recreate empty table on right
  $("#rightTable").html("<thead class=\"fixedHeader\"><tr id=\"rightheadRow\"></tr></thead><tbody class=\"scrollContent\"></tbody>");
  data.Dates.forEach(function(date){
    var nDate = new Date(parseInt(date));
    if (nDate >= startDate && nDate <= endDate) {
      if (filterFunction(nDate)) {
        $("#rightheadRow").append("<th>" + (nDate.getMonth() + 1) + "/" + nDate.getDate() + "/" + nDate.getFullYear() + "</th>");
      }
    }
  });
  data.Snapshots.forEach(function(snapshot) {
    if (snapshot.PO == PO || PO == 0) {

      var row = $('<tr>').appendTo("#leftTable tbody");
      $(row).append("<td>" + snapshot.expId + "</td>");
      $(row).append("<td>" + snapshot.PO + "</td>");
      $(row).append("<td>" + snapshot.seq + "</td>");
      //$(row).append("<td>" + snapshot.releaseSeq + "</td>");
      $(row).append("<td>" + snapshot.customer + "</td>");
      //$(row).append("<td>" + snapshot.dueDate + "</td>");
      $(row).append("<td>" + snapshot.completionDate + "</td>");
      //$(row).append("<td>" + snapshot.note + "</td>");
      var latenessTD = $("<td>" + snapshot.lateness + "</td>").appendTo(row);
      var latenessAmount = parseInt(snapshot.lateness); //parseInt is just ensuring that this is read as integer
      if (latenessAmount <= 0) {
        $(latenessTD).addClass("onTime");
      } else if (latenessAmount > 0 && latenessAmount < 5) {
        $(latenessTD).addClass("kindaLate");
      } else if (latenessAmount >= 5 && latenessAmount < 10) {
        $(latenessTD).addClass("late");
      } else if (latenessAmount >= 10 && latenessAmount < 20) {
        $(latenessTD).addClass("reallyLate");
      } else {
        $(latenessTD).addClass("superLate");
      }
      //we're done with row, redefine it as the row on the right tables
      row = $('<tr></tr>').appendTo("#rightTable tbody");
      data.Dates.forEach(function (date) {
        nDate = new Date(parseInt(date));
        if (nDate >= startDate && nDate <= endDate) {
          if (filterFunction(nDate))
            $(row).append('<td id="' + snapshot.PO + '-' + snapshot.seq + '-' + date + '"></td>');
        }
      });
      snapshot.progress.forEach(function (prog) {
        if (prog.processStep != null) {
          nDate = new Date(parseInt(prog.snapshotDate));
          if (nDate >= startDate && nDate <= endDate) {

            if (filterFunction(nDate)) {
              var cell = $("#" + snapshot.PO + "-" + snapshot.seq + "-" + prog.snapshotDate);
              $(cell).text(prog.processStep + " " + (prog.remainingWorkPercent.toFixed(0)) + "%");
              switch (prog.processStep) {
                case "TSA":
                  $(cell).addClass("processStep0");
                  break;
                case "trackTest":
                  $(cell).addClass("processStep1");
                  break;
                case "inspection":
                  $(cell).addClass("processStep2");
                  break;
                case "defect":
                  $(cell).addClass("processStep3");
                  break;
                case "InServiceRun":
                  $(cell).addClass("processStep4");
                  break;
                case "CI":
                  $(cell).addClass("processStep5");
                  break;
                case "ship":
                  $(cell).addClass("processStep6");
                  break;
                case "Hipot":
                  $(cell).addClass("processStep7");
                  break;
                case "maskAndSpray":
                  $(cell).addClass("processStep8");
                  break;
                case "maskAndScuff":
                  $(cell).addClass("processStep9");
                  break;
                case "truck":
                  $(cell).addClass("processStep10");
                  break;
                case "TSA":
                  $(cell).addClass("processStep11");
                  break;
                case "BSA":
                  $(cell).addClass("processStep12");
                  break;
                case "rackPipe":
                  $(cell).addClass("processStep13");
                  break;
                case "systemCheck":
                  $(cell).addClass("processStep14");
                  break;
                case "SCFlatCar":
                  $(cell).addClass("processStep15");
                  break;
                case "yardTest":
                  $(cell).addClass("processStep16");
                  break;
                case "DSP":
                  $(cell).addClass("processStep17");
                  break;
                case "systemText":
                  $(cell).addClass("processStep18");
                  break;
                case "loadTest":
                  $(cell).addClass("processStep19");
                  break;
                case "rainWipe":
                  $(cell).addClass("processStep20");
                  break;
                default:
                  $(cell).addClass("noStep");
              }
            }
          }
        }

      });
    }
  });
}