function disableGrid(){
    $('.toolbar button,.toolbar input').prop('disabled',true);
    $('.modal-backdrop').show().addClass('in');
    $('h3.week-date-title').hide();
    $('.table-wrapper-loading').show();
}

function enableGrid(){
    $('.toolbar button,.toolbar input').prop('disabled',false);
    $('.modal-backdrop').hide().removeClass('in');
    // $('.modal-backdrop').transition({ opacity: 0 }, function () { $(this).hide(); });
    $('.table-wrapper-loading').hide();
    $('h3.week-date-title').show();
}

$(function(){

    $('#test').select2();
    var curDisplayDate = moment(g_bs_curDate).utc();
    enableGrid();

    $('#grid-prev-btn').on('click',function(){
        var cur_date = $('#grid-effective-date').data('datepicker').date;
        cur_date = new Date(Date.UTC(
            cur_date.getFullYear(),cur_date.getMonth(),cur_date.getDate()
        ));
        $('#grid-effective-date')
            .datepicker('setValue',moment(cur_date).utc().subtract('days',7).format('D/M/YYYY'))
            .datepicker('update').trigger('changeDate');

    });

    $('#grid-next-btn').on('click',function(){
        var cur_date = $('#grid-effective-date').data('datepicker').date;
        cur_date = new Date(Date.UTC(
            cur_date.getFullYear(),cur_date.getMonth(),cur_date.getDate()
        ));
        $('#grid-effective-date')
            .datepicker('setValue',moment(cur_date).utc().add('days',7).format('D/M/YYYY'))
            .datepicker('update').trigger('changeDate');
    });
    
    $('#grid-today-btn').on('click',function(){
        $('#grid-effective-date')
            .datepicker('setValue',moment().format('D/M/YYYY'))
            .datepicker('update').trigger('changeDate');
    });

    $('#grid-effective-date').datepicker({
        daysOfWeekDisabled: "0,1,2,6",
        'format': 'd/m/yyyy'
    }).datepicker(
        'setValue',
        curDisplayDate.format('D/M/YYYY')
    );
    
    $('#grid-effective-date').on('changeDate',function(ev){

        disableGrid();
        $(this).datepicker('hide');

        var curDisplayDate = $(this).data('datepicker').date;
        var xhr = $.getJSON( 'json_data_handler?year='+curDisplayDate.getFullYear()+'&month='+(curDisplayDate.getMonth()+1)+'&day='+curDisplayDate.getDate() + '&centre='+centre_id, function(data){
            var _cooked = false;
            var more_week = (data.cur_date*1000)-g_bs_curDate>(1000*60*60*24*7);
            
            if(window.buttsex&&!more_week){
                $("#buttsex").removeClass('active');
                window.buttsex = undefined;
                disableGrid();

                if(data.shifts.length){
                    var old = new Shifts(data.shifts);
                    _.each(old.models, function(shift,i){
                        shift.destroy();
                    });
                
                }
                
                _cooked = [];
                _.each(window.shifts.models,function(e,i){

                    var day;
                    if(window.g_bs_curDate < (data.cur_date*1000) ){
                        day = moment(e.get('day'),"YYYY-MM-DD")
                                .add(7, 'days')
                                .format("YYYY-MM-DD");
                        console.log("next");
                    }else{
                        day = moment(e.get('day'),"YYYY-MM-DD")
                                .add(-7, 'days')
                                .format("YYYY-MM-DD");
                        console.log("back");
                    }
                    
                    var obj=e.toJSON();
                        delete obj.id;
                        obj.day = day;
                    _cooked.push(obj);
                
                });
            }
            

            window.shifts=new Shifts(_cooked || data.shifts);
            if(_cooked){_.each(shifts.models, function(shift,i){
                shift.save();
            });}

            window.g_bs_curDate=data.cur_date*1000;
            startRenderer();
            enableGrid();

        }).fail(function(){
            enableGrid();
        });
    });

});