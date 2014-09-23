Mediani.js
==========

Mediani is Plugin Simple Media Manager built with [jQuery](http://jquery.com), which by utilizing the JSON data and translate it to be popup interface.

## Installation
with bower :
```
bower install mediani
```

## Usage
Using Mediani.js is quite simple, just add the `JSON Data` url you wish to load to a `data-url` attribute.

```html
<html>
<head>
    
    <!-- load bootstrap.css -->
    <link rel="stylesheet" type="text/css" href="path/to/bootstrap.min.css">
    
    <!-- load jquery -->
    <script src="path/to/jquery.min.js"></script>
    
    <!-- load mediani.js-->
    <script src="path/to/mediani.min.js" type="text/javascript"></script>
    
    <!-- set-up mediani.js by element class -->
    <script type="text/javascript">
    	$(function() {
    	    $('.examplecok').mediani();
    	});
    </script>
    
</head>
<body>
    
    <!-- your media input text -->
    <input type="text" name="profile_picture" class="form-control examplecok" data-url="http://domain.com/image/files.json" />

</body>
</html>
```
