$(document).ready(function () {

  $.ajax("/api/dashcards/all", {
    //if success, run this function with the data that is returned
    success: function (d) {
      //store it in global
      console.log(d);
      drawCards(d);
      //draw the table
    },
    //on error
    error: function () {
      console.log('An error occurred');
    }
  });
  var drawStation = function(data, stationBlock, stationTitle){
    $('<h3 class="station-title">'+stationTitle+'</h3>').appendTo(stationBlock);
    var stationCards = data.cards;
    stationCards.forEach(function(card) {
      var cardDiv = $('<div class="well dash-card">').appendTo(stationBlock);

      var cardRow = $('<div class="row">').appendTo(cardDiv);
      var cardLeft = $('<div class="col-sm-4">').appendTo(cardRow);
      var cardMiddle = $('<div class="col-sm-4">').appendTo(cardRow);
      var cardRight = $('<div class="col-sm-4">').appendTo(cardRow);
      $('<h4 class="card-title">' + card.customer + ' - ' + card.seq + '</h4>').appendTo(cardLeft);
      $('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="' + card.completedWorkPercent + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + card.completedWorkPercent + '%;"> ' + card.completedWorkPercent + '% </div> </div>').appendTo(cardMiddle);


      //badge
      if(card.next)
        var badge = $('<span class="badge">'+card.next+'</span>').appendTo(cardRight);

      var lateLabel = $('<span class="label"></span>').appendTo(cardRight);


      if (card.status == 'late') {

        $(cardDiv).addClass("late");
        $(lateLabel).addClass("label-danger");
        $(lateLabel).text("Late " + card.latenessAmount + " Days");

      } else if (card.status == 'on-time') {

        $(cardDiv).addClass("on-time");
        $(lateLabel).addClass("label-warning");
        $(lateLabel).text("Late " + card.latenessAmount + " Days");

      } else if (card.stats == 'early') {

        $(cardDiv).addClass("early");
        $(lateLabel).addClass("label-success");
        $(lateLabel).text("Late " + card.latenessAmount + " Days");

      }
      //set cards tooltip html --stored in attribute 'title'
      if(stationTitle=="Paint"){
        var tooltiphtml = "<ul style='list-style-type:none; padding:0' >";
        if(card.comment)
          tooltiphtml+="<li>"+card.comment+"</li>";
        if(card.workShift)
          tooltiphtml+="<li>"+card.workShift+"</li>";
        if(card.location)
          tooltiphtml+="<li>"+card.location+"</li>";
        tooltiphtml += "</ul>";
        $(cardDiv).attr("data-toggle","tooltip");
        $(cardDiv).attr("data-placement","bottom");
        $(cardDiv).attr("data-html","true");
        $(cardDiv).attr("title",tooltiphtml);
      }

    });
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

  };
  var drawCards = function(data){
    var stationsLeft = $("#stations-left");
    var stationsMiddle = $("#stations-middle");
    var stationsRight = $('#stations-right');

    var bsaBlock = $('<div class="station-block">').appendTo(stationsLeft);
    drawStation(data.BSA, bsaBlock, "BSA");

    var truckBlock = $('<div class="station-block">').appendTo(stationsLeft);
    drawStation(data.truck, truckBlock, "Truck");

    var tsaBlock = $('<div class="station-block">').appendTo(stationsMiddle);
    drawStation(data.TSA, tsaBlock, "TSA");

    var paintBlock = $('<div class="station-block">').appendTo(stationsRight);
    drawStation(data.paint, paintBlock, "Paint");

    var testBlock = $('<div class="station-block">').appendTo(stationsRight);
    drawStation(data.test, testBlock, "Test");
  };
});