
$(document).ready(function () {

    $('#businessPlanLink').addClass("active");
    var updateData = { data: []};

    $('#saveBusinessPlanBtn').click(function(){
      //console.log(updateData.data);
        $.ajax("/api/businessplan/update", {
          //if success, run this function with the data that is returned
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(updateData),
          //success is never triggered?
          //TODO: make this message ONLY on success
          complete: function (d) {
            $('#serverResponse').text(d.responseJSON.message);
              location.reload();

          }
        });
    });


    $.ajax("/api/businessplan/all", {
        //if success, run this function with the data that is returned
        success: function (data) {
            //console.log(data);
            drawTable(data);
        },
        //on error
        error: function () {
            console.log('An error occurred');
        }
    });

    function drawTable(data) {
        var tableLeft = $('#businessPlanTableLeft');
        var leftHeaderRow = $('<tr id="plan-header-row"><th>PO</th><th>Customer</th><th>Total_QTY</th><th>LastShipDate</th><th>Model</th><th>Truck</th><th>Intl.</th><th>seqStart</th><th>seqEnd</th><th>Note</th></tr>').appendTo(tableLeft);
        var tableRight = $('#businessPlanTableRight');
        var rightHeaderRow = $('<tr id="plan-header-row"></tr>').appendTo(tableRight);
        //populate the scrolling weekStartTime's in rightside scrolling header
        data[0].quantities.forEach(function (q) {
            $('<th>' + q.weekStartTime + '</th>').appendTo(rightHeaderRow);
        });
        data.forEach(function (POBP) {
            convertBooleans();
            var leftRow = $('<tr>').appendTo(tableLeft);
            var titleTd = $('<td>' + POBP.PO + '</td>').appendTo(leftRow);
            var totalQuantity = 0;



            //populate the quantities from DB and count them for totalQTY column
            var rightRow = $('<tr>').appendTo(tableRight);
            POBP.quantities.forEach(function (qty) {
                $('<td><input class="bpq-input" data-po="' + POBP.PO + '" data-week="' + qty.weekStartTime + '" id="qty-input-' + POBP.PO + '-' + qty.weekStartTime + '" value="' + qty.qty + '" /></td>').appendTo(rightRow);
                totalQuantity += qty.qty;
            })

            //populate left side table
            $('<td>' + POBP.customer + '</td>').appendTo(leftRow);
            $('<td>' + totalQuantity + '</td>').appendTo(leftRow);
            $('<td>' + POBP.lastShipDate + '</td>').appendTo(leftRow);
            $('<td>' + POBP.model + '</td>').appendTo(leftRow);
            $('<td>' + POBP.hasTruck + '</td>').appendTo(leftRow);
            $('<td>' + POBP.isInternational + '</td>').appendTo(leftRow);
            $('<td>' + POBP.seqStart + '</td>').appendTo(leftRow);
            $('<td>' + POBP.seqEnd + '</td>').appendTo(leftRow);
            $('<td>' + POBP.note + '</td>').appendTo(leftRow);


            //convert booleans to text
            function convertBooleans() {
                if (POBP.isInternational == '0') {
                    POBP.isInternational = 'False';
                }
                if (POBP.isInternational == '1') {
                    POBP.isInternational = 'True';
                }
                if (POBP.hasTruck == '0') {
                    POBP.hasTruck = 'False';
                }
                if (POBP.hasTruck == '1') {
                    POBP.hasTruck = 'True';
                }
            }
        });

        //add some pretty colors for the boolean fields
        $("#businessPlanTableLeft td:contains('False')").css("background-color", "rgba(204, 0, 0, 0.29)");
        $("#businessPlanTableLeft td:contains('True')").css("background-color", "rgba(57, 209, 31, 0.42)");

        $('.bpq-input').on('input',function(){
          var po = $(this).data("po");
          var week = $(this).data("week");
          var qty = parseInt($(this).val());
          if(qty<0 || isNaN(qty)){
            $(this).val(0);
            qty = 0;
          }else{
            $(this).val(qty);
          }
          var added = false;
          updateData.data.forEach(function(d){
            if(d.PO == po && d.week == week){
              var index = updateData.data.indexOf(d);
              updateData.data[index]={PO: po, week: week, qty:qty};
              added = true;
            }
          });
          if(!added){
            updateData.data.push({PO: po, week: week, qty:qty});
          }
        });
    }



});

