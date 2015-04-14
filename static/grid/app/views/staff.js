staffSelect = true;


var StaffCreateView = Backbone.View.extend({
    template: $('#template_staff_create'),
    events: {
        'submit form': 'create_staff'
    },
    create_staff:function(ev){
        var staffDetails = $(ev.currentTarget).serializeObject();
        var staff = new Staff();
        var that = this;
        var valError = false;
        var valMessage = '';
        if(staffDetails.username.length < 1)
        {
            valError = true;
            valMessage += '<li>Username is required</li>';
        }
        if(staffDetails.first_name.length < 1)
        {
            valError = true;
            valMessage += '<li>First name is required</li>';
        }
        if(staffDetails.last_name.length < 1)
        {
            valError = true;
            valMessage += '<li>Last name is required</li>';
        }
        if(staffDetails.employee_record_id.length < 1)
        {
            valError = true;
            valMessage += '<li>Employee id is required</li>';
        }
        if(staffDetails.allocated_centres.length < 1)
        {
            valError = true;
            valMessage += '<li>The staff must be allocated to atleast one centre</li>';
        }
        if(valError)
        {
            $(that.modal.$el).find('div.alert').html('<ul>'+ valMessage +'</ul>').show();
        }
        else
        {   console.log(staffDetails.qualification);
            var staff = new Staff({email:staffDetails.email,paymenttype:staffDetails.paymenttype, allocated_centres: staffDetails.allocated_centres , name:staffDetails.first_name + ' ' +staffDetails.last_name,username:staffDetails.username,firstname: staffDetails.first_name,lastname:staffDetails.last_name
                ,address:staffDetails.address
                ,phone:staffDetails.phone
                ,employee_id:staffDetails.employee_record_id,
                qualification:staffDetails.qualification
            });
            $(that.modal.$el).find('div.alert').html('Creating Staff...').show();
            staffs.create(staff,{
                wait:true,
                success:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html('Staff created successfully.').show();
                },
                error:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
                }

            });
        }


        /*$(that.modal.$el).find('div.alert').html('Creating campaign...').show();
         campaign.save(campaignDetails, {
         success: function (campaign) {
         $(that.modal.$el).find('div.alert').html('Created successfully.').show();
         that.modal.once('hidden',function(){ oTable.fnStandingRedraw();  });
         },
         error:function(model,response){
         $(that.modal.$el).find('div.alert').html(response.responseJSON.message).show();
         }

         });*/
        return false;
    },
    render: function() {
        var that = this;
        var retArray = [];
        centres.each(function(centre){
            retArray.push({id:centre.get('id'),text:centre.get('name')});
        });
        var cerArray = [];
        quals.each(function(qual){
            cerArray.push({id:qual.get('id'),text:qual.get('name')});
        });
        var template = _.template(that.template.html(),{});
        that.$el.html(template);
        that.$el.find('.allocated_centres').select2({placeholder:"Select Centre",multiple:true,closeOnSelect:false,data:retArray
        });
        that.$el.find('input[name="' + 'paymenttype' + '"]').val(["salary"]);
        that.$el.find('#qualification').select2({placeholder:"Qualification",multiple:true,closeOnSelect:false,data:cerArray });
                
    }
});

