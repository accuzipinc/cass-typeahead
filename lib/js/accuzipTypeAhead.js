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
        containerClass: 'az-suggestions',
        selectedClass: 'az-selected',
        suggestionClass: 'az-suggestion',
        throttleMs: 300,
        geoBias: true,
        selectCallback: null,
        mixedCase: true,
        autoCass: false,
        dataKey: "accuzip"
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
            that.focusAddress2 = true;
            if(that.options.autoCass){
                //Prepare the CASS request and run it
                var address1 = selection.data.address_main;
                var address2 = null; //address2 is only included after the user types it in
                var city = selection.data.city;
                var state = selection.data.state;
                var zip =  null; //zip is only included after the user types it in
                var country = selection.data.country;
                if(!city && !state){
                    address2 = selection.data.address_secondary;
                    zip = "";
                }
                that.cass(address1, address2, city, state, zip, country, that.options.selectCallback);
            }
            else{
                //Parse the typeahead results only
                $('[data-' + that.options.dataKey + '-address]').val(selection.data.address_main);
                $('[data-' + that.options.dataKey + '-city]').val(selection.data.city);
                $('[data-' + that.options.dataKey + '-state]').val(selection.data.state);
                if(that.focusAddress2){
                    $('[data-' + that.options.dataKey + '-address2]').focus();
                }
            }

        }, this.options.throttleMs);


        /*
        *  Default callback if not overridden
        */
        var cassSelectCallback = function(response) {
            if(response.success && (response.Addr_Result[0].addon || response.Addr_Result[0].county_no)){
                var cassAddress = response.Addr_Result[0];
                console.log(cassAddress)
    
                var zip = cassAddress.zipc;
                if(cassAddress.addon){
                    zip += "-" + cassAddress.addon;
                }
                
                var address1 = cassAddress.mpnum + 
                                (cassAddress.pre_di ? " " + cassAddress.pre_di : "") +
                                " " + cassAddress.str_name +
                                (cassAddress.suffix ? " " + cassAddress.suffix : "") +
                                (cassAddress.post_dir ? " " + cassAddress.post_dir : "");
                var address2 = (cassAddress.unit ? cassAddress.unit : "") +
                                (cassAddress.unit && cassAddress.msnum ? " " + cassAddress.msnum : 
                                                    cassAddress.msnum ? cassAddress.msnum : "");
    
                $('[data-' + that.options.dataKey + '-address]').val(address1);
                $('[data-' + that.options.dataKey + '-address2]').val(address2);
                $('[data-' + that.options.dataKey + '-city]').val(cassAddress.dctys);
                $('[data-' + that.options.dataKey + '-state]').val(cassAddress.dstaa);
                $('[data-' + that.options.dataKey + '-zip]').val(zip);
                if(that.focusAddress2){
                    $('[data-' + that.options.dataKey + '-address2]').focus();
                }
            }
        };

        if(!this.options.selectCallback){
            this.options.selectCallback = cassSelectCallback;
        }


        /*
        *  Handle changes to address2
        */
        var address2Callback = debounce(function() {
            //Prepare the CASS request and run it
            var address1 = $('[data-' + that.options.dataKey + '-address]').val();
            var address2 = $('[data-' + that.options.dataKey + '-address2]').val();
            var city = $('[data-' + that.options.dataKey + '-city]').val();
            var state = $('[data-' + that.options.dataKey + '-state]').val();
            var zip =  $('[data-' + that.options.dataKey + '-zip]').val();
            that.focusAddress2 = false;
            that.cass(address1, address2, city, state, zip, null, that.options.selectCallback);
        }, this.options.throttleMs);

        var address2Input = $('[data-' + this.options.dataKey + '-address2]');
        if(address2Input.length){
            address2Input.blur(address2Callback);
        }

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




    /*
    *  Can pass just address_main and address_secondary, or individual parts.
    *  If only passinga address_main and address_secondary, address_secondary is city+state or city+state+zip
    *  If passing all values, address_secondary is address2, like Unit or Apt info.
    *
    */
    AZTypeAhead.prototype.cass = function(address_main, address_secondary, city, state, zip, country, cassCallback) {
        var requestJSON = {
            API_KEY: this.options.apiKey,
            AZSetQuery_iadl1: address_main,
            AZSetQuery_ictyi: address_secondary
        }

        if(city && state){
            requestJSON.AZSetQuery_iadl1 = address_main + (address_secondary ? " " + address_secondary : "")
            requestJSON.AZSetQuery_ictyi = city;
            requestJSON.AZSetQuery_istai = state;
        }

        if(zip){
            requestJSON.AZSetQuery_izipc = zip;
        }

        if(country){
            requestJSON.AZSetQuery_icountry = country;
        }


        if(this.options.mixedCase){
            requestJSON.MIXEDCASE = "1";
        }
        
        $.ajax({
            url : this.baseURL + '/ws_validate',
            type: "POST",
            data: JSON.stringify(requestJSON),
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