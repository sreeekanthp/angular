
var IconManagerView = Backbone.View.extend({
    template: $('#template_icon_manager'),
    events: {
        'change #new-icons': 'upload',
        'click .rate-icon': 'select',
        'click .remove': 'remove',
        'click #manage-trigger':'manage'
    },
    
    initialize : function (staff) {
        this.staff = staff;
        this.bind("ok", this.update);
    },
    manage:function(){
        box = this.modal.$el.find('#manage');
        if(box.hasClass('hidden')){
            box.removeClass('hidden');
        }else{
            box.addClass('hidden');
        }
    },
    update: function () { 
        var that = this;
        var data = [];
        _.each(this.modal.$el.find('.icon-manager-box .active'), function (e) {
            data.push(Number($(e).attr('data-id')));
        });
        if(!this.staff){
            this.modal.close();
            return;
        }
        $.ajax({
          url: '/timesheets/badges/'+this.staff.get('id'),
          data: JSON.stringify({badges:data}),
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          success: function(data){
            that.badges();
            that.append();          
          }
      }); 
    },
    badges:function(){
        var ur = this.staff && '/timesheets/badges/'+this.staff.get('id') || '/timesheets/badges';
        get_badges(function() {
            $('.icon-manager-box .active').removeClass("active");
            $('.icon-manager-box')
                .html(_.template($('#icon_manager').html() )());
            }, ur);
    },

    throw: function(){
        var that = this;
        var data = [];
        _.each(this.modal.$el.find('.icon-manager-box .active'), function (e) {
            data.push(Number($(e).attr('data-id')));
        });
        
        $.ajax({
          url: '/timesheets/badges',
          data: JSON.stringify({badges:data}),
          cache: false,
          contentType: false,
          processData: false,
          type: 'DELETE',
          success: function(data){

            that.badges();
            that.append();          
          }
      });
    },

    remove:function(){
        var yeap = confirm("Selected badges will no longer available for all staff. Delete anyway?");
        if (yeap){
            this.throw();
        }
    },

    append:function(){
        var box = $("#badge-box-"+this.staff.get('id') );
        box.html('');
        var cook ="";
        _.each(this.modal.$el.find('.icon-manager-box .active'), function (e) {
            var src = $(e).attr('src');
            cook = cook+"<img class='btn active rank-icon' src='"+src+"'/>";
        });
        box.html(cook);

    },

    upload:function  (ev) {
        var data = new FormData();
        var form = $(ev.target).closest('input')[0];
        var that = this;
        _.each( form.files, function(e,i){
            data.append('file', e)
        });

        $(".icon-indicator").removeClass('hidden');
        $.ajax({
          url: '/timesheets/badges',
          data: data,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          success: function(data){
                $(".icon-indicator").addClass('hidden');
                $(".icon-error").addClass('hidden');
                clearFileInput(form);
                that.badges();
            },
          error:function(data){
                $(".icon-error").removeClass('hidden');
                $(".icon-indicator").addClass('hidden');
                clearFileInput(form);
          }
          });

    },
    
    select:function(ev){
        var $el = $(ev.target).closest('img');
        if($el.hasClass('btn btn-default active') ){
            $el.removeClass('btn btn-default active');
        }else{
            $el.addClass('btn btn-default active');
        }
    },
    
    render: function() {
        var that = this;
        
        var template = _.template(this.template.html(),{staff:that.staff});
        this.$el.html(template);
        return this;
    }
});