var StaffEditView = Backbone.View.extend({
    template: $('#template_staff_edit'),
    events: {
        'submit form': 'edit_staff'
    },
    edit_staff:function(ev){
        var staffDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if(staffDetails.first_name.length < 1)
        {
            valError = true;
            valMessage += '<li>First name is required</li>';
        }
        if(staffDetails.last_name.length < 1)
        {
            valError = true;
            valMessage += '<li>Last name is required</li>';
        }
        if(staffDetails.employee_record_id.length < 1)
        {
            valError = true;
            valMessage += '<li>Employee id is required</li>';
        }
        if(staffDetails.allocated_centres.length < 1)
        {
            valError = true;
            valMessage += '<li>The staff must be allocated to atleast one centre</li>';
        }
        if(valError)
        {
            $(that.modal.$el).find('div.alert').html('<ul>'+ valMessage +'</ul>').show();
        }
        else
        {
            /* var staff = new Staff({id:that.staff_id,name:staffDetails.first_name + ' ' +staffDetails.last_name,password:staffDetails.password,rpassword:staffDetails.rpassword,firstname: staffDetails.first_name,lastname:staffDetails.last_name
             ,address:staffDetails.address
             ,phone:staffDetails.phone
             ,employee_id:staffDetails.employee_record_id
             });*/
            var staff = staffs.findWhere({id:Number(that.staff_id).toString()});
            $(that.modal.$el).find('div.alert').html('Updating Staff...').show();
            staff.save(staffDetails,{
                wait:true,
                success:function(model,response)
                {
                    $('tr[data-id="'+model.get('id')+'"]').find('.staff_link').html(model.get('first_name') + ' ' + model.get('last_name'));
                    $('a.edit-staff-pencil[data-id="'+ model.get('id') +'"]').prev().prev().html(model.get('first_name') + ' ' + model.get('last_name'));

                    if($(".allocate_staff_select").data('select2') !== null)
                    {
                        var data = $(".allocate_staff_select").data('select2').opts.data;
                        if(data !== undefined)
                        {
                            var staff = _.where(data,{id:model.get('id')});
                            if(staff.length > 0 )
                            {
                                staff = staff[0];
                                staff.text = model.get('first_name') + ' ' + model.get('last_name');
                            }
                        }
                    }

                    $(that.modal.$el).find('div.alert').html('Staff updated successfully.').show();

                },
                error:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
                }

            });
        }


        /*$(that.modal.$el).find('div.alert').html('Creating campaign...').show();
         campaign.save(campaignDetails, {
         success: function (campaign) {
         $(that.modal.$el).find('div.alert').html('Created successfully.').show();
         that.modal.once('hidden',function(){ oTable.fnStandingRedraw();  });
         },
         error:function(model,response){
         $(that.modal.$el).find('div.alert').html(response.responseJSON.message).show();
         }

         });*/
        return false;
    },
    render: function() {
        var staff = new Staff({id: this.staff_id});
        var that = this;
        that.$el.html('Fetching Staff details...');
        staff.fetch({
            success: function (staff) {

                var retArray = [];
                centres.each(function(centre){
                    retArray.push({id:centre.get('id'),text:centre.get('name')});
                });
                var cerArray = [];
                quals.each(function(qual){
                    cerArray.push({id:qual.get('id'),text:qual.get('name')});
                });
                
                var template = _.template(that.template.html(),{staff:staff});
                that.$el.html(template);
                

                that.$el.find('.allocated_centres').select2({placeholder:"Select Centre",multiple:true,closeOnSelect:false,data:retArray });
                that.$el.find('#qualification').select2({placeholder:"Qualification",multiple:true,closeOnSelect:false,data:cerArray });
                
                
                //<input value="1" type="checkbox" name="salary_flag" <% if(staff.get('salary_flag') == 1) { %>checked<% } %>>
                /*console.log(staff);
                 console.log(staff.get('paymenttype'));*/

                that.$el.find('input[name="' + 'paymenttype' + '"]').val([staff.get('paymenttype')]);
            },
            error: function(){
                alert('unable to fetch campaign details');
            }
        });


        /*  var that = this;
         var template = _.template(that.template.html(),{});
         that.$el.html(template);*/
    }
});

var StaffDeleteView = Backbone.View.extend({
    template: $('#template_staff_delete'),
    initialize: function () {
        this.bind("ok", this.delete_staff);
    },
    delete_staff:function(ev){
        var $targetElement = $('tr.tbody-content[data-id="'+this.staff_id+'"]');
        var id = $targetElement.attr('data-id');
        var backHTML = $targetElement.find('td').first().html();
        if(id==undefined)
        {
            id = this.staff_id;
        }
        var staff = staffs.findWhere({id:id});
        var that = this;
        if(staff)
        {
            $targetElement.find('td').removeClass('clickable').removeClass('selected');
            $targetElement.find('td').first().html(_.template($('#template_loading').html()));
            $(this.modal.$el).find('div.alert').html('Deleting Staff...').show();
            staff.destroy({
                wait:true,
                success:function(model, response, options){
                    $(that.modal.$el).find('div.alert').html('Staff deleted successfully.').show();
                    var del_shifts = shifts.where({staff_id:that.staff_id.toString()});
                    _.each(del_shifts,function(shift){
                        shift.collection.remove(shift);
                    })
                    $('a.delete-staff-pencil[data-id="'+ model.get('id') +'"]').parent().parent().remove();
                    $targetElement.remove();
                    if($(".allocate_staff_select").data('select2') !== null)
                    {
                        var data = $(".allocate_staff_select").data('select2').opts.data;
                        if(data !== undefined)
                        {
                            var staff = _.where(data().results,{id:model.get('id')});
                            if(staff.length > 0)
                            {
                                staff = staff[0];
                                //$(".allocate_staff_select").data('select2').opts.data = _.without(data,staff);
                                g_allocate_staff_array = _.without(g_allocate_staff_array,staff);
                            }
                        }
                    }

                },
                error:function(model, response, options){
                    $targetElement.find('td').addClass('clickable').first().html(backHTML);
                }
            });
        }
        return false;
    },
    render: function() {
        var template = _.template(this.template.html(),{});
        this.$el.html(template);
        //return this;
    }
});
//--------------------------------------------