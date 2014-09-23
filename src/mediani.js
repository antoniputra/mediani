if (typeof jQuery === 'undefined') { throw new Error('Mediani Js requires jQuery') };

/*bootstrap detection
var bootstrap3_enabled = (typeof $().emulateTransitionEnd == 'function');*/

// IIFE - Immediately Invoked Function Expression
;(function(mediani) {

    // The global jQuery object is passed as a parameter
    mediani(window.jQuery, window, document);

}(function($, window, document) {

    /* === Helper Var === */
    var callerTemplate = 
            '<div class="input-group">\n '+
            '   <span class="input-group-btn">\n '+
            '       <a class="btn btn-default" id="{id}" >Browse Media </a>\n '+
            '   </span>\n '+
            '   <input type="text" id="{input_caller_id}" class="form-control" disabled>\n '+
            '</div>',

        modalTemplate = 
            '<div id="{id}">\n '+
            '   <div class="modal-dialog modal-lg">\n '+
            '       <div class="modal-content">\n '+
            '           <div class="modal-header">\n '+
            '               <a id="{close_id}" class="close">&times;</a>\n '+
            '               <h4 class="modal-title">{title}</h4>\n '+
            '           </div>\n '+
            '           <div id="{content_id}" class="modal-body row"></div>\n '+
            '       </div>\n '+
            '   </div>\n '+
            '</div>',
        simpleTemplate = 
            '<div class="col-md-3">\n '+
            '   <a class="thumbnail files" data-url="{image_url}">\n '+
            '       <img src="{image_url}" style="height:{image_height};" />\n '+
            '   </a>\n '+
            '</div>',
        complexTemplate = 
            '<div class="col-md-3">\n '+
            '   <a class="thumbnail files" data-url="{image_url}">\n '+
            '       <img src="{image_url}" style="height:{image_height};" />\n '+
            '       <div class="caption">\n'+
            '           <h4 style="font-size:15px; margin-bottom:5px; font-weight:bold;">{image_caption}</h4>\n'+
            '           <p style="font-size:12px;">{image_description}</p>\n'+
            '       </div>\n'+
            '   </a>\n '+
            '</div>',
        uniqId = function () {
            return Math.round(new Date().getTime() + (Math.random() * 100));
        };
    /* === End Helper Var === */

    var Mediani = function(element, options) {
        this.$element = $(element);
        this.$element.attr('id', this.$element.attr('name') +'_'+ uniqId());
        this.run(options);
    };

    Mediani.DEFAULTS = {
        callerTemplate: callerTemplate,
        modalTemplate: modalTemplate,
        medianiType: "simpleTemplate",

        url: null,
        urlParam: null
    };

    Mediani.prototype = {
        constructor: Mediani,
        run: function(options)
        {
            var self = this;
            self.options        = options;
            self.templateType   = null;
            self.getFullUrl     = self.getFullUrl();
            self.$btnCaller     = null;
            self.$inputCaller   = null;

            self.$modal         = null;
            self.$modalBtnClose = null;
            self.$modalContent  = null;

            self.templateType   = self.getTemplateType(options.medianiType);

            self.renderTemplate();
            self.listen();
        },
        getTemplateType: function(type)
        {
            switch (type) {
                case "simpleTemplate":
                    return simpleTemplate;
                break;
                case "complexTemplate":
                    return complexTemplate;
                break;
                default:
                    return type;
            }
        },
        renderTemplate: function()
        {
            var self = this, $el = self.$element, options = self.options;
            
            btnCallerId     = "browse_btn_"+ $el.attr('id');
            inputCallerId   = "input_caller_"+ $el.attr('id');
            callerTemplate  = options.callerTemplate
                .replace('{id}', btnCallerId)
                .replace('{input_caller_id}', inputCallerId);

            modalId         = "modal_"+ $el.attr('id');
            modalBtnCloseId = "btnClose_"+ $el.attr('id');
            modalContentId  = "content_"+ $el.attr('id');
            modalTemplate   = options.modalTemplate
                .replace('{id}', modalId)
                .replace('{close_id}', modalBtnCloseId)
                .replace('{content_id}', modalContentId)
                .replace('{title}', 'Select Media');

            $el.css('display', 'none')
                .after(callerTemplate)
                .after(modalTemplate);
            
            self.$btnCaller     = $("#"+ btnCallerId);
            self.$inputCaller   = $("#"+ inputCallerId);

            self.$modal         = $("#"+ modalId);
            self.$modalBtnClose = $("#"+ modalBtnCloseId);
            self.$modalContent  = $("#"+ modalContentId);

            self.$modal.css({
                position: 'fixed',
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
                overflow: 'hidden',
                'z-index': '1050'
            }).hide();
        },
        listen: function()
        {
            var self = this, options = self.options, $el = self.$element, $btnCaller = self.$btnCaller, $inputCaller = self.$inputCaller, $modal = self.$modal, $modalBtnClose = self.$modalBtnClose, $modalContent = self.$modalContent;

            if ( !$btnCaller || !$modal ) {
                this.renderTemplate();
            }

            function appendFile()
            {
                value = $(this).data('url');
                $el.attr('value', value);
                $inputCaller.attr('value', value);
                return closeModal();
            }

            function renderModalContent(data)
            {
                template = "";
                if ( $.isEmptyObject(data) ) {
                    template = "<p class='text-center'>Data tidak ada</p>";
                } else {
                    $.each( data, function(key, value) {

                        if (typeof value.file == "undefined")
                        {
                            file = value, caption = '', description = '';
                        } else {
                            file = value.file, caption = value.caption, description = value.description;
                        }

                        template += self.templateType
                            .split('{image_url}').join(file)
                            .replace('{image_height}', '120px')
                            .replace('{image_caption}', caption)
                            .replace('{image_description}', description);
                    });
                }
                return template;
            }

            function showModal()
            {
                $modal.fadeIn('fast');

                loadApi = $.ajax({
                    url: options.url,
                    data: options.urlParam,
                    cache: false,
                    type: "GET"
                });

                loadApi.fail(function(data, status)
                {
                    console.log('Couldn\'t Request to : ' + self.getFullUrl);
                    $modalContent.html('Something went wrong');
                });

                loadApi.success(function(data, status)
                {
                    $modalContent.html(renderModalContent(data));
                    $('.files').bind('click', appendFile);
                });
            }

            function closeModal()
            {
                $modal.fadeOut('fast');
            }

            $btnCaller.bind('click', showModal);
            $modalBtnClose.bind('click', closeModal);
        },

        getFullUrl: function()
        {
            var self = this, options = self.options;
            return options.url + options.urlParam;
        }
    };

    // Definition
    $.fn.mediani = function(option)
    {
        return this.each(function() {
            var $this   = $(this),
                data     = $this.data('mediani'),
                options  = $.extend({}, Mediani.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('mediani', (data = new Mediani(this, options)))
            }
        });
    };

}));