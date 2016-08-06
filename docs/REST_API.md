# REST API

### Endpoints
```
POST /generate 
```

**Parameters `(x-www-form-urlencoded)` or `json`**

| Parameter  | Description | Purpose | 
|---         |---          |---      |
|name|(required) Name of the webapp   | Unique name of the webapp|
|email|(required) Your email id | We will send a email to this when your webapp is ready|
|datasource | (required) Either `jsonupload` or `eventapi` | |
|apiendpoint| (if datasource = eventapi) API endpoint url | |

