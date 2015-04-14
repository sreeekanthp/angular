

var CentreView = Backbone.View.extend({
    tagName: "div",
    el:'#centre-wrapper',
    events:{
        'click .create':'createCentre',
        'click .tb-inline-tool.edit':'editCentre',
        'click .tb-inline-tool.delete':'deleteCentre'
    },
    createCentre:function(ev){
        ev.stopPropagation();
        var view = new CentreCreateView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'New Centre',
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
    editCentre:function(ev){
        ev.stopPropagation();
        var view = new CentreEditView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Edit Centre',
            okCloses: false,
            okText: 'Update',
            cancelText:'Close',
            animate: true
        });
        view.centre_id = $(ev.target).closest('tr').find('td').first().text();
        view.modal = modal;
        modal.open(function(){
            var form = $(this.$el).find('form');
            form.trigger("submit");
        });
        /*var $targetElement = $(ev.target).closest('tr');
         var id = $targetElement.find('td').first().text();*/
    },
    deleteCentre:function(ev){
        ev.stopPropagation();
        var view = new CentreDeleteView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Delete Centre',
            okCloses: false,
            okText: 'Delete',
            cancelText:'Close',
            animate: true
        });
        view.centre_id = $(ev.target).closest('tr').find('td').first().text();
        view.modal = modal;
        modal.open();
    },
    template:$('#centre-table-display'),
    render:function(){
        var template = _.template(this.template.html(),{centres:window.centres});
        this.$el.html(template);
        var that = this;
    }
});

var CentreEditView = Backbone.View.extend({
    template: $('#template_centre_edit'),
    events: {
        'submit form': 'edit_centre'
    },
    edit_centre:function(ev){
        var centreDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if($.trim(centreDetails.name).length <= 0 )
        {
            valError = true;
            valMessage += '<li>Name is required</li>';
        }
        if(valError)
        {
            $(that.modal.$el).find('div.alert').html('<ul>'+ valMessage +'</ul>').show();
        }
        else
        {
            var centre = centres.findWhere({id:that.centre_id});
            $(that.modal.$el).find('div.alert').html('Updating Centre...').show();
            centre.save(centreDetails,{
                wait:true,
                success:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html('Centre updated successfully.').show();
                    g_centreView.render();
                    var retArray = [];
                    retArray.push({id:'0',text:'All'});
                    centres.each(function(centre){
                        retArray.push({id:centre.get('id'),text:centre.get('name')});
                    });
                    $('.select-centre').select2('destroy');
                    $('.select-centre').val(window.centre_id).select2({placeholder:"Select Centre",data:retArray
                    }).on('change',function(ev){
                            location.href = location.href.replace(/[&]+centre=[0-9]*/gi,'') + '&centre='+ev.val;
                        });
                    $('.select-centre-export').select2('destroy');
                    $('.select-centre-export').val(window.centre_id).select2({placeholder:"Select Centre",data:retArray
                    });
                },
                error:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
                }

            });
        }
        return false;
    },
    render: function() {
        var centre = centres.findWhere({id:this.centre_id});
        var that = this;
        var template = _.template(that.template.html(),{centre:centre});
        that.$el.html(template);
    }
});

var CentreDeleteView = Backbone.View.extend({
    template: $('#template_centre_delete'),
    initialize: function () {
        this.bind("ok", this.delete_centre);
    },
    delete_centre:function(ev){
        var centre = centres.findWhere({id:this.centre_id});
        var that = this;
        if(centre)
        {
            $(this.modal.$el).find('div.alert').html('Deleting Centre...').show();
            centre.destroy({
                wait:true,
                success:function(model, response, options){
                    $(that.modal.$el).find('div.alert').html('Centre deleted successfully.').show();
                    g_centreView.render();
                    var retArray = [];
                    retArray.push({id:'0',text:'All'});
                    centres.each(function(centre){
                        retArray.push({id:centre.get('id'),text:centre.get('name')});
                    });
                    $('.select-centre').select2('destroy');
                    $('.select-centre').val(window.centre_id).select2({placeholder:"Select Centre",data:retArray
                    }).on('change',function(ev){
                            location.href = location.href.replace(/[&]+centre=[0-9]*/gi,'') + '&centre='+ev.val;
                        });
                    $('.select-centre-export').select2('destroy');
                    $('.select-centre-export').val(window.centre_id).select2({placeholder:"Select Centre",data:retArray
                    });
                },
                error:function(model, response, options){
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
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
var CentreCreateView = Backbone.View.extend({
    template: $('#template_centre_create'),
    events: {
        'submit form': 'create_centre'
    },
    create_centre:function(ev){
        var centreDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if($.trim(centreDetails.name).length <= 0 )
        {
            valError = true;
            valMessage += '<li>Name is required</li>';
        }
        if(valError)
        {
            $(that.modal.$el).find('div.alert').html('<ul>'+ valMessage +'</ul>').show();
        }
        else
        {
            var centre = new Centre({threshold:centreDetails.threshold,name:centreDetails.name,address:centreDetails.address,phone:centreDetails.phone});
            $(that.modal.$el).find('div.alert').html('Creating Centre...').show();
            centres.create(centre,{
                wait:true,
                success:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html('Centre created successfully.').show();
                    g_centreView.render();
                    var retArray = [];
                    retArray.push({id:'0',text:'All'});
                    centres.each(function(centre){
                        retArray.push({id:centre.get('id'),text:centre.get('name')});
                    });
                    $('.select-centre').select2('destroy');
                    $('.select-centre').val(window.centre_id).select2({placeholder:"Select Centre",data:retArray
                    }).on('change',function(ev){
                            //console.log(location.href.replace(/[&]+centre=[0-9]*/gi,''));
                            location.href = location.href.replace(/[&]+centre=[0-9]*/gi,'') + '&centre='+ev.val;
                        });
                    $('.select-centre-export').select2('destroy');
                    $('.select-centre-export').val(window.centre_id).select2({placeholder:"Select Centre",data:retArray
                    });
                },
                error:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
                }

            });
        }
        return false;
    },
    render: function() {
        var that = this;
        var template = _.template(that.template.html(),{});
        that.$el.html(template);
    }
});
