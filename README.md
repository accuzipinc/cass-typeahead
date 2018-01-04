## AccuZIP CASS Typeahead
Below is a list of sample implementations of our address typeahead component.  [jQuery](http://jquery.com) is the only external dependency.  To use this on your own site, contact sales@accuzip.com to get your own API Key.


### Overview
Code Snippet:
```javascript
$("#input-address").accuzipTypeAhead(options)
```

### Options
| Setting | Default | Description |
| :--- | :--- | :--- |
| `apiKey` | `null` | Your API Key provided by AccuZIP.  Contact sales@accuzip.com for your key. |
| `dataKey` | `accuzip` | Your inputs should have properties in the format of "data-" + dataKey + "-" + inputType.  That allows you to have multiple AccuZIP Typeahead components on the same input form for billing/shipping/etc. |
| `autoCass` | `off` | Control when CASS happens. `off` will disable it and you'll need to call CASS on your own. `addresses` will CASS automatically after selecting a value from Address1, or leaving the Address2 input.  `address2` will CASS automatically only after leaving the Address2 input |
| `mixedCase` | `true` | Have the CASS results use mixed case instead of upper case |
| `geoBias` | `true` | Use a geographical biases on the typeahead results. |
| `ip` | `null` | if `geoBias` is true, you may optinoally pass in the IP to be used for the geographical biases.  If you don't pass it, we will get it automatically |
| `latitude` | `null` | if `geoBias` is true, you may optinoally pass in the latitude to be used for the geographical biases |
| `longitude` | `null` | if `geoBias` is true, you may optinoally pass in the longitude to be used for the geographical biases |
| `throttleMs` | `300` | The number of milliseconds to throttle the typeahead results.  Prevents from calling too often if the user is a fast typer |


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

[Full Example Demo](simple-button.html)
