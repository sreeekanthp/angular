
var isMouseOver = false;

var ShiftTableView = Backbone.View.extend({
    initialize : function (options) {
        this.options = options || {};
    },
    events:{
        'click td.empty.clickable':'newPre',
        'click td.empty.clickable .create-shift':'newShift',
        'click td.empty.clickable .create-category':'newCategory',
        'dblclick td.empty.clickable':'newShift',
        'click td.shift.clickable':'selectShift',
        'dblclick td.shift.clickable .change-centre':'changeCentre',
        'click td.category.clickable':'selectShift',
        'dblclick td.shift.clickable div.content':'editShift',
        //'dblclick td.shift.clickable div._content':'editRoster',
        'dblclick td.category.clickable div.content':'editCategory',
        'keydown table': 'keyTable',
        'click .tfoot-add-staff.clickable':'allocateStaff',
        'click td.staff':'selectRow',
        'click th.thead-label-date.clickable':'selectColumn',
        'click td.staff a.staff_link':'editStaff',
        //'click td.staff .rank-icon':'sortStaff',
        'dblclick td.staff .rank-icon':'theSame',
        'click td.staff .rank-icon':'showRow',
        'selectstart table td.clickable':function(){return false;},
        /*'mousedown table td.clickable':function(ev){isMouseOver=true;e.stopPropagation();return false;},*/
        /*'mouseover table td.clickable':function(ev){if(isMouseOver){ $(ev.target).closest('td').addClass('selected')}},
         'mouseup table td.clickable':function(ev){isMouseOver=false;return false;},*/
        /*'copy table':function(ev){ var $targetElement = $(ev.target).closest('td'); var shift_id = $targetElement.data('id'); g_copy = shift_id; alert(g_copy);},
         paste td.empty':function(ev){ alert(g_copy);}*/
    },

    sortStaff:function(ev){
        ev.stopPropagation();
        

    },

    showRow:function(ev){
        ev.stopPropagation();
        $("tr.tbody-content").removeClass('hidden');
        $('td img').removeClass('btn-success')
    },

    theSame:function(ev){
        ev.stopPropagation();
        var $e = $(ev.target).closest('img');
        var index = $e.data('index');
        var same = $(index).closest('tr');

        var other = $("tr.tbody-content").not(same);
        other.addClass('hidden'); 
        $(index).addClass('btn-success')
        //console.log(same);
    },

    copyCol:function(){
        var selection = $('td.selected');
        var col = [];
        _.each(selection, function(e,i){
                var shift_id = !$(e).hasClass('empty') && $(e).attr('data-id') || undefined;
                col.push(shifts.where({id:shift_id}));
        });
        localStorage["buffer.column"] = JSON.stringify(col);
    },

    copyRow:function(ev){
        var $e = $(ev.target).closest('td');
        var selection = $e.parent()
            .find("td").not('td.staff');
        var row = [];
        _.each(selection, function(e,i){
            if(i!=selection.length-1){
                var shift_id = !$(e).hasClass('empty') && $(e).attr('data-id') || undefined;
                row.push(shift_id);

        }});
        localStorage["buffer.row"] = JSON.stringify(row);
        
    },

    pasteCol:function(){

        var that = this;
        if(localStorage["buffer.column"]){
        var column = $.parseJSON( localStorage["buffer.column"] );
            var selection = $('td.selected');
            _.each(selection, function(e,i){
                if($(e).hasClass('empty') ){try{

                        that.pasteShift(null, column[i], $(e) );
                        $(".selected").removeClass('selected');
                }catch(e){console.log('There is not any value for this index.');};
            }});

        }
    },

    pasteRow:function(ev){
        var that = this;

        if(localStorage["buffer.row"]){
            var row = $.parseJSON( localStorage["buffer.row"] );
            var $e = $(ev.target).closest('td');
            var selection = $e.parent()
                .find("td").not('td.staff');

            _.each(selection, function(e,i){
                if($(e).hasClass('empty') ){try{

                    that.pasteShift(null, row[i], $(e) );
                    $(".selected").removeClass('selected');

                }catch(e){console.log('There is not any value for this index.');};
            }});

        }
    },


    pasteShift:function(ev, shift, elem){
        var $targetElement = elem && $(elem) || $(ev.target).closest('td');

        if(!shift){ 
            shift = new Shift( $.parseJSON(localStorage["buffer.shift"]) );
        }else{
            shift = new Shift(shift);
        }
        
        if(shift){

            $targetElement.css('background',shift.get("colour") || '');
            window._cur_center = window.centres.where({id:shift.get('location')});
            
            

            var type = Number(shift.get('type_id'));

            if( type && type != 1 ){
                
                this.newCategoryChangeEvent({val:shift.get('type_id')},$targetElement);
            
            }else{
              var centre = $("td.shift[data-id="+shift.get('id')+"]")
                    .find('.change-centre')
                    .text()
                    .trim()

              window._cur_center = window.centres.where({name:centre});
              if(window._cur_center.length){
                var cid = window._cur_center[0].get('id');
              }else{
                var cid = '1';
              }
              
              this.newShift(ev, undefined, shift.get('location') || cid,{
                staff_id:$targetElement.parent().data('id'),
                day:$targetElement.attr("data-date"),
                start_time:shift.get("start_time"),
                _start_time:shift.get("_start_time") ,
                end_time: shift.get("end_time"),
                _end_time: shift.get("_end_time"),
                type_id: shift.get("type_id"),
                centre_id: shift.get("location"),
                colour:shift.get("colour") || '' 
              },$targetElement );

            }

        }
    },


    newIcon:function(ev){
        ev.stopPropagation();
        var $targetElement = $(ev.target).closest('td');
        var staff_id = $targetElement.parent().data('id');
        
        var staff = staffs.get(staff_id);
        
        if(!staff){
            return;
        }

        var view = new IconManagerView(staff);

        var modal = new Backbone.BootstrapModal({
            content: view,
            title: "<strong> Badges of " + staff.get('name') +"</strong>",
            okCloses: true,
            cancelText:'Close',
            okText:"Done",
            animate: true
        });

        view.modal = modal;
        get_badges(function(){
          modal.open();  
        }, '/timesheets/badges/'+staff.get('id'))
        
        
    },

    newStaff:function(ev){
        ev.stopPropagation();
        var view = new StaffCreateView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'New Staff',
            okCloses: false,
            okText: 'Create',
            cancelText:'Close',
            animate: true
        });
        view.modal = modal;
        modal.open(function(){
            var form = $(this.$el).find('form');
            form.trigger("submit");
        });
    },
    editStaff:function(ev){
        ev.stopPropagation();
        var view = new StaffEditView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Edit Staff',
            okCloses: false,
            okText: 'Update',
            cancelText:'Close',
            animate: true
        });
        view.staff_id = $(ev.target).closest('tr').data('id');
        view.modal = modal;
        modal.open(function(){
            var form = $(this.$el).find('form');
            form.trigger("submit");
        });
    },
    deleteStaff:function(ev){
        ev.stopPropagation();
        var view = new StaffDeleteView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Delete Staff',
            okCloses: false,
            okText: 'Delete',
            cancelText:'Close',
            animate: true
        });
        view.staff_id = $(ev.target).closest('tr').data('id');
        view.modal = modal;
        modal.open();
    },
    keyTable:function(ev)
    {
        
        

        if(ev.keyCode == 46 && (!$(ev.target).is('input')) && (ev.preConfirmed || confirm('Are you sure, you want delete the selected shift(s)?')))
        {
            $('td.empty.selected').html('').removeClass('selected');
            $('td.shift.selected, td.category.selected').each(function(shiftElem){
                var $targetElement = $(this);
                var id =$targetElement.attr('data-id');
                var backHTML = $targetElement.html();
                if(id > 0 && (!$(this).is('input')))
                {
                    var shift = shifts.where({id:id});
                    if(shift.length > 0)
                    {
                        $targetElement.html('').removeClass('clickable').removeClass('selected');
                        $targetElement.html(_.template($('#template_loading').html()));
                        shift = shift[0];
                        shift.destroy({
                            wait:true,
                            success:function(model, response, options){
                                $targetElement.removeClass('selected').attr('style','').removeAttr('data-type-id').removeAttr('data-location').removeAttr('data-id').removeClass('shift').removeClass('category').html('').addClass('empty').addClass('clickable');
                                $targetElement.prop('style','');
                                //$targetElement.removeAttr('style');
                                //asdasdasd;
                            },
                            error:function(model, response, options){
                                $targetElement.html(backHTML).removeClass('selected').addClass('error').addClass('clickable');
                            },
                        });
                    }
                }
            });
        }
    },
    selectRow:function(ev){
        var $targetElement = $(ev.target).closest('td');
        var $targetElementParent = $targetElement.parent();
        var $targetElementContent = $targetElement.find('.content');
        var staff_id = $targetElement.parent().data('id');
        this.deselect(this);
        $targetElementParent.find('td.empty.clickable, td.shift.clickable, td.category.clickable').addClass('selected');

    },
    selectColumn:function(ev){
        var $targetElement = $(ev.target).closest('th');
        var $targetElementParent = $targetElement.parent();
        var $tartgetIndex = $targetElementParent.children('th').index($targetElement) + 1;
        this.deselect(this);
        $('table tr.tbody-content').find('td.clickable:nth-child(' + $tartgetIndex + ')').addClass('selected');

        /*$targetElementParent.find('td.empty.clickable, td.shift.clickable, td.category.clickable').addClass('selected');*/
    },
    newCategoryChangeEvent:function(ev,$targetElement){
        
        var $targetElementContent = $targetElement.find('.content');
        var staff_id = $targetElement.parent().data('id');
        var curDate = $targetElement.data('date');
        if(ev.val !== '')
        {
            var cat = categories.findWhere({id:ev.val});
            var shift = new Shift({staff_id:staff_id,day:curDate,type_id: ev.val,centre_id:window.centre_id,paid:'1'});
            $targetElement.removeClass('clickable');
            $targetElement.removeClass('selected');
            $targetElement.addClass('loading');
            $targetElementContent.html(_.template($('#template_loading').html()));
            shifts.create(shift
                ,{wait:true
                    ,success:function(model, response, options){
                        if(Number(model.get('id') > 0)) {
                            $targetElement.css({'background':'#'+cat.get('color')}).removeClass('loading').removeClass('empty').addClass('category').addClass('clickable').css('background','#'+model.get('color')).attr('data-id',model.get('id')).attr('data-type-id',model.get('type_id')).html( _.template($('#template_category').html(),{paid:model.get('paymenttype'),category:categories.findWhere({id:model.get('type_id')})}));
                        }
                    }
                    ,error:function(model, response, options){
                        $targetElement.addClass('error').addClass('clickable').removeClass('loading');
                        $targetElementContent.html('Error. Please retry.');
                    }
                });
        }
        else
        {
            $targetElementContent.remove();
        }
    },
    editCategoryChangeEvent:function(ev,$targetElement){

        var $targetElementContent = $targetElement.find('.content');
        var shift_id = $targetElement.attr('data-id');
        var type_id = $targetElement.attr('data-type-id');
        var backHTML = $targetElement.find('.content').html();
        if(ev.val !== '')
        {
            var shift = shifts.where({id:shift_id});
            if(shift.length >0)
            {
                shift = shift[0]
                $targetElement.removeClass('clickable');
                $targetElement.removeClass('selected');
                $targetElement.addClass('loading');
                $targetElementContent.html(_.template($('#template_loading').html()));
                shift.save({type_id:ev.val}
                    ,{wait:true
                        ,success:function(model, response, options){
                            var category = categories.findWhere({id:model.get('type_id')});
                            $targetElement.css({'background':'#'+category.get('color')}).attr('data-type-id',model.get('type_id')).addClass('clickable').html( _.template($('#template_category').html(),{category:category,paid:model.get('paymenttype')}));
                        }
                        ,error:function(model, response, options){
                            $targetElement.addClass('error').addClass('clickable').removeClass('loading');
                            $targetElementContent.html('Error. Please retry.');
                        }
                    });
            }
        }
        else
        {
            $targetElement.addClass('selected').addClass('clickable');
            e = $.Event('keydown');
            e.keyCode = 46;
            $targetElement.trigger(e);
            //$targetElement.removeAttr('data-type-id').removeAttr('data-id').addClass('clickable').addClass('empty');
        }

    },

    newCategory:function(ev){
        var $targetElement = $(ev.target).closest('td');
        var $targetElementContent = $targetElement.find('.content');
        var staff_id = $targetElement.parent().data('id');
        var curDate = $targetElement.data('date');
        var that = this;
        //$targetElementContent.html('<select style="width: 90%; margin-right: 20px;" class="select-category"><option></option><option>Roster Dayasdasdasdadsasdasdas</option><option>Personal Leaveasdasdasdsa</option></select><button class="btn btn-xs ok" style="background:none;padding-left: 3px;padding-right: 1px;"><span class="glyphicon glyphicon-ok"></span><button class="btn btn-xs cancel" style="background:none;padding-left: 3px;padding-right: 1px;"><span class="glyphicon glyphicon-remove"></span></button>');
        $targetElementContent.html(_.template($('#template_category_select').html(),{categories:window.categories}));
        $targetElement.find('.select-category').select2({placeholder:"Select Category",allowClear:true}).on('change',function(ev){
            that.newCategoryChangeEvent(ev,$targetElement);
        });
        /*$('<div>ada</div>').appendTo($targetElement.find('.select2-arrow'));*/
    },
    newPre:function(ev){
        if($(ev.target).is('td'))
        {

            var $targetElement = $(ev.target).closest('td');
            this.deselect(this);
            // $targetElement.removeClass('error').addClass('selected').html('<div class="content">Add <button class="btn btn-xs btn-default create-shift" style="padding-top:0px;padding-bottom: 0px;height: 18px;">Shift</button> | <button class="btn btn-xs btn-default create-category" style="padding-top:0px;padding-bottom: 0px;height: 18px;">Category</button></div>');
            $targetElement.removeClass('error').addClass('selected').html('<div class="content">Add <a class="create-shift" style="padding-top:0px;padding-bottom: 0px;height: 18px;">Shift</a> | <a class="create-category" style="padding-top:0px;padding-bottom: 0px;height: 18px;">Category</a></div>');


        }
    },

    changeCentre:function(ev){
        
        var $targetElement = $(ev.target).closest('td');
        var $currentLocation = $targetElement.find('#location');
        var $trigger = $targetElement.find('.change-centre');
        
        var shift_id = $targetElement.attr('data-id');


        $trigger.hide();
        function show(){
            $trigger.show();
            $('.select2-drop').remove();
            $('.select2-drop-mask').remove();
            $('.select2-container').remove();
        }
        $('.select2-drop').off('mouseleave');
        $('.select2-drop').on('mouseleave', function(){
            show();
        });
        


        var retArray = [];
        centres.each(function(centre){
            retArray.push({id:centre.get('id'),text:centre.get('name')});
        });


        $currentLocation.select2({
            placeholder:"Select Centre",
            data:retArray
        })
        .on('change', function(ev){
            var shift = shifts.where({id:shift_id});
            window._cur_center = window.centres.where({id:ev.val});
            shift[0].save({location:ev.val},
            {wait:true,
                success:function(model, response, options){
                    
                    if(Number(model.get('id') > 0)) {
                        $targetElement
                        .addClass('shift')
                        .addClass('clickable')
                        .attr('data-id',model.get('id'))
                        .attr('data-location',model.get('location'))
                        .html( _.template($('#template_shift').html(),{shift:model} ));
                    }
                },
                error:function(model, response, options){
                    $targetElement
                    .removeClass('selected')
                    .addClass('error')
                    .addClass('clickable');
                },
            });

        });

        

    },

    selShift: function(ev){
        var $targetElement = $(ev.target).closest('td');
        var that = this;
        this.deselect(this);
        var $targetElementContent = $targetElement.find('.content').first();

        $targetElement.removeClass('error');
        $targetElement.addClass('selected');
        $targetElement.html(_.template($('#template_centre_select').html(),{centres:window.centres}));
        
        //$targetElementContent.find('select').val(type_id);
        
        

        $targetElement.find('.select-centre').select2({placeholder:"Select Category",allowClear:true}).on('change',function(ev){
            val = $targetElement.find('select').val();
            window._cur_center = window.centres.where({id:val});
            that.newShift(ev, undefined, val);

        });
    },

    newShift:function(ev,recur,current_centre, extra, elem){

        if(!extra){
            extra = {};
        }
        

        if(!Number(window.centre_id) && !Number(current_centre)){
                this.selShift(ev);
                return;
        }
        
        current_centre = current_centre || window.centre_id;

        var $targetElement = elem && $(elem) || $(ev.target).closest('td');
        var $targetElementContent = $targetElement.find('.content');
        var staff_id = $targetElement.parent().data('id');
        var curDate = $targetElement.data('date');
        console.log(staff_id);
        if(staff_id > 0 && curDate !== undefined)
        {
            var start_time = g_start_time;
            var end_time = g_end_time;

            if(shift_drag_start_time != null)
            {
                start_time = shift_drag_start_time;
                end_time = shift_drag_stop_time;
            }
            
            

            if(recur == undefined)
            {
                var shift = new Shift({
                    staff_id:extra.staff_id || staff_id,
                    day:extra.day || curDate,
                    start_time:extra.start_time || start_time,
                    _start_time:extra._start_time || start_time,
                    end_time: extra.end_time || end_time,
                    _end_time: extra._end_time || end_time,
                    type_id: extra.type_id || 1,
                    centre_id: extra.centre_id || current_centre,
                    colour:extra.colour || ''
                });
            }
            else
            {
                var shift = new Shift({
                    staff_id:extra.staff_id || staff_id,
                    day:extra.day || curDate,
                    start_time:extra.start_time || start_time,
                    _start_time:extra._start_time || start_time,
                    end_time: extra.end_time || end_time,
                    _end_time: extra._end_time || end_time,
                    type_id: extra.type_id || 1,
                    centre_id: extra.centre_id || current_centre,
                    colour:extra.colour || ''
                });
            }

            shift_drag_start_time = null;
            shift_drag_stop_time = null;
            $targetElement.removeClass('clickable');
            $targetElement.removeClass('selected');
            $targetElement.addClass('loading');
            $targetElementContent.html(_.template($('#template_loading').html()));
            shifts.create(shift
                ,{wait:true
                    ,success:function(model, response, options){
                        if(Number(model.get('id') > 0)) {
                            console.log(model);
                            var location = model.get('location');
                            $targetElement.removeClass('loading')
                                .removeClass('empty')
                                .addClass('shift')
                                .addClass('clickable')
                                .attr('data-id',model.get('id'))
                                .attr('data-type-id',model.get('type_id'))
                                .attr('data-location',location )
                                .html( _.template($('#template_shift').html(),{shift:model, location:location}));
                        }
                    }
                    ,error:function(model, response, options){
                        $targetElement.addClass('error').addClass('clickable').removeClass('loading');
                        $targetElementContent.html('Error. Please retry.');
                    }
                });
        }
    },
    deselect:function(container){
        //alert('here');
        this.$('td.empty.error.selected').removeClass('selected');
        this.$('td.empty.selected').removeClass('selected').not('.loading').html('');
        this.$('td.shift.selected').removeClass('selected');
        this.$('td.category.selected').removeClass('selected');
        $('td .change-centre').show();
        $('td .select2-container').remove();
    },
    selectShift:function(ev){
        var $targetElement = $(ev.target).closest('td');
        this.deselect(this);
        $targetElement.removeClass('error').addClass('selected');
    },



    lightShift:function (el, color) {
        $targetElement = el;
        var shift = shifts.where({id:el.attr('data-id')});
        if(shift.length >0)
            {
              shift = shift[0];
              $targetElement.find('.content').html(_.template($('#template_loading').html()));
              shift.save({colour:color},{
                wait:true,
                success:function(model, response, options){
                    $targetElement.css('background',color);
                    $targetElement.removeClass('selected');
                    if(Number(model.get('id') > 0)) {
                        $targetElement.addClass('shift').addClass('clickable').attr('data-id',model.get('id')).html( _.template($('#template_shift').html(),{shift:model}));

                    }
                },
                error:function(model, response, options){
                    $targetElement.removeClass('selected').addClass('error').addClass('clickable').find('.content').html(backHTML);
                },
              });
            }
    },

    editShift:function(ev){
        var $targetElement = $(ev.target).closest('td');
        var shift_id = $targetElement.attr('data-id');
        var backHTML = $targetElement.find('.content').html();

        this.deselect(this);
        $targetElement.removeClass('clickable');
        $targetElement.removeClass('error');
        $targetElement.addClass('selected');

        //$targetElement.find('.content').html('<input class="time-range" type="text" value="'+$targetElement.find('.content').html()+'"> <a href="#"><span class="glyphicon glyphicon-calendar"></span></a>');
        $targetElement.find('.content').html('<textarea class="time-range">'+$targetElement.find('.content').text().trim()+'</textarea>');
        $targetElement.find('.time-range').focus();

        $targetElement.find('.time-range').on('change',function(){
            $(this).off('blur');
            var inVal = $(this).val();
            inVal = inVal.split('-');
            if(inVal.length === 2)
            {
                var start = (inVal[0]).trim();
                var end = (inVal[1]).trim();
                start = $.fn.timepicker.parseTime(start);
                end = $.fn.timepicker.parseTime(end);
                if(start > end)
                {
                    alert("Start time must be less than end time");
                    return;
                }
                if(end < start)
                {
                    alert("End time must be greater than start time");
                    return;
                }
                if(start <= end)
                {
                    start = $.fn.timepicker.formatTime('h:mm a',start);
                    end = $.fn.timepicker.formatTime('h:mm a',end);
                    var shift = shifts.where({id:shift_id});
                    if(shift.length >0)
                    {
                        shift = shift[0];
                        $targetElement.find('.content').html(_.template($('#template_loading').html()));
                        shift.save({start_time:start,end_time:end, colour:window._colour},{
                            wait:true,
                            success:function(model, response, options){
                                if(Number(model.get('id') > 0)) {
                                    console.log(model);
                                    $targetElement.addClass('shift').addClass('clickable').attr('data-id',model.get('id')).attr('data-location',model.get('location')).html( _.template($('#template_shift').html(),{shift:model}));
                                }
                            },
                            error:function(model, response, options){
                                $targetElement.removeClass('selected').addClass('error').addClass('clickable').find('.content').html(backHTML);
                            },
                        });
                    }
                }
                else
                {

                }
            }
            else
            {
                alert('Invalid time range');
                $targetElement.removeClass('selected').addClass('clickable').find('.content').html(backHTML);
            }

        });
        $targetElement.find('.time-range').on('blur',function(){
            $targetElement.removeClass('selected').addClass('clickable').find('.content').html(backHTML);
        })
        $targetElement.find('.time-range').keydown(function(e){
        if (e.keyCode == 13 && !e.shiftKey)
            {
                e.preventDefault();
                $(this).trigger('blur');
                return false;
            }
        });
        //$targetElement.find('div').popover({placement:'bottom',animation:true,trigger:'manual',content:'<input type="text">',html:true,container:'body'}).popover('show');
    },

    editRoster:function(ev){
        var $targetElement = $(ev.target).closest('td');
        var shift_id = $targetElement.attr('data-id');
        $targetElement.find('._content').removeClass('hidden');
        var backHTML = $targetElement.find('._content  > span').html();

        this.deselect(this);
        $targetElement.removeClass('clickable');
        $targetElement.removeClass('error');
        $targetElement.addClass('selected');

        //$targetElement.find('.content').html('<input class="time-range" type="text" value="'+$targetElement.find('.content').html()+'"> <a href="#"><span class="glyphicon glyphicon-calendar"></span></a>');
        $targetElement.find('._content  > span').html('<input class="time-range" type="text" value="'+$targetElement.find('._content > span').text().trim()+'">');
        $targetElement.find('.time-range').focus();

        $targetElement.find('.time-range').on('change',function(){
            $(this).off('blur');
            var inVal = $(this).val();
            inVal = inVal.split('-');

            if(inVal.length === 2)
            {
                var start = (inVal[0]).trim();
                var end = (inVal[1]).trim();
                start = $.fn.timepicker.parseTime(start);
                end = $.fn.timepicker.parseTime(end);
                if(start > end)
                {
                    alert("Start time must be less than end time");
                    return;
                }
                if(end < start)
                {
                    alert("End time must be greater than start time");
                    return;
                }
                if(start <= end)
                {
                    start = $.fn.timepicker.formatTime('h:mm a',start);
                    end = $.fn.timepicker.formatTime('h:mm a',end);
                    var shift = shifts.where({id:shift_id});
                    if(shift.length >0)
                    {
                        shift = shift[0];
                        $targetElement.find('._content  > span').html(_.template($('#template_loading').html()));
                        shift.save({_start_time:start,_end_time:end, colour:window._colour},{
                            wait:true,
                            success:function(model, response, options){
                                if(Number(model.get('id') > 0)) {
                                    console.log(model);
                                    $targetElement.addClass('shift').addClass('clickable').attr('data-id',model.get('id')).attr('data-location',model.get('location')).html( _.template($('#template_shift').html(),{shift:model}));
                                }
                            },
                            error:function(model, response, options){
                                $targetElement.removeClass('selected').addClass('error').addClass('clickable').find('.content').html(backHTML);
                            },
                        });
                    }
                }
                else
                {

                }
            }
            else
            {
                alert('Invalid time range');
                $targetElement.removeClass('selected').addClass('clickable').find('._content > span').html(backHTML);
            }

        });
        $targetElement.find('.time-range').on('blur',function(){
            $targetElement.removeClass('selected').addClass('clickable').find('._content > span').html(backHTML);
            setTimeout(function(){
                $targetElement.find('._content').addClass('hidden');
            }, 2000);
            
        })
        //$targetElement.find('div').popover({placement:'bottom',animation:true,trigger:'manual',content:'<input type="text">',html:true,container:'body'}).popover('show');
    },

    editCategory:function(ev){

        var $targetElement = $(ev.target).closest('td');
        var $targetElementContent = $targetElement.find('.content');
        var shift_id = $targetElement.attr('data-id');
        var type_id = $targetElement.attr('data-type-id');
        var backHTML = $targetElement.find('.content').html();
        var that = this;
        this.deselect(this);
        $targetElement.removeClass('clickable');
        $targetElement.removeClass('error');
        $targetElement.addClass('selected');
        $targetElementContent.html(_.template($('#template_category_select').html(),{categories:window.categories}));
        $targetElementContent.find('select').val(type_id);
        $targetElementContent.find('.select-category').select2({placeholder:"Select Category",allowClear:true}).on('change',function(ev){
            that.editCategoryChangeEvent(ev,$targetElement);
        });
        $('td').not($targetElement).one('click', function(e){
            $targetElement.addClass('clickable');
            $targetElement.removeClass('selected');
            $targetElement.find('.content').html(backHTML);
        });
    },

    allocateStaff:function(ev){
        var $targetElement = $(ev.target).closest('td');
        $targetElement.removeClass('clickable');

        var $targetElementContent = $targetElement.find('.content');
        var backHTML = $targetElementContent.html();
        var displayedStaffs = [];
        this.$('tr[data-id]').each(function(index){
            displayedStaffs.push($(this).data('id'));
        });
        var toDisplayStaffs = staffs.filter(function(staff){
            if(displayedStaffs.indexOf(Number(staff.get('id'))) === -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        g_allocate_staff_array = [];
        _.each(toDisplayStaffs,function(staff){
            g_allocate_staff_array.push({id:staff.get('id'),text:staff.get('name')});
        });


        $targetElementContent.html(_.template($('#template_allocate_staffs').html(),{}));
        $targetElementContent.find('.allocate_staff_select').select2({placeholder: "Select staff(s)",multiple:true,closeOnSelect:false
            //,data:function(){ return  },
            ,data:function() { return { text:'text', results: g_allocate_staff_array }; },
            dropdownCssClass:'allocate-staff-test',
            formatResult:function(staff,container){

                container.off('mouseup').on('mouseup',"a.edit"
                    ,function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        /*e = $.Event('click');
                         e.target = this;
                         //$targetElementContent.find('.allocate_staff_select').select2("close");
                         g_shiftTableView.newStaff(e);*/
                        var view = new StaffEditView();
                        var modal = new Backbone.BootstrapModal({
                            content: view,
                            title: 'Edit Staff',
                            okCloses: false,
                            okText: 'Update',
                            cancelText:'Close',
                            animate: true
                        });
                        view.staff_id = $(this).attr('data-id');
                        view.modal = modal;
                        modal.open(function(){
                            var form = $(this.$el).find('form');
                            form.trigger("submit");
                        });
                        return false;
                    }).on('mouseup','a.delete',function(e){
                        e.stopPropagation();e.preventDefault();e.stopImmediatePropagation();
                        var view = new StaffDeleteView();
                        var modal = new Backbone.BootstrapModal({
                            content: view,
                            title: 'Delete Staff',
                            okCloses: false,
                            okText: 'Delete',
                            cancelText:'Close',
                            animate: true
                        });
                        view.staff_id =  $(this).attr('data-id');

                        view.modal = modal;
                        modal.open();
                        return false;
                    });
                    $.event.trigger({type: "allocateStaff"});
                return '<span>'+ staff.text  +'</span><a data-id="'+ staff.id +'" style="padding: 3px;cursor:pointer" class="tb-inline-tool delete delete-staff-pencil pull-right"><span class="glyphicon glyphicon-remove"></span></a><a data-id="'+ staff.id +'" style="padding: 3px;cursor:pointer" class="tb-inline-tool edit pull-right edit-staff-pencil"><span class="glyphicon glyphicon-pencil"></span></a>';},

        }).on('select2-open',function(e){ $('.allocate-staff-test').prev().css('z-index','1000'); $('.allocate-staff-test').css('z-index','1001'); });
        $targetElementContent.find('.allocate-staff-toolbar .ok').off('click').on('click',function(){
            var selected = $(this).closest('td').find('input.allocate_staff_select').val();
            if($.trim(selected).length > 0)
            {
                selected = $.trim(selected);
                selected = selected.split(',');
                _.each(selected,function(staff_id){
                    var staff = staffs.findWhere({id:staff_id});
                    $targetElement.closest('tfoot').prev().append(_.template($('#template_allocate_dummy_staffs').html(),{staff:staff}));
                });
                $.event.trigger({type: "allocateStaff"});
            }
            $targetElementContent.html(backHTML);
            $targetElement.addClass('clickable');
        });
        $targetElementContent.find('.allocate-staff-toolbar .cancel').off('click').on('click',function(){
            $targetElementContent.html(backHTML);
            $targetElement.addClass('clickable');
        })

    $.event.trigger({type: "allocateStaff"});
    setTimeout(function(){
        $.event.trigger({type: "allocateStaff"});
    },100);
    },


    /////------------------------------------
    tagName: "div",
    el:'.table-wrapper',


    template:$('#shift_table'),

    render:function(){
        
        var template = _.template(this.template.html(),{showDate:this.options.showDate,staffs:this.options.staffs,shifts:this.options.shifts});
        this.$el.html(template);
        var that = this;

        this.$el.find('td').drag("start",function(ev, dd){
            if(ev.shiftKey || ev.ctrlKey)
            {
                var cursor = 'copy';
            }
            else
            {
                var cursor = 'move';
            }
            /*dd.limit = $div.offset();
             dd.limit.bottom = dd.limit.top + $div.outerHeight() - $( this ).outerHeight();
             dd.limit.right = dd.limit.left + $div.outerWidth() - $( this ).outerWidth();*/
            $('td.empty').addClass('available-cells');
            return $( this ).clone()
                .css('cursor',cursor)
                .css('z-index',2000)
                .css('position','absolute')
                .css("opacity", .9 )
                .appendTo( document.body );
        })
            .drag(function( ev, dd ){
                $( dd.proxy ).css({
                    top: ev.pageY-10,
                    left: ev.pageX-50
                });
            },{drop:'.empty',distance:'25'})
            .drag("end",function( ev, dd ){
                $('td.empty').removeClass('available-cells');
                $( this ).animate({
                    top: dd.offsetY,
                    left: dd.offsetX
                }, 420 );
                $( dd.proxy ).remove();
            });
        this.$el.find('td').drop(function( ev, dd ){
            if($(this).hasClass('empty'))
            {
                var dragElem = $(dd.drag);
                var id = dragElem.attr('data-id');
                var shift = shifts.findWhere({id:id});
                
                if(shift)
                {
                    console.log('doing it');
                    var type = shift.get("type_id");
                    shift_drag_start_time = shift.get('start_time');
                    shift_drag_stop_time = shift.get('end_time');
                    $(this).html('<div class="content"></div>')
                    if(type == '1')
                    {
                        $(this).trigger('dblclick');
                    }
                    else if(type == '2')
                    {
                        $(this).trigger('dblclick',[ "recur" ]);
                    }
                    else if(Number(type) > 2)
                    {
                        var e = $.Event('change');
                        e.val = type;
                        that.newCategoryChangeEvent(e,$(this));
                    }
                    // if(!(ev.shiftKey || ev.ctrlKey))
                    // {
                    //     dragElem.addClass('selected');
                    //     var e = $.Event('keydown');
                    //     e.keyCode = 46;
                    //     e.preConfirmed = true;;
                    //     dragElem.trigger(e);
                    // }
                }
            }
        });
        $.contextMenu({
            selector: 'th.thead-label-staff,td.clickable,th.clickable',
            /*autoHide:true,*/

            events:{
                show:function(opt){
                    $(this).trigger('click');
                }
            },
            build: function($trigger, e) {
                // this callback is executed every time the menu is to be shown
                // its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                var item =  {
                    "sep2": "---------",
                };
                if($trigger.hasClass('shift'))
                {
                    item =  {
                        "sep0": "---------",
                        "place-shift":{name:'Shift',type:'html','html':'<strong>Shift</strong>'},
                        "sep1": "---------",
                        "shift-edit": {"name": "Edit"},
                        "shift-delete": {"name": "Delete"},
                        "shift-copy": {"name": "Copy"},
                        "sep2": "---------",
                        "shift-light":{
                            'name':"Hightlight", 
                            'items':{
                                "red-light":{'name':'<div style="background-color:red;text-align:center;height:2px;"></div>'},
                                "green-light":{'name':'<div style="background-color:green;text-align:center;height:2px;"></div>'},
                                "blue-light":{'name':'<div style="background-color:blue;text-align:center;height:2px;"></div>'},
                                "none-light":{'name':"clear"}
                            }
                        },
                        "sep4": "---------",
                        "place-row":{name:'Week',type:'html','html':'<strong>Week</strong>'},
                        "row-copy": {"name": "Copy week"},
                        "row-paste": {"name": "Paste week"},
                        "sep5": "---------",
                        "place-rost":{name:'Extra',type:'html','html':'<strong>Extra</strong>'},
                        "shift-roster": {"name": "Edit ros. time"},
                    }
                }
                else  if($trigger.hasClass('category'))
                {
                    var sub_category = {};
                    var existing_name = $.trim($trigger.text());
                    categories.each(function(category){
                        if( category.get('name') != "Shift" && category.get('name') != "Recurring Shift" && category.get('name') != existing_name)
                        {
                            sub_category[("cat-edit-new-"+category.get('id'))]={"name":category.get('name')};
                        }

                    });

                    if($trigger.find('span.glyphicon-ban-circle').length === 1)
                    {
                        item =  {
                            "sep0": "---------",
                            "place-cat":{name:'Category',type:'html','html':'<strong>Category</strong>'
                                //,items
                            },
                            "sep1": "---------",
                            "cat-edit": {"name": "Edit", "items":sub_category},
                            "cat-delete": {"name": "Delete"},
                            //"sep2": "---------",
                            //"cat-paid": {"name": "Paid"},

                            "sep4": "---------",
                        "place-row":{name:'Week',type:'html','html':'<strong>Week</strong>'},
                        "row-copy": {"name": "Copy week"},
                        "row-paste": {"name": "Paste week"},
                        }
                    }
                    else{
                        item =  {
                            "sep0": "---------",
                            "place-cat":{name:'Category',type:'html','html':'<strong>Category</strong>'
                                //,items
                            },
                            "sep1": "---------",
                            "cat-edit": {"name": "Edit", "items":sub_category},
                            "cat-delete": {"name": "Delete"},
                            //"sep2": "---------",
                            //"cat-unpaid": {"name": "Unpaid"},
                            "sep4": "---------",
                        "place-row":{name:'Week',type:'html','html':'<strong>Week</strong>'},
                        "row-copy": {"name": "Copy week"},
                        "row-paste": {"name": "Paste week"},
                        }
                    }
                }
                else  if($trigger.hasClass('empty'))
                {
                    var sub_category = {};
                    categories.each(function(category){
                        if(category.get('name') != "Shift" && category.get('name') != "Recurring Shift" )
                        {
                            sub_category[("cat-new-"+category.get('id'))]={"name":category.get('name')};
                        }

                    });

                    item =  {
                        "sep0": "---------",
                        "place-shift":{name:'Shift',type:'html','html':'<strong>Shift</strong>'},
                        "sep1": "---------",
                        "shift-paste": {"name": "Paste"},
                        "shift-add": {"name": "Add"},
                        //"shift-recur-add": {"name": "Add Recursive"},
                        "sep2": "---------",
                        "place-cat":{name:'Category',type:'html','html':'<strong>Category</strong>'},
                        "sep3": "---------",
                        "cat-add": {"name": "Add", "items":sub_category},

                        "sep4": "---------",
                        "place-row":{name:'Week',type:'html','html':'<strong>Week</strong>'},
                        "row-copy": {"name": "Copy week"},
                        "row-paste": {"name": "Paste week"},
                    }
                }
                else  if($trigger.hasClass('staff'))
                {
                    item =  {
                        "sep0": "---------",
                        "place-staff":{name:'Staff',type:'html','html':'<strong>Staff</strong>'},
                        "sep1": "---------",
                        "staff-add": {"name": "Add"},
                        "staff-edit": {"name": "Edit"},
                        //"staff-delete": {"name": "Delete"},
                        "sep2": "---------",
                        "place-select":{name:'shift',type:'html','html':'<strong>Shift</strong>'},
                        "sep3": "---------",
                        "row-column-delete": {"name": "Delete selection"},
                        "row-copy": {"name": "Copy week"},
                        "row-paste": {"name": "Paste week"},
                        "sep4": "---------",
                        //"badge-select":{name:'badge',type:'html','html':'<strong>Extra</strong>'},
                        //"badge-manage": {"name": "Badges"},
                        //"sep5": "---------"
                    }
                }
                else  if($trigger.hasClass('thead-label-staff'))
                {
                    item =  {
                        "sep0": "---------",
                        "place-select":{name:'staff',type:'html','html':'<strong>Staff</strong>'},
                        "sep3": "---------",
                        "staff-add": {"name": "Add"},
                        "sep4": "---------",
                    }
                }
                else  if($trigger.hasClass('thead-label-date'))
                {
                    item =  {
                        "sep0": "---------",
                        "place-select":{name:'shift',type:'html','html':'<strong>Shift</strong>'},
                        "sep3": "---------",
                        "row-column-delete": {"name": "Delete Selection"},
                        "column-paste": {"name": "Paste day"},
                        "column-copy": {"name": "Copy day"},
                        "sep4": "---------",
                    }
                }
                return {
                    callback: function(key, options) {
                        var m = "clicked: " + key;
                        $(this).trigger('click');
                        if(key=='shift-add')
                        {
                            $(this).trigger('dblclick');
                        }
                        else if(key=='shift-copy')
                        {
                            localStorage["buffer.shift"] = JSON.stringify( shifts.findWhere({ id:$(this).attr('data-id') }).toJSON() ); 
                        }
                        else if(key=='shift-paste')
                        {   
                            that.pasteShift(e); 
                        }
                        else if(key=='column-paste')
                        {   
                            that.pasteCol(); 
                        }
                        else if(key=='column-copy')
                        {   
                            that.copyCol(); 
                        }
                        else if(key=='red-light')
                        {
                            that.lightShift($(this), 'red'); 
                        }
                        else if(key=='green-light')
                        {
                            that.lightShift($(this), 'green'); 
                        }
                        else if(key=='blue-light')
                        {
                            that.lightShift($(this), 'blue'); 
                        }
                        else if(key=='none-light')
                        {
                            that.lightShift($(this), ''); 
                        }
                        else if(key=='shift-recur-add')
                        {
                            $(this).trigger('dblclick',[ "recur" ]);
                        }
                        else if(key=='cat-add')
                        {
                            $(this).find('.create-category').trigger('click');
                        }
                        else if(key=='shift-edit' && $(this).hasClass('shift') && $(this).hasClass('clickable'))
                        {
                            $(this).find('div').trigger('dblclick');
                        }
                        else if(key=='cat-edit' && $(this).hasClass('category') && $(this).hasClass('clickable'))
                        {
                            $(this).find('div').trigger('dblclick');
                        }
                        else if(key=='shift-delete' && $(this).hasClass('shift') && $(this).hasClass('clickable'))
                        {
                            $(this).addClass('selected');
                            e = $.Event('keydown');
                            e.keyCode = 46;
                            $(this).trigger(e);
                        }
                        else if(key=='cat-delete' && $(this).hasClass('category') && $(this).hasClass('clickable'))
                        {
                            $(this).addClass('selected');
                            e = $.Event('keydown');
                            e.keyCode = 46;
                            $(this).trigger(e);
                        }
                        else if(key=='staff-add')
                        {
                            e = $.Event('click');
                            e.target = this;
                            that.newStaff(e);
                        }
                        else if(key=='staff-edit')
                        {
                            $(this).find('a').trigger('click');
                        }
                        else if(key=='badge-manage')
                        {
                            that.newIcon(e);
                        }
                        else if(key=='staff-delete')
                        {
                            e = $.Event('click');
                            e.target = this;
                            that.deleteStaff(e);
                        }
                        else if(key=='row-copy' )
                        {
                            that.copyRow(e);
                        }
                        else if(key=='shift-roster' )
                        {
                            that.editRoster(e);
                        }
                        else if(key=='row-paste' )
                        {
                            that.pasteRow(e);
                        }
                        else if(key=='row-column-delete' )
                        {
                            e = $.Event('keydown');
                            e.keyCode = 46;
                            console.log(that);
                            that.keyTable(e);
                        }else if(key.indexOf('cat-new-') > -1)
                        {
                            var id = key.replace('cat-new-','');
                            e = $.Event('change');
                            e.val = id;
                            that.newCategoryChangeEvent(e,$(this));
                        }
                        else if(key.indexOf('cat-edit-new-') > -1)
                        {
                            var id = key.replace('cat-edit-new-','');
                            e = $.Event('change');
                            e.val = id;
                            that.editCategoryChangeEvent(e,$(this));
                        }
                        else if(key=='cat-paid')
                        {
                            var $targetElement = $(this);
                            var $targetElementContent = $targetElement.find('.content');
                            var shift_id = $targetElement.attr('data-id');
                            var type_id = $targetElement.attr('data-type-id');
                            var backHTML = $targetElement.find('.content').html();
                            var thatTable = $(this).closest('table');

                            var shift = shifts.where({id:shift_id});
                            if(shift.length >0)
                            {
                                shift = shift[0]
                                $targetElement.removeClass('clickable');
                                $targetElement.removeClass('selected');
                                $targetElement.addClass('loading');
                                $targetElementContent.html(_.template($('#template_loading').html()));
                                if(shift.get('paid')==='0')
                                {
                                    shift.save({paid:'1'}
                                        ,{wait:true
                                            ,success:function(model, response, options){

                                                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                                                if(shiftStaff)
                                                {
                                                    var newHourDiff = 8;

                                                    if(shiftStaff.get('paymenttype') == '38')
                                                    {
                                                        newHourDiff = newHourDiff - g_38_roster_day_offset;

                                                    }

                                                    var trElem = thatTable.find("tr[data-id='"+model.get('staff_id')+"']");
                                                    var totalTd = trElem.find('td').last();
                                                    var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));

                                                    var finalVal = (existingValue + newHourDiff);
                                                    totalTd.attr('data-value',+finalVal.toFixed(2));
                                                    totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                                                    var overallHoursTd = thatTable.find("tfoot td.overall-hours");
                                                    overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                                                    overallHoursExistingValue = overallHoursExistingValue + ((isNaN(Number(newHourDiff)))?'0':Number(newHourDiff));
                                                    overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                                                    overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));

                                                    var category = categories.findWhere({id:model.get('type_id')});
                                                    $targetElement.css({'background':'#'+model.get('color')}).attr('data-type-id',model.get('type_id')).addClass('clickable').html( _.template($('#template_category').html(),{category:category,paid:model.get('paymenttype')}));
                                                }

                                            }
                                            ,error:function(model, response, options){
                                                $targetElement.addClass('error').addClass('clickable').removeClass('loading');
                                                $targetElementContent.html('Error. Please retry.');
                                            }
                                        });
                                }
                            }
                        }
                        else if(key=='cat-unpaid')
                        {
                            var $targetElement = $(this);
                            var $targetElementContent = $targetElement.find('.content');
                            var shift_id = $targetElement.attr('data-id');
                            var type_id = $targetElement.attr('data-type-id');
                            var backHTML = $targetElement.find('.content').html();
                            var thatTable = $(this).closest('table');

                            var shift = shifts.where({id:shift_id});
                            if(shift.length >0)
                            {
                                shift = shift[0]
                                $targetElement.removeClass('clickable');
                                $targetElement.removeClass('selected');
                                $targetElement.addClass('loading');
                                $targetElementContent.html(_.template($('#template_loading').html()));
                                if(shift.get('paid')==='1')
                                {
                                    shift.save({paid:'0'}
                                        ,{wait:true
                                            ,success:function(model, response, options){
                                                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                                                if(shiftStaff)
                                                {
                                                    var existingHourDiff = 8;
                                                    if(shiftStaff.get('paymenttype') == '38')
                                                    {
                                                        existingHourDiff = existingHourDiff - g_38_roster_day_offset;

                                                    }
                                                    var newHourDiff = 0;

                                                    var trElem = thatTable.find("tr[data-id='"+model.get('staff_id')+"']");
                                                    var totalTd = trElem.find('td').last();
                                                    var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));

                                                    var finalVal = (existingValue - existingHourDiff);
                                                    totalTd.attr('data-value',+finalVal.toFixed(2));
                                                    totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                                                    var overallHoursTd = thatTable.find("tfoot td.overall-hours");
                                                    overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                                                    overallHoursExistingValue = overallHoursExistingValue - ((isNaN(Number(existingHourDiff)))?'0':Number(existingHourDiff));
                                                    overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                                                    overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));

                                                    var category = categories.findWhere({id:model.get('type_id')});
                                                    $targetElement.css({'background':'#'+model.get('color')}).attr('data-type-id',model.get('type_id')).addClass('clickable').html( _.template($('#template_category').html(),{category:category,paid:model.get('paymenttype')}));

                                                }
                                            }
                                            ,error:function(model, response, options){
                                                $targetElement.addClass('error').addClass('clickable').removeClass('loading');
                                                $targetElementContent.html('Error. Please retry.');
                                            }
                                        });
                                }
                            }
                        }



                    },
                    items:item
                };
            }
        });

        this.$('.tbody-loading').remove();
        this.$('.time').timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia'
        });
        var that = this;
        shifts.on('add',function(model, collection, options){
            if(model.get('type_id') == 1 || model.get('type_id') == 2)
            {
                var trElem = that.$("tr[data-id='"+model.get('staff_id')+"']");
                var totalTd = trElem.find('td').last();
                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                if(shiftStaff)
                {
                    var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));
                    var hourDiff = 0;

                    if(shiftStaff.get('paymenttype') == 'salary')
                    {
                        hourDiff = 8;

                    }
                    else
                    {
                        hourDiff = (moment(model.get('end_time'),'h:mm a').diff(moment(model.get('start_time'),'h:mm a'),'hour',true));
                        if(hourDiff>g_break_threshold) {
                            if(shiftStaff.get('paymenttype') == '38')
                            {
                                hourDiff = hourDiff - g_38_roster_day_offset;

                            }
                            hourDiff= hourDiff-g_break_duration;
                        }

                    }
                    if(hourDiff>=0) {
                        var finalVal = (existingValue + ((isNaN(Number(hourDiff)))?'0':Number(hourDiff)));
                        totalTd.attr('data-value',+finalVal.toFixed(2));
                        totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                        var overallHoursTd = that.$("tfoot td.overall-hours");
                        overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                        overallHoursExistingValue = overallHoursExistingValue + ((isNaN(Number(hourDiff)))?'0':Number(hourDiff));
                        overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                        overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));
                    }
                }
            }
            else
            {
                var trElem = that.$("tr[data-id='"+model.get('staff_id')+"']");
                var totalTd = trElem.find('td').last();
                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                if(shiftStaff)
                {
                    var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));
                    var hourDiff = 0;

                    if(shiftStaff.get('paymenttype') == '38')
                    {
                        hourDiff = 8 - g_38_roster_day_offset;

                    }
                    else
                    {
                        hourDiff = 8;
                    }
                    if(hourDiff>=0) {
                        var finalVal = (existingValue + ((isNaN(Number(hourDiff)))?'0':Number(hourDiff)));
                        totalTd.attr('data-value',+finalVal.toFixed(2));
                        totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                        var overallHoursTd = that.$("tfoot td.overall-hours");
                        overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                        overallHoursExistingValue = overallHoursExistingValue + ((isNaN(Number(hourDiff)))?'0':Number(hourDiff));
                        overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                        overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));
                    }
                }
            }
        });
        shifts.on('remove',function(model,collection,options){
            if(model.get('type_id') == 1 || model.get('type_id') == 2)
            {
                var trElem = that.$("tr[data-id='"+model.get('staff_id')+"']");
                var totalTd = trElem.find('td').last();
                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                if(shiftStaff)
                {
                    var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));
                    var hourDiff = 0;

                    if(shiftStaff.get('paymenttype') == 'salary')
                    {
                        hourDiff = 8;

                    }
                    else
                    {
                        hourDiff = (moment(model.get('end_time'),'h:mm a').diff(moment(model.get('start_time'),'h:mm a'),'hour',true));
                        if(hourDiff>g_break_threshold) {
                            if(shiftStaff.get('paymenttype') == '38')
                            {
                                hourDiff = hourDiff - g_38_roster_day_offset;

                            }
                            hourDiff= hourDiff-g_break_duration;
                        }
                    }
                    if(existingValue >= hourDiff)
                    {
                        var finalVal = (existingValue - ((isNaN(Number(hourDiff)))?'0':Number(hourDiff)));
                        totalTd.attr('data-value',+finalVal.toFixed(2));
                        totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                        var overallHoursTd = that.$("tfoot td.overall-hours");
                        overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                        overallHoursExistingValue = overallHoursExistingValue - ((isNaN(Number(hourDiff)))?'0':Number(hourDiff));
                        overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                        overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));
                    }
                }
            }
            else{
                var trElem = that.$("tr[data-id='"+model.get('staff_id')+"']");
                var totalTd = trElem.find('td').last();
                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                if(shiftStaff)
                {
                    var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));
                    var hourDiff = 0;

                    if(shiftStaff.get('paymenttype') == '38')
                    {
                        hourDiff = 8 - g_38_roster_day_offset;

                    }
                    else
                    {
                        hourDiff = 8;
                    }
                    if(existingValue >= hourDiff)
                    {
                        var finalVal = (existingValue - ((isNaN(Number(hourDiff)))?'0':Number(hourDiff)));
                        totalTd.attr('data-value',+finalVal.toFixed(2));
                        totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                        var overallHoursTd = that.$("tfoot td.overall-hours");
                        overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                        overallHoursExistingValue = overallHoursExistingValue - ((isNaN(Number(hourDiff)))?'0':Number(hourDiff));
                        overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                        overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));
                    }
                }
            }

        });
        shifts.on('change',function(model,collection,options){
            if(model.get('type_id') == 1 || model.get('type_id') == 2)
            {
                var shiftStaff = staffs.findWhere({id:model.get('staff_id').toString()});
                if(shiftStaff)
                {
                    if(shiftStaff.get('paymenttype') != 'salary')
                    {
                        var existingHourDiff = (moment(model.previous('end_time'),'h:mm a').diff(moment(model.previous('start_time'),'h:mm a'),'hour',true));
                        if(existingHourDiff > g_break_threshold) {
                            if(shiftStaff.get('paymenttype') == '38')
                            {
                                existingHourDiff = existingHourDiff - g_38_roster_day_offset;

                            }
                            existingHourDiff = existingHourDiff - g_break_duration;
                        }
                        var newHourDiff = (moment(model.get('end_time'),'h:mm a').diff(moment(model.get('start_time'),'h:mm a'),'hour',true));
                        if(newHourDiff > g_break_threshold) {
                            if(shiftStaff.get('paymenttype') == '38')
                            {
                                newHourDiff = newHourDiff - g_38_roster_day_offset;

                            }
                            newHourDiff = newHourDiff - g_break_duration;
                        }
                        if(newHourDiff > existingHourDiff || existingHourDiff > newHourDiff)
                        {
                            var trElem = that.$("tr[data-id='"+model.get('staff_id')+"']");
                            var totalTd = trElem.find('td').last();
                            var existingValue = (isNaN(Number(totalTd.attr('data-value'))))?'0':Number(totalTd.attr('data-value'));
                            var hourDiff= newHourDiff - existingHourDiff;

                            var finalVal = (existingValue + ((isNaN(Number(hourDiff)))?'0':Number(hourDiff)));
                            totalTd.attr('data-value',+finalVal.toFixed(2));
                            totalTd.html( +finalVal.toFixed(2) + ' hour(s)');

                            var overallHoursTd = that.$("tfoot td.overall-hours");
                            overallHoursExistingValue = (isNaN(Number(overallHoursTd.attr('data-value'))))?'0':Number(overallHoursTd.attr('data-value'));
                            overallHoursExistingValue = overallHoursExistingValue + ((isNaN(Number(hourDiff)))?'0':Number(hourDiff));
                            overallHoursTd.attr('data-value',+overallHoursExistingValue.toFixed(2));
                            overallHoursTd.find('span').html(+overallHoursExistingValue.toFixed(2));
                        }
                    }
                }
            }
        });
    
    $.event.trigger({type: "gridRendered"});
    }
});