// (Non-JSDoc3 data):
// icsGen, a generator for .ics files written in javascript with an optional php backend.
// Edited by GameplayJDK (https://github.com/GameplayJDK); Repository can be found at https://github.com/GameplayJDK/icsGen.
// Please report bugs or feature requests to https://github.com/GameplayJDK/icsGen/issues.
// Forked from icsFormatter (https://github.com/matthiasanderer/icsFormatter) which was originally forked from ics.js (https://github.com/nwcell/ics.js).

/**
 * icsGen, a generator for .ics files written in javascript with an optional php backend.
 * @see {@link https://github.com/GameplayJDK/icsGen/blob/master/README.md README.md} for a detailed description.
 * @file Holds the icsGen source code
 * @author GameplayJDK <github@gameplayjdk.de>
 * @version 1.0
 * @todo (GameplayJDK): Add support for more stuff from the .ics spec?
 */
var icsGen = function () {
    'use strict';

    // IE is supported if the php backend is used, other wise, you should uncomment the 4 lines below:
    //if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') === -1) {
    //    window.console.log('Unsupported Browser');
    //    return;
    //}

    /**
     * Generates a unique identifier (UID)
     * @return {string} UID
     */
    var UID = function (length) {
        var chars = "abcdefghijklmnopqrstuvwxyz0123456789_",
            inString = "icsGen".toLowerCase(),
            outString = "",
            i;
        while (inString.length < length) {
            inString += inString;
        }
        for (i = 0; i < length; i += 1) {
            outString += chars.charAt(chars.indexOf(inString.charAt(i)));
        }
        return (outString);
    },
        SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n',
        events = [],
        calendarEvents = [],
        calendarStart = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0'
        ].join(SEPARATOR),
        /**
         * @todo (GameplayJDK): Add support for timezones
         */
        calendarTimezone = [
        ],
        calendarEnd = 'END:VCALENDAR';

    return {
        /**
         * Returns raw events array (raw)
         * @return {array} Raw events
         */
        'eventsRaw': function () {
            return calendarEvents;
        },

        /**
         * Returns events array (object)
         * @return {array} Events
         */
        'events': function () {
            return events;
        },


        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function () {
            return [calendarStart, calendarTimezone, calendarEvents.join(SEPARATOR), calendarEnd].join(SEPARATOR);
        },

        'addEvent': function (session) {
            var calendarEvent = [
                'BEGIN:VEVENT',
                'UID:' + session.uid,
                'CLASS:PUBLIC',
                'DESCRIPTION:' + session.description,
                'DTSTART;VALUE=DATETIME:' + session.begin,
                'DTEND;VALUE=DATE:' + session.stop,
                'LOCATION:' + session.location,
                'SUMMARY;LANGUAGE=en-us:' + session.subject,
                'TRANSP:TRANSPARENT',
                'END:VEVENT'
            ].join(SEPARATOR);

            var event = {
                "uid": session.uid,
                "description": session.description,
                "start": session.start,
                "end": session.end,
                "location": session.location,
                "subject": session.subject
            };

            events.push(event);
            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using dlh.php
         * @param  {string} [filename=calendar]  Filename
         * @param  {string} [ext=js]             Extention
         * @param  {string} [dlh=./dlh.php]      Path to the dlh.php file
         */
        'download': function (filename, ext, dlh) {
            if (calendarEvents.length < 1) {
                return false;
            }

            filename = (typeof filename !== 'undefined') ? filename : 'calendar';
            ext = (typeof ext !== 'undefined') ? ext : '.ics';
            dlh = (typeof dlh !== 'undefined') ? dlh : './dlh.php';
            var calendar = [calendarStart, calendarTimezone, calendarEvents.join(SEPARATOR), calendarEnd].join(SEPARATOR);

            if (!dlh) {
                window.open("data:text/calendar;charset=utf8," + encodeURIComponent(calendar));
            } else {
                window.location = encodeURI(dlh) + "?f=" + encodeURIComponent(filename + "." + ext) + "&t=" + encodeURIComponent(calendar);
            }
        }
    };
};

window.ics = icsGen;
