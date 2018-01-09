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
        autoCass: "off",
        dataKey: "accuzip",
        countries: "us|pr|vi|gu|ca"
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
            var url = that.baseURL + '/ws_autocomplete/' + that.options.apiKey + "/" + query + "/" + that.options.countries;
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
            if(that.options.autoCass == "addresses"){
                //Prepare the CASS request and run it
                that.address.loadFromSelection(selection);
                that.cass(that.address, that.options.selectCallback);
            }
            else{
                //Parse the typeahead results only
                that.address.loadFromSelection(selection);
                that.address.setInputs();
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
    
                that.address.loadFromCASS(cassAddress);
                that.address.setInputs();
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
            that.address.loadFromInputs();
            that.focusAddress2 = false;
            that.cass(that.address, that.options.selectCallback);
        }, this.options.throttleMs);

        var address2Input = $('[data-' + this.options.dataKey + '-address2]');
        if(address2Input.length && (that.options.autoCass == "addresses" || that.options.autoCass == "address2" )){
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

        this.address = new AZAddress(this.options);
    };




    /*
    *  Can pass just address_main and address_secondary, or individual parts.
    *  If only passinga address_main and address_secondary, address_secondary is city+state or city+state+zip
    *  If passing all values, address_secondary is address2, like Unit or Apt info.
    *
    */
    AZTypeAhead.prototype.cass = function(AZAddress, cassCallback) {
        //Allow defaults to be derived
        if(!cassCallback){
            cassCallback = this.options.selectCallback;
        }

        var requestJSON = {
            API_KEY: this.options.apiKey,
            AZSetQuery_iadl1: AZAddress.address1,
            AZSetQuery_ictyi: AZAddress.address2
        }

        if(AZAddress.company){
            requestJSON.AZSetQuery_iadl2 = AZAddress.company;
        }

        if(AZAddress.city && AZAddress.state){
            requestJSON.AZSetQuery_iadl1 = AZAddress.address1; //address_main + (address_secondary ? " " + address_secondary : "");
            requestJSON.AZSetQuery_iadl3 = AZAddress.address2;
            requestJSON.AZSetQuery_ictyi = AZAddress.city;
            requestJSON.AZSetQuery_istai = AZAddress.state;
        }

        if(AZAddress.zip){
            requestJSON.AZSetQuery_izipc = AZAddress.zip;
        }

        if(AZAddress.urban){
            requestJSON.AZSetQuery_iprurb = AZAddress.urban;
        }

        if(AZAddress.country){
            requestJSON.AZSetQuery_icountry = AZAddress.country;
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


    function AZAddress(options){
        this.company = null;
        this.address1 = null;
        this.address2 = null;
        this.city = null;
        this.state = null;
        this.zip = null;
        this.urban = null;
        this.country = null;
        this.options = options;
    }

    AZAddress.prototype.loadFromInputs  = function(){
        this.company = $('[data-' + this.options.dataKey + '-company]').length ? $('[data-' + this.options.dataKey + '-company]').val() : null;
        this.address1 = $('[data-' + this.options.dataKey + '-address]').val();
        this.address2 = $('[data-' + this.options.dataKey + '-address2]').val();
        this.city = $('[data-' + this.options.dataKey + '-city]').val();
        this.state = $('[data-' + this.options.dataKey + '-state]').val();
        this.zip =  $('[data-' + this.options.dataKey + '-zip]').val();
        this.urban = $('[data-' + this.options.dataKey + '-urban]').length ? $('[data-' + this.options.dataKey + '-urban]').val() : null;
        this.country = $('[data-' + this.options.dataKey + '-country]').length ? $('[data-' + this.options.dataKey + '-country]').val() : null;
    }

    AZAddress.prototype.loadFromSelection  = function(selection){
        //refresh from input data first
        this.loadFromInputs()

        this.address1 = selection.data.address_main;
        this.address2 = null; //address2 is only included after the user types it in
        this.city = selection.data.city;
        this.state = selection.data.state;
        this.zip =  null; //zip is only included after the user types it in
        this.country = selection.data.country;
        if(this.city && !this.state){
            this.address2 = selection.data.address_secondary;
            this.zip = "";
        }
    }

    AZAddress.prototype.loadFromCASS  = function(cassAddress){
        
        this.address1 = cassAddress.mpnum + 
                        (cassAddress.pre_di ? " " + cassAddress.pre_di : "") +
                        " " + cassAddress.str_name +
                        (cassAddress.suffix ? " " + cassAddress.suffix : "") +
                        (cassAddress.post_dir ? " " + cassAddress.post_dir : "");
        this.address2 = (cassAddress.unit ? cassAddress.unit : "") +
                        (cassAddress.unit && cassAddress.msnum ? " " + cassAddress.msnum : 
                                            cassAddress.msnum ? cassAddress.msnum : "");

        this.city = cassAddress.dctys;
        this.state = cassAddress.dstaa;

        this.zip = cassAddress.zipc;
        if(cassAddress.addon){
            this.zip += "-" + cassAddress.addon;
        }

        if(cassAddress.dprurb){
            this.urban = cassAddress.dprurb;
        }
        
        if(cassAddress.dadl2){
            this.company = cassAddress.dadl2;
        }
    }

    AZAddress.prototype.setInputs  = function(){
        if($('[data-' + this.options.dataKey + '-company]').length)
            $('[data-' + this.options.dataKey + '-company]').val(this.company);
         $('[data-' + this.options.dataKey + '-address]').val(this.address1);
         $('[data-' + this.options.dataKey + '-address2]').val(this.address2);
         $('[data-' + this.options.dataKey + '-city]').val(this.city);
         $('[data-' + this.options.dataKey + '-state]').val(this.state);
         $('[data-' + this.options.dataKey + '-zip]').val(this.zip);
         if($('[data-' + this.options.dataKey + '-urban]').length)
            $('[data-' + this.options.dataKey + '-urban]').val(this.urban);
         if($('[data-' + this.options.dataKey + '-country]').length)
            $('[data-' + this.options.dataKey + '-country]').val(this.country);
    }
    

    $.fn.accuzipTypeAhead = function(options) {
        var dataKey = 'accuzipTypeAhead';
        var inputElement = $(this),
        instance = inputElement.data(dataKey);

        instance = new AZTypeAhead(this, options);
        inputElement.data(dataKey, instance);

        return instance;
 
    };

}( jQuery ));