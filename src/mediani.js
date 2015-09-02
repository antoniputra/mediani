if (typeof jQuery === 'undefined') { throw new Error('Mediani Js requires jQuery') };

(function ( $ ) {

	var defaultItemTemplate = 
	    '<a class="thumbnail mediani-item" style="display: inline-block; width: 200px; height: 300px; overflow: hidden;">\n '+
	    '	<img src="<%=image_url%>" />\n '+
	    '	<div class="caption text-left"> \n '+
	    '		<h3><%=title%></h3> \n '+
	    '		<p><%=description%></p> \n '+
	    '	</div> \n '+
	    '</a>',

	    defaultButton = 
	    '<a class="btn btn-primary mediani-button"> \n '+
	    '	Browse \n '+
	    '</a>',

	    defaultPreview = 
		'<div class="input-group mediani-preview"> \n '+
		'	<span class="input-group-btn"> \n '+
		'		'+ defaultButton +' \n '+
		'	</span> \n '+
		'	<input type="text" class="form-control mediani-result" placeholder="Browse mediani first..."> \n '+
		'</div>';


	/**
	 * Mediani object
	 * 
	 * @param  elem    [description]
	 * @param  object options [description]
	 * @return void
	 */
	var Mediani = function(elem, options)
	{
		self = this;
		this.$elem = elem;
		this.options = options;

		this.render();
	};


	/**
	 * Mediani Object Extend
	 * 
	 * @type {Object}
	 */
	Mediani.prototype = {

		/**
		 * Create uniq id
		 * 
		 * @return string
		 */
		createUniqId: function ()
		{
            return Math.round(new Date().getTime() + (Math.random() * 100));
        },

        /**
         * Show modal
         * 
         * @return $('elem')
         */
         showModal: function()
         {
         	self = this;
         	$modal = $(self.options.template.modal);
         	$modal.modal('show');
         	self.getModalContent().html(self.options.template.loading);

         	loadApi = $.ajax(self.options.apiUrl, {
                data: self.options.apiUrlParams || '',
                cache: false,
                type: 'GET'
            });

            loadApi.fail(function(data, status)
            {
                console.log('Couldn\'t Request to : ' + self.options.apiUrl);
                self.getModalContent().html('Something went wrong');
            });

            loadApi.success(function(data, status)
            {
            	self.getModalContent().html('');
            	self.renderItem(data);
            });
         },

         /**
          * Render item template
          * 
          * @param  {object} data result from api
          * @return mix string|void
          */
         renderItem: function(data)
         {
         	self = this;
			if ( typeof data !== 'object' || $.isEmptyObject(data) ) {
				nodata = "<p class='text-center'>Data tidak ada</p>";
				return self.getModalContent().append(nodata);
			}
				
			item = self.options.template.item;
			$content = self.getModalContent();

			$.each(data, function(key, value)
			{
				elItem = tmpl(item, value);

				$elItem = $(elItem);
				$elItem.attr('data-value', value[self.options.resultNode]);
				
				// attach an event 
				$(".mediani-modal").on('click', '.mediani-item', function (e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					self.selectSingleItem($(this));
				});

				$content.append($elItem);
			});
         },

         /**
          * Handle when user selecting an item
          * 
          * @param  objects item
          * @return void
          */
         selectSingleItem: function(item)
         {
         	self = this;
         	// console.log('hello '+ item.data('value'));
         	self.$elem.attr('value', item.data('value'));
         	
         	// add html result to selector element
         	if (self.options.template.preview)
         	{
         		self.options.template.preview.html(item);
         	}
         	else
         	{
         		self.$elem.css({position: 'relative', visibility: 'visible'}).attr({readonly: "1"});
         	};

         	$modal = $(self.options.template.modal);
         	$modal.modal('hide');
         },

         /**
          * Get modal content
          * 
          * @return $()
          */
         getModalContent: function()
         {
         	return $(this.options.template.content);
         },

        /**
         * Render template
         * 
         * @return void
         */
        render: function()
        {
        	self = this;

        	// hidden the element
        	self.$elem.css({position: 'absolute', visibility: 'hidden'});
        	
        	// 2 initialize all template
        	button = $(self.options.template.button);
        	self.$elem.after(button);

    		// 3 attach event to each template
    		button.on('click', function(e) { // <--- this way the event is attached to the right element
    			e.preventDefault();
				e.stopImmediatePropagation();
				this.showModal();
			}.bind(self));
        }
	}
 

 	/**
 	 * Jquery Widget
 	 * 
 	 * @param  object options
 	 * @return this
 	 */
    $.fn.mediani = function(options)
    {
    	/**
		 * Default options
		 * 
		 * @type {Object}
		 */
		var default_options = {
			apiUrl: '', // always loaded from user options
			apiUrlParams: '', // always loaded from user options
			resultNode: 'title',
			template: {
				modal: '.mediani-modal',
				content: '.mediani-modal-content',
				button: defaultButton,
				preview: '',
				loading: '<p class="loading text-center">Loading</p>',
				// container: '',
				item: defaultItemTemplate
			}
		};

		// set result node
		if ( ! $.isEmptyObject(options.resultNode)) {
			default_options.resultNode = options.resultNode;
		};

		// set item template
		if ( ! $.isEmptyObject(options.setItemTemplate)) {
			default_options.template.item = options.setItemTemplate;
		};

		// set button
		if ( ! $.isEmptyObject(options.setButton)) {
			default_options.template.button = options.setButton;
		};

		// set preview
		if ( ! $.isEmptyObject(options.setPreview)) {
			default_options.template.preview = options.setPreview;
		};

		// set loading
		if ( ! $.isEmptyObject(options.setLoading)) {
			default_options.template.loading = options.setLoading;
		};

    	options = $.extend({}, default_options, options);

    	// console.log('Options data : ', options);

    	return this.each(function() {
    		new Mediani($(this), options);
    	});
    };



	var cache = {};

	tmpl = function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
		cache[str] = cache[str] ||
		tmpl(document.getElementById(str).innerHTML) :

		// Generate a reusable function that will serve as a template
		// generator (and which will be cached).
		new Function("obj",
		"var p=[],print=function(){p.push.apply(p,arguments);};" +

		// Introduce the data as local variables using with(){}
		"with(obj){p.push('" +

		// Convert the template into pure JavaScript
		str
		.replace(/[\r\t\n]/g, " ")
		.split("<%").join("\t")
		.replace(/((^|%>)[^\t]*)'/g, "$1\r")
		.replace(/\t=(.*?)%>/g, "',$1,'")
		.split("\t").join("');")
		.split("%>").join("p.push('")
		.split("\r").join("\\'")
		+ "');}return p.join('');");

		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
 
}( jQuery ));