/**
 * Created by championswimmer on 9/6/15.
 */

function DateUtils () {}

DateUtils.getHourMin = function (timestamp) {
        var date = new Date(timestamp);
        var hour = date.getHours();
        hour = (hour>=10?hour:'0'+hour);
        var min = date.getMinutes();
        min = (min>=10?min:'0'+min);
        return (hour + ':' + min);
};

DateUtils.DateDiff = {
        inDays: function(ts1, ts2) {
                var d1 = new Date(ts1);
                var d2 = new Date(ts2);
                var t2 = d2.getTime();
                var t1 = d1.getTime();
                return parseInt((t2-t1)/(24*3600*1000), 10);
        },
        inWeeks: function(ts1, ts2) {
                var d1 = new Date(ts1);
                var d2 = new Date(ts2);
                var t2 = d2.getTime();
                var t1 = d1.getTime();

                return parseInt((t2-t1)/(24*3600*1000*7), 10);
        }
};

function SortUtils () {}

SortUtils.sortBy = function(field, reverse, primer){

        var key = primer ?
            function(x) {return primer(x[field]);} :
            function(x) {return x[field];};

        reverse = !reverse ? 1 : -1;

        return function (a, b) {
                return a = key(a), b = key(b), 
                        reverse * ((a > b) - (b > a));
        };
};


