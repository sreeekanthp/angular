
var CategoryView = Backbone.View.extend({
    tagName: "div",
    el:'#category-wrapper',
    events:{
        'click .create':'createCategory',
        'click .tb-inline-tool.edit':'editCategory',
        'click .tb-inline-tool.delete':'deleteCategory'
    },
    createCategory:function(ev){
        ev.stopPropagation();
        var view = new CategoryCreateView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'New Category',
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
    editCategory:function(ev){
        ev.stopPropagation();
        var view = new CategoryEditView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Edit Category',
            okCloses: false,
            okText: 'Update',
            cancelText:'Close',
            animate: true
        });
        view.category_id = $(ev.target).closest('tr').find('td').first().text();

        view.modal = modal;
        modal.open(function(){
            var form = $(this.$el).find('form');
            form.trigger("submit");
        });
    },
    deleteCategory:function(ev){
        ev.stopPropagation();
        var view = new CategoryDeleteView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'Delete Category',
            okCloses: false,
            okText: 'Delete',
            cancelText:'Close',
            animate: true
        });
        view.category_id = $(ev.target).closest('tr').find('td').first().text();
        view.modal = modal;
        modal.open();
    },
    template:$('#category-table-display'),
    render:function(){
        var template = _.template(this.template.html(),{categories:window.categories});
        this.$el.html(template);
        var that = this;
    }
});
var CategoryCreateView = Backbone.View.extend({
    template: $('#template_category_create'),
    events: {
        'submit form': 'create_category'
    },
    create_category:function(ev){
        var categoryDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if($.trim(categoryDetails.name).length <= 0 )
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
            var category = new Category({name:categoryDetails.name,color:categoryDetails.color.replace('#','')});
            $(that.modal.$el).find('div.alert').html('Creating Centre...').show();
            categories.create(category,{
                wait:true,
                success:function(model,response)
                {
                    $(that.modal.$el).find('div.alert').html('Category created successfully.').show();
                    g_categoryView.render();
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


var CategoryEditView = Backbone.View.extend({
    template: $('#template_category_edit'),
    events: {
        'submit form': 'edit_category'
    },
    edit_category:function(ev){
        var categoryDetails = $(ev.currentTarget).serializeObject();
        var that = this;
        var valError = false;
        var valMessage = '';
        if($.trim(categoryDetails.name).length <= 0 )
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
            var category = categories.findWhere({id:that.category_id});
            $(that.modal.$el).find('div.alert').html('Updating Category...').show();
            categoryDetails.paymenttype = categoryDetails.paymenttype && 1 || 0;
            categoryDetails.color = categoryDetails.color.replace('#','');
            category.save(categoryDetails,{
                wait:true,
                success:function(model,response)
                {
                    if (model.get('id')==1) return;   
                    $(that.modal.$el).find('div.alert').html('Category updated successfully.').show();
                    $('td[data-type-id="'+model.get('id')+'"] div').css('background-color','#'+model.get('color'));
                    $('td[data-type-id="'+model.get('id')+'"] div').text(model.get('name'));
                    g_categoryView.render();
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
        var category = categories.findWhere({id:this.category_id});
        var that = this;
        console.log(this.category_id);
        console.log(category);
        var template = _.template(that.template.html(),{category:category});
        that.$el.html(template);
    }
});

var CategoryDeleteView = Backbone.View.extend({
    template: $('#template_category_delete'),
    initialize: function () {
        this.bind("ok", this.delete_category);
    },
    delete_category:function(ev){
        var category = categories.findWhere({id:this.category_id});
        var that = this;
        if(category)
        {
            $(this.modal.$el).find('div.alert').html('Deleting category...').show();
            category.destroy({
                wait:true,
                success:function(model, response, options){
                    $(that.modal.$el).find('div.alert').html('Category deleted successfully.').show();
                    var del_shifts = shifts.where({type_id:model.get('id').toString()});
                    _.each(del_shifts,function(shift){
                        $('td.category[data-type-id="'+model.get('id')+'"]').removeAttr('data-type-id').removeAttr('data-id').empty().removeClass().addClass('empty clickable');
                        shift.collection.remove(shift);
                    })
                    g_categoryView.render();
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
