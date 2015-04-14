$(document).ready(function(){
	
	window.buttsex = undefined;
	$("#buttsex").click(function(){
		$(this).toggleClass("active");
		if($(this).hasClass("active")){
			window.buttsex = 1;
		}else{
			window.buttsex = undefined;
		}
	});

	function drawerit(){
		$("#drawerit-pane")
				.css('height',$(document).height());
	};drawerit();//

	// function table(){
	// 	$(".table-container")
	// 		.css("margin-top", $(".toolbar").outerHeight());
	// };table();//

	// function makeheader(){
	// 		var html = $(".tg thead tr")[0].outerHTML;
			
	// 		$('body').append(_.template($("#fixed-th").html(),{
	// 			html:html,
	// 		}));
			
	// 		$(".fixed-header").css({
	// 			"top":0,
	// 			"margin-top":$(".toolbar").outerHeight() + 10,
	// 			"width":$(".tg").width(),
	// 		});

	// 	}//;makeheader();//
	// function matchhead(){
		
	// 	_.each($(".main-grid tbody tr:first td"), function(e,i){
	// 		$( $(".main-grid th")[i] ).css({
	// 			'width' : $(e).outerWidth(),
	// 			'margin':0, 
	// 		});
		
	// 	});

	// 	$(".main-grid thead").css({
	// 		"top":$(".toolbar").outerHeight() + 10,
	// 		"left":$(".toolbar").position().left,
	// 		"width":$(".tg").width()+1,
	// 	});
		
	// 	$(".main-grid").css({
	// 		"margin-top" : $(".main-grid thead").height(),
	// 	});
	// }
	
	$(document).on('gridRendered allocateStaff',function(){
		// matchhead();
		drawerit();
	});

	// var pos = 0;
	// $(".drawerit").click(function(){
	// 	if(pos){ 
	// 		$(document).scrollTop($(document).scrollTop() || pos);
	// 		pos = 0;
	// 	}else{
	// 		pos=$(document).scrollTop();
	// 		$(document).scrollTop(0);
	// 	}
	// });
	
	$(window).resize(function() {
		// matchhead();
	});
	
	$(document).on("scroll",function(ev){
		// drawerit();
	});

});