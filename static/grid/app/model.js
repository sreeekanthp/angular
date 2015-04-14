var ShiftTable = Backbone.Model.extend({
});
var Shift = Backbone.Model.extend({
    //url:'shift',
    urlRoot:'/manage/handler/shift',
    
    initialize:function(){
    	this.on('all', this.light);
    	var that = this;
    	$(document).ready(function () {
    		setInterval(function(){
    			that.light();
                that.notes();
    		}, 2000);
    	})
      
    },

    light:function(){
    	var $el = $("td[data-id='"+this.get('id')+"']");
    	var location = centres.findWhere({id:String(this.get('location'))});

    	if (location && $el.length){

    		var treshold = Number(location.get('treshold') || 50)

 				var aDiff = (moment(this.get('end_time'),'h:mm a').diff(moment(this.get('start_time'),'h:mm a'),'minute',true));
 				var rDiff = (moment(this.get('_end_time'),'h:mm a').diff(moment(this.get('_start_time'),'h:mm a'),'minute',true));



 				$el.removeClass('treshold-over');
 				if( (aDiff-rDiff) > treshold ) $el.addClass('treshold-over');

    		$el.removeClass('treshold-minus');
    		if( Number(this.get('type_id'))==1  && (aDiff-rDiff) < 0 ) $el.addClass('treshold-minus');

    		var now = moment();
    		var day = moment(this.get('day'), "YYYY-MM-DD");

    		//---------------------------
    		if(now.year() == day.year() &&
    			now.month() == day.month() &&
    			now.day() == day.day() ){
    		//---------------------------

    			$el.removeClass('treshold-progress');
 				  if(now.unix() <= moment(this.get('end_time'),'h:mm a').unix()&&
 				  	 now.unix() >= moment(this.get('start_time'),'h:mm a').unix()
 				  ){
 				  		$el.addClass('treshold-progress')
 				  }

    		}



    	}

    },

    notes: function(){
        var $el = $("td[data-id='"+this.get('id')+"']");
        var _id = this.get('id');
        if(!this.already){

            

            $.get("/manage/handler/shiftnote?shiftid="+_id, function(data){
            if(data.length){
                $el.append(_.template($("#note-trigger").html(), {id:_id}));
                $el.find("#notes").css({
                    background:'#ffb',
                });
            }else{
                return;
            }
        });

      }//if
        
        var that = this;
        $el.find("#notes").popover({
            container:"body",
            html:true,
            trigger:'click',
            //title:"Notes",
            placement:'bottom',
            content:_.template($("#note-content").html(),
                {
                    id:_id
                }),


        }).off('shown.bs.popover').on('shown.bs.popover', function(){
            that.nview = new NotesView();

        });
        
        $("table").off('mousedown');
        $("table").on('mousedown',function(ev){
            
                console.log('Stop rape the mouse!! ');
                $("td #notes")
                    .not($(ev.target).closest("td")
                    .find('#notes')).popover('destroy');
            
        });

        this.already = 1;
    },


});

var Staff = Backbone.Model.extend(
{
    urlRoot:'/manage/handler/staff',
    initialize:function(){
        this.on('all', this.badge);
        var that = this;
        $(document).ready(function(){
            setInterval(function(){that.badge();}, 1000);    
        });
        
    },
    badge:function(argument) {
        var uid = this.get('id');
        qua = this.get('qualification');
        if(!qua){return;}
        
        if(qua instanceof String){qua=qua.split(',');}
        _.each(qua,function(e,i){
            if(qua[i].constructor===Object){
                qua[i]=qua[i].id;
            }
        });
        //
        _.each(qua,function(q){
          try{
            var qual = quals.findWhere({id:String(q)});
            var ex = $('#badge-box-'+ uid + ' .r-q-' + q);
            if(ex.length){ return; }
            var bgs = new aBadges(badges);
            var bg = bgs.findWhere({id:Number(qual.get('badge'))});
            $("#badge-box-"+uid).append(
            _.template($("#badge-image").html(), {
                qual:qual,
                src:bg.get('file'),
            }));

          }catch(e){
            console.log("8====D Woooa, your app has a dick.");
          }
        });
        
    }

});
var Centre = Backbone.Model.extend(
    {
        urlRoot:'/manage/handler/centre'
    }
);
var Category = Backbone.Model.extend({
    urlRoot:'/manage/handler/category'
});

var UQual = Backbone.Model.extend({
    urlRoot:'/manage/handler/qualification'
});

 

