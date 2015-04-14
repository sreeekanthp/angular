var Staffs = Backbone.Collection.extend({
    model: Staff,
    url:'staffs'
});
var Shifts = Backbone.Collection.extend({
    model:Shift,
    url:'shifts'
});
var Categories = Backbone.Collection.extend({
    model:Category
});
var Centres = Backbone.Collection.extend({
    model:Centre
});
var UQuals = Backbone.Collection.extend({
    model:UQual
});
var _bg = Backbone.Model.extend({
    urlRoot:'/timesheets/badges'
});
var aBadges = Backbone.Collection.extend({
    model:_bg
})
$.fn.serializeObject = function() {
    /*console.log($(this).formSerialize());*/
    var o = {};
    var a = this.serializeArray();
    console.log(a);
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    console.log(o);
    return o;
};