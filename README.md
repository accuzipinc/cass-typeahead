## AccuZIP CASS Typeahead Samples

Below is a list of sample implementations of our address typeahead component.  [jQuery](http://jquery.com) is the only external dependency.  To use this on your own site, contact sales@accuzip.com to get your own API Key.

### Simple with Auto CASS on Address1

A basic example with a typeahead address input and automatic parsing of the response into their specific address input fields, with the addition of autoCass=address2.  With this option, CASS will be performed more after entering address2 information.

Code Snippet:
```javascript
$("#input-address").accuzipTypeAhead({
	apiKey: "YOUR-API-KEY",
	dataKey: "shipping",
	autoCass: "address2"
})
```

[Full Example Demo](simple.html)


### Simple with Auto CASS on Address1 and Address2

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


### Simple with Auto CASS off

A basic example with a typeahead address input and automatic parsing of the response into their specific address input fields, without autoCass. The user can click the CASS Validate button to perform the CASS.

Code Snippet:
```javascript
$("#input-address").accuzipTypeAhead({
	apiKey: "YOUR-API-KEY",
	dataKey: "shipping",
	autoCass: "off"
})
```

[Full Example Demo](simple-autocass.html)
