$(document).ready(function () {
    //make the link pretty
    $("#sequenceLink").addClass("active");
    //global vars for holding data
    var data = [];
    var newOrder = [];

    var releaseIndex = [];
    //grab the data from the server on load
    $.ajax("/api/poseq/all", {
        //if success, run this function with the data that is returned
        success: function (d) {
            //store it in global
            data = d;
            //draw the table
            assembleTable();
        },
        //on error
        error: function () {
            console.log('An error occurred');
        }
    });

    //on save button
    $("#save-btn").click(function () {
        //dont do anything if newOrder hasnt been modified
        if (newOrder.length == 0) {
            $("#messageText").text("No changes to save.");
        } else {
            $("#messageText").text("Saving New Sequences to Database");
            //post the newOrder to the server
            $.ajax("/api/poseq/update", {
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(newOrder),
                complete: function (data) {
                    //console.log(data);
                    $("#messageText").text(data.responseJSON.message);
                }
            });
        }
    });


    //as name implies
    function assembleTable() {
        //grab the table element
        var table = $("#POSeq-Table");
        //build the header row
        $(table).html('<thead><tr><th>Release</th><<th>PO</th><th>Seq</th><th>Customer</th><th>P1 Note</th><th>Due Date</th></tr></thead><tbody></tbody>');
        var body = $("#POSeq-Table tbody");
        //for each element in the data array
        var iteratorCount = 0;
        data.forEach(function (row) {

            if (typeof row.P1Note === "undefined") {
                row.P1Note = '';
            }
            //keep track of which releaseSequences we have
            releaseIndex[iteratorCount++] = row.releaseSequence;
            //make a row
            $(body).append('<tr data-rel="' + row.releaseSequence + '" data-po="' + row.PO + '" data-seq="' + row.seq + '" id="po_'
                + row.PO + '-seq_' + row.seq + '"><td>' + row.releaseSequence + '</td><td>' + row.PO + '</td><td>' + row.seq + '</td><td>'
                + row.CustomerUnit + '</td><td>' + row.P1Note + '</td><td>' + row.dueDate + '</td></tr>');
        });

        //this allows the 'sortable to run on table rows
        var fixHelperModified = function (e, tr) {
                var $originals = tr.children();
                var $helper = tr.clone();
                $helper.children().each(function (index) {
                    $(this).width($originals.eq(index).width())
                });
                return $helper;
            },
        //when a drag has occurred
            updateIndex = function (e, ui) {
                //keeping these for future reference
                //console.log("Previous:"+$(ui.item[0]).data("rel"));
                //console.log("New:"+ui.item.context.rowIndex);
                //var prevPos = $(ui.item[0]).data("rel");
                //var newPos = ui.item.context.rowIndex;

                //grab the PO and seq from the tr element
                var po = $(ui.item[0]).data("po");
                var seq = $(ui.item[0]).data("seq");
                //rows is an array of ALL the tr in the table
                var rows = $(e.target).children();
                //reset newOrder array, this is what will be sent to the server
                newOrder = [];
                //for every row in the table
                for (var i = 0; i < rows.length; i++) {
                    //create an object in newOrder
                    newOrder[i] = {
                        //filled with the PO, seq, and the new releaseSequence
                        PO: $(rows[i]).data("po"),
                        seq: $(rows[i]).data("seq"),
                        releaseSeq: releaseIndex[i]
                    };
                    //children[0] of each row is the first td which displays releaseSeq. Update it.
                    $(rows[i].children[0]).text(releaseIndex[i]);
                }
            };

        //attach jqueryUI sortable to table
        $("#POSeq-Table tbody").sortable({
            helper: fixHelperModified,
            stop: updateIndex
        }).disableSelection();
    }
});