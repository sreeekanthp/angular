$(function(){
        $('.drawerit').on('click',function(){
            if($(this).parent().parent().css('right') == '0px')
            {
                $(this).parent().parent().css('right','-522px');
                $('body').css('overflow-y','auto');
                /*$('.table-container').show();*/
                $('.slide-menu-overlay').hide();
            }
              else
            {
                $('.slide-menu-overlay').show();
                $(this).parent().parent().css('right','0px');
                $('.slide-menu-overlay').css('height', $(document).height());
                $('body').css('overflow-y','auto');
               /* $('.table-container').hide();*/
            }

        });
        $('.slide-menu-overlay').on('click',function(){
            $('.drawerit').trigger('click');
        });
        
});