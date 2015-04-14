//------------------------------------------------

var CsvExportView = Backbone.View.extend({
    tagName:"div",
    el:'#export-wrapper',
    template:$('#centre-filter-export'),
    render:function(){
        var template = _.template(this.template.html(),{centres:window.centres});
        this.$el.html(template);
        var that = this;
        var retArray = [];
        retArray.push({id:'0',text:'All'});
        centres.each(function(centre){
            retArray.push({id:centre.get('id'),text:centre.get('name')});
        });
        $('.select-centre-export').val(centre_id).select2({placeholder:"Select Centre",multiple:true,data:retArray
        });
        var curDisplayDate = moment(g_bs_curDate).utc();
        $('.export-effective-date').datepicker({
            daysOfWeekDisabled: "0,1,2,6",
            'format': 'd/m/yyyy'
        }).datepicker('setValue',curDisplayDate.format('D/M/YYYY'));
    }
});

