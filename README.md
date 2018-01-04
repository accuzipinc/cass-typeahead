# AccuZIP CASS Typeahead
See [https://accuzipinc.github.io/cass-typeahead/](https://accuzipinc.github.io/cass-typeahead/) for example usage.


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
