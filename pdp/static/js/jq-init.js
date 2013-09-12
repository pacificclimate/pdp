$(document).ready(function() {
	
	$(function(){
        // date range pickers
        $('.datepicker').datepicker({
            inline: true,
            dateFormat: 'yy/mm/dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '1870:cc'
        });
        $('.datepickerstart').datepicker({
            inline: true,
            dateFormat: 'yy/mm/dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '1870:cc',
	    defaultDate: '1870/01/01'
        });
        $('.datepickerend').datepicker({
            inline: true,
            dateFormat: 'yy/mm/dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '1870:cc',
	    defaultDate: 'cc'
        });
        
        // network legend dialog
        $('#network-link, #legend').click(function(){
            $('#network-defs').dialog('open');
            return false;
        });

       $('#network-defs').dialog({
            autoOpen: false,
            title: 'Network Legend',
            width: 450,
            height: 450,
            buttons: {
                "Close": function() {
                    $(this).dialog("close");
                }
            }
        });
       
      // variables dialog
      $('#variables-link').click(function(){
          $('#variables-defs').dialog('open');
          return false;
      });

      $('#variables-defs').dialog({
           autoOpen: false,
           title: 'Climate Variables',
           width: 450,
           height: 450,
           buttons: {
               "Close": function() {
                   $(this).dialog("close");
               }
           }
       });
      
      // frequency dialog
      $('#frequency-link').click(function(){
          $('#frequency-defs').dialog('open');
          return false;
      });

      $('#frequency-defs').dialog({
          autoOpen: false,
          title: 'Observation Frequencies',
          width: 400,
          height: 300,
          buttons: {
              "Close": function() {
                  $(this).dialog("close");
              }
          }
      });
       
       // metadata dialog 
       $('#metadata').click(function(){
           $('#nodelist').dialog('open');
           return false;
       });
       
       $('#nodelist').dialog({
    	   autoOpen: false,
    	   title: 'Station Metadata',
    	   width: 800,
    	   height: 450,
    	   buttons: {
    		   "Close": function() {
    			   $(this).dialog("close");
    		   }
    	   }
       })
       
       // format dialog
       $('#format-link').click(function(){
           $('#format-defs').dialog('open');
           return false;
       });
       
       $('#format-defs').dialog({
    	   autoOpen: false,
    	   title: 'Data Output Formats',
    	   width: 300,
    	   height: 300,
    	   buttons: {
    		   "Close": function() {
    			   $(this).dialog("close");
    		   }
    	   }
       })
       
       // form reset
       $("#filter-reset").click(
    		function(){
    		    this.form.reset();
    		});
    	
    });

});