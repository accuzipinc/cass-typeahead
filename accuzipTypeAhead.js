// Expose plugin as an AMD module if AMD loader is present:
(function ($) {
    'use strict';

    function AZTypeAhead(el, clientOptions){
        this.baseURL = 'https://template.cassonline.com/servoy-service/rest_ws/ws_address';
        this.options = $.extend({}, AZTypeAhead.defaults, clientOptions);
        this.element = el;
        this.el = $(el);
        this.init();
    }


    AZTypeAhead.defaults = {
        apiKey: null,
        ip: null,
        latitude: null,
        longitude: null,
        elementSelector: ".az-typeahead",
        containerClass: 'az-suggestions',
        selectedClass: 'az-selected',
        suggestionClass: 'az-suggestion',
        throttleMs: 300,
        geoBias: true,
        cassCallback: cassCallback
    };

    /*
    *  Default callback if not overridden
    */ 
    function cassCallback(response){
        if(response.success){
            var cassAddress = response.Addr_Result[0];
            console.log(cassAddress)

            var zip = cassAddress.zipc;
            if(cassAddress.addon){
                zip += "-" + cassAddress.addon;
            }
            $('[data-accuzip-address]').val(cassAddress.dadl1);
            $('[data-accuzip-city]').val(cassAddress.dctys);
            $('[data-accuzip-state]').val(cassAddress.dstaa);
            $('[data-accuzip-zip]').val(zip);
            $('[data-accuzip-address2]').focus();
        }
    };

    /*
    * debounce from Underscore.js
    */
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };


    AZTypeAhead.prototype.init = function() {
        var that = this; //handle back to sub functions

        /*
        * Get the suggestion results from AccuZIP Autocomplete Web Service
        */
        var fetchResults = debounce(function(query, done){
            //You may also pass the IP Address of the user in the place of latitude and omit longitude and the service will determine their location
            var url = that.baseURL + '/ws_autocomplete/' + that.options.apiKey + "/" + query;
            if(that.options.ip){
                url += "/" + that.options.ip;
            }
            else if(that.options.latitude && that.options.longitude){
                url += "/" + that.options.latitude + "/" + that.options.longitude;
            }

            $.get(url, function(response) {
                if(response.success && response.data.length){
                    var formattedResponse = { 
                        suggestions: $.map(response.data, function(dataItem) {
                            return { value: dataItem.value, data: dataItem };
                        })
                    };
                    done(formattedResponse);
                }
            });
        }, this.options.throttleMs);

        /*
        * Handle the selection callback.  
        * CASS the selection
        */
        var selectCallbackAZ =  debounce(function(selection){
            that.cass(selection.data.address_main, selection.data.address_secondary, selection.data.country, that.options.cassCallback);
        }, this.options.throttleMs);

        /*
        * Only used if not passing the IP to the service
        * Get the users general location info for geographical biases on results.
        */
        if(this.options.geoBias && !this.options.ip){
            $.get('https://freegeoip.net/json/', function(response) {
                if(response && response.latitude && response.longitude){
                    that.options.latitude = response.latitude;
                    that.options.longitude = response.longitude;
                }
            });
        }

        this.el.devbridgeAutocomplete({
            lookup: function(query,done){
                fetchResults(query, done);
            },
            containerClass: 'az-suggestions',
            selectedClass: 'az-selected',
            suggestionClass: 'az-suggestion',
            onSelect: selectCallbackAZ
        });
    };




    AZTypeAhead.prototype.cass = function(address_main, address_secondary, country, cassCallback) {
        $.ajax({
            url : this.baseURL + '/ws_validate',
            type: "POST",
            data: JSON.stringify({
                API_KEY: this.options.apiKey,
                AZSetQuery_iadl1: address_main,
                AZSetQuery_ictyi: address_secondary,
                AZSetQuery_icountry: country
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response){
                cassCallback(response);
            }
        });
    }

    $.fn.accuzipTypeAhead = function(options) {
        var dataKey = 'accuzipTypeAhead';
        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new AZTypeAhead(this, options);
                inputElement.data(dataKey, instance);
            }
        });
 
    };

}( jQuery ));