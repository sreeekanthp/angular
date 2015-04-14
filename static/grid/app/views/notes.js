
shift_drag_start_time = null;
shift_drag_stop_time = null;



var NotesView = Backbone.View.extend({
    el: "#note-area",
    events:{
        "dblclick .the-note":'edit',
        "click .the-note .edit-note":'edit',
        "click .the-note .del-note":"delete"
    },
    initialize: function () {
        var that = this;
        this.get();
        var editor = this.$el.find('.editor');
        editor.find('.ok').off("click");
        editor.find('.ok').on("click",function(){
            that.post({
                shift_id:that.$el.data('id'),
                note:that.$el.find('textarea').val(),
            });
        });
    },
    cls: function(){
        this.$el.find('.the-note, hr').show();
        this.$el.find('.editor textarea').val('');
        this.$el.find(".notes-indicator")
          .addClass("hidden");
    },
    get:function () {
        var that = this;
        var id = this.$el.data('id');
        this.$el
          .find(".notes-indicator")
          .toggleClass("hidden");

        $.get("/manage/handler/shiftnote?shiftid="+id, function(data){
          
          $("#the-notes").html(_.template($("#notes-grid").html(),
            {
                notes: data
            }
          ));//
          if(data.length){
                $("td[data-id='"+id+"']").find("#notes").css({
                    background:'#ffd',
                });
          }
          that.cls();
        });
    },
    
    put: function (data) {
        var that=this;
        if(!data.note||data.note==='') return;
        $.ajax({
            method:"put",
            url:"/manage/handler/shiftnote/"+data.id,
            data:JSON.stringify(data),
            success:function(){
                that.initialize();
                that.cls();
            },
        });
    },
    post: function (data){
        var that=this;
        if(!data.note||data.note==='') return;
        $.ajax({
            method:"post",
            url:"/manage/handler/shiftnote",
            data:data,
            success:function(){
                that.get();
                that.cls();
            },
        });
    },
    delete:function(ev){
        var el = $(ev.target).closest('.the-note');
        var id = el.data('id');
        var that=this;
        $.ajax({
            method:"delete",
            url:"/manage/handler/shiftnote/"+id,
            success:function(){
                that.get();
                that.cls();
            },
        });

    },
    edit: function (ev) {
        var that = this;
        var el = $(ev.target).closest('.the-note');
        var id = el.data('id');
        var shId = el.data('shift-id');
        var editor = this.$el.find('.editor');
        editor.find('textarea').val(el.text().trim());
        this.$el.find('.the-note, hr').hide();

        editor.find('.ok').off("click");
        editor.find('.ok').on("click",function(){
            that.put({
                id:id,
                shift_id:shId,
                note:that.$el.find('textarea').val(),
            });
        });
    },
     
});
