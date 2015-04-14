//--------------------------------------------
// quals
// 
var QualView = Backbone.View.extend({
    tagName: "div",
    el:'#qual-wrapper',
    events:{
        'click .create':'createQual',
        'click .tb-inline-tool.edit':'editQual',
        'click .tb-inline-tool.delete':'deleteQual'
    },
    createQual:function(ev){
        ev.stopPropagation();
        var view = new QualCreateView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'New Qualification',
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
    editQual:function(ev){
        ev.stopPropagation();
        var view = new QualEditView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Edit Qualification',
            okCloses: false,
            okText: 'Update',
            cancelText:'Close',
            animate: true
        });
        view.qual_id = $(ev.target).closest('tr').find('td').first().text();
        view.modal = modal;
        modal.open(function(){
            var form = $(this.$el).find('form');
            form.trigger("submit");
        });
        /*var $targetElement = $(ev.target).closest('tr');
         var id = $targetElement.find('td').first().text();*/
    },
    deleteQual:function(ev){
        ev.stopPropagation();
        var view = new QualDeleteView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Delete Qualification',
            okCloses: false,
            okText: 'Delete',
            cancelText:'Close',
            animate: true
        });
        view.centre_id = $(ev.target).closest('tr').find('td').first().text();
        view.modal = modal;
        modal.open();
    },
    template:$('#qual-table-display'),
    render:function(){
        var template = _.template(this.template.html(),{centres:window.centres});
        this.$el.html(template);
        var that = this;
    }
});

var QualEditView = Backbone.View.extend({
    template: $('#template_qual_edit'),
    events: {
        'submit form': 'edit_qual'
    },

    edit_qual:function(ev){
        var qualDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if($.trim(qualDetails.name).length <= 0 )
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
            var qual = quals.findWhere({id:that.qual_id});
            $(that.modal.$el).find('div.alert').html('Updating...').show();
            qual.save(qualDetails,{
                wait:true,
                success:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html('Updated successfully.').show(); 
                    g_qualView.render();

                    
                },
                error:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
                }

            });
        }
        return false;
    },

    icons: function (el) {
        icons = el.find('.rate-icon');
        input = el.find('#icon');
        icons.click(function(){
            icons.removeClass('btn btn-default active');
            $(this).addClass('btn btn-default active');
            input.val($(this).data('id'));
            //console.log(input.val());
        });

        var view = new IconManagerView();

        var modal = new Backbone.BootstrapModal({
            content: view,
            title: "<strong> Badges</strong>",
            okCloses: true,
            cancelText:'Close',
            okText:"Done",
            animate: true
        });

        view.modal = modal;
        view.back = this.modal;
        var that = this;
        el.find('#man-ico').click(function () {
            that.modal.close();
            get_badges(function(){
                modal.open();
            },'/timesheets/badges');
        });
        

    },
    render: function() {
        var qual = quals.findWhere({id:this.qual_id});
        var that = this;
        var template = _.template(that.template.html(),{qual:qual});
        that.$el.html(template);
        that.icons(that.$el);
        that.$el
            .find("img[data-id='"+qual.get('badge')+"']")
            .addClass('btn btn-default active');
    }
});

var QualDeleteView = Backbone.View.extend({
    template: $('#template_qual_delete'),
    initialize: function () {
        this.bind("ok", this.delete_qual);
    },
    delete_qual:function(ev){
        var qual = quals.findWhere({id:this.centre_id});
        var that = this;
        if(qual)
        {
            $(this.modal.$el).find('div.alert').html('Deleting...').show();
            qual.destroy({
                wait:true,
                success:function(model, response, options){
                    $(that.modal.$el).find('div.alert').html('Deleted successfully.').show();
                    g_qualView.render();
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

var QualCreateView = Backbone.View.extend({
    template: $('#template_qual_create'),
    events: {
        'submit form': 'create_qual'
    },
    create_qual:function(ev){
        var qualDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if($.trim(qualDetails.name).length <= 0 )
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
            var qual = new UQual({name:qualDetails.name,badge:qualDetails.badge, type:qualDetails.type});
            $(that.modal.$el).find('div.alert').html('Creating...').show();
            quals.create(qual,{
                wait:true,
                success:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html('Created successfully.').show();
                    g_qualView.render();
                },
                error:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html(response.responseText).show();
                }

            });
        }
        return false;
    },
    icons: function (el) {
        icons = el.find('.rate-icon');
        input = el.find('#icon');
        icons.click(function(){
            icons.removeClass('btn btn-default active');
            $(this).addClass('btn btn-default active');
            input.val($(this).data('id'));
            //console.log(input.val());
        });

        var view = new IconManagerView();

        var modal = new Backbone.BootstrapModal({
            content: view,
            title: "<strong> Badges</strong>",
            okCloses: true,
            cancelText:'Close',
            okText:"Done",
            animate: true
        });

        view.modal = modal;
        view.back = this.modal;
        var that = this;
        el.find('#man-ico').click(function () {
            that.modal.close();
            get_badges(function(){
                modal.open();
            },'/timesheets/badges');
        });
        

    },
    render: function() {
        var that = this;
        var template = _.template(that.template.html(),{});
        that.$el.html(template);
        that.icons(that.$el);
    }
});
