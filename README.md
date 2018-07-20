## AccuZIP CASS Typeahead Samples
Below is a list of sample implementations of our address typeahead component.  [jQuery](http://jquery.com) and our [jQuery-Autocomplete fork](https://github.com/accuzipinc/jQuery-Autocomplete/blob/master/dist/jquery.autocomplete.az.min.js) the only external dependencies.  To use this on your own site, contact sales@accuzip.com to get your own API Key.

If you would prefer to build your own front-end component and just use our backend API calls, the documentation for that is available in our [Postman Documentation](https://documenter.getpostman.com/view/265468/RWMFrnop)

### Sample with Auto CASS off

A basic example with a typeahead address input and automatic parsing of the response into their specific address input fields, without autoCass. The user can click the CASS Validate button to perform the CASS.

Code Snippet:
```javascript
$("#input-address").accuzipTypeAhead({
	apiKey: "YOUR-API-KEY",
	dataKey: "shipping",
	autoCass: "off"
})
```

[Full Example Demo](simple-button.html)


### Sample with Auto CASS on Address1

A basic example with a typeahead address input and automatic parsing of the response into their specific address input fields, with the addition of autoCass=address2.  With this option, CASS will be performed more after entering address2 information.  This options also shows all possible input fields for international addresses.

Code Snippet:
```javascript
$("#input-address").accuzipTypeAhead({
	apiKey: "YOUR-API-KEY",
	dataKey: "shipping",
	autoCass: "address2"
})
```

[Full Example Demo](simple.html)


### Sample with Auto CASS on Address1 and Address2

A basic example with a typeahead address input and automatic parsing of the response into their specific address input fields, with the addition of autoCass=addresses.  With this option, CASS will be performed more frequently (after the selection of an address, and after entering address2 information), using more API credits, but may provide for a more seamless user experience.  Without autoCass, CASS is only performed after leaving the address2 input.

Code Snippet:
```javascript
$("#input-address").accuzipTypeAhead({
	apiKey: "YOUR-API-KEY",
	dataKey: "shipping",
	autoCass: "addresses"
})
```

[Full Example Demo](simple-autocass.html)
