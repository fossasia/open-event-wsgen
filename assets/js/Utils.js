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

