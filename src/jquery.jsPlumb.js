/*
 * jsPlumb
 * 
 * Title:jsPlumb 1.6.0
 * 
 * Provides a way to visually connect elements on an HTML page, using either SVG, Canvas
 * elements, or VML.  
 * 
 * This file contains the jQuery adapter.
 *
 * Copyright (c) 2010 - 2013 Simon Porritt (http://jsplumb.org)
 * 
 * http://jsplumb.org
 * http://github.com/sporritt/jsplumb
 * 
 * Dual licensed under the MIT and GPL2 licenses.
 */ 
/* 
 * MISCELLANEOUS:
 * 
 * doAnimate			calls the underlying library's animate functionality
 * getElementObject		turns an id or dom element into an element object of the underlying library's type.
 * getDOMElement      	extract the underlying DOM element from some library specific selector
 * getSize				gets an element's size.
 * removeElement		removes some element completely from the DOM.  
 * getSelector 			gets a selector from some string specification.
 */
 
 /*
 * EVENTS:
 *
 * on					binds some event to an element 
 * getPageXY			gets some event's xy location on the page.
 * getOriginalEvent     gets the original browser event from some wrapper event
 * trigger				triggers some event on an element.
 * off					unbinds some listener from some element.
 */
 
 /*
 * DRAG/DROP:
 *
 * dragEvents			a dictionary of event names
 * getDragObject		gets the object that is being dragged, by extracting it from the arguments passed to a drag callback
 * getDragScope			gets the drag scope for a given element.
 * getDropScope			gets the drop scope for a given element.
 * getUIPosition		gets the position of some element that is currently being dragged, by extracting it from the arguments passed to a drag callback. 
 * initDraggable		initializes an element to be draggable 
 * initDroppable		initializes an element to be droppable
 * isDragSupported		returns whether or not drag is supported for some element.
 * isDropSupported		returns whether or not drop is supported for some element. 
 * setDragFilter		sets a filter for some element that indicates areas of the element that should not respond to dragging.
 * setDraggable			sets whether or not some element should be draggable.
 * setDragScope			sets the drag scope for a given element.  
 */
 
(function($) {	
	
	var _getElementObject = function(el) {			
		return typeof(el) == "string" ? $("#" + el) : $(el);
	};

	// new: move to putting stuff on jsplumb prototype
	$.extend(jsPlumbInstance.prototype, {
		
		
// ---------------------------- DOM MANIPULATION ---------------------------------------		
				
		
		/**
		* gets a DOM element from the given input, which might be a string (in which case we just do document.getElementById),
		* a selector (in which case we return el[0]), or a DOM element already (we assume this if it's not either of the other
		* two cases).  this is the opposite of getElementObject below.
		*/
		getDOMElement : function(el) {
			if (el == null) return null;
			if (typeof(el) == "string") return document.getElementById(el);
			else if (el.context || el.length != null) return el[0];
			else return el;
		},
		
		/**
		 * gets an "element object" from the given input.  this means an object that is used by the
		 * underlying library on which jsPlumb is running.  'el' may already be one of these objects,
		 * in which case it is returned as-is.  otherwise, 'el' is a String, the library's lookup 
		 * function is used to find the element, using the given String as the element's id.
		 * 
		 */		
		getElementObject : _getElementObject,
		
// ---------------------------- END DOM MANIPULATION ---------------------------------------

// ---------------------------- MISCELLANEOUS ---------------------------------------

		/**
		 * animates the given element.
		 */
		doAnimate : function(el, properties, options) {
			el.animate(properties, options);
		},	
		getSelector : function(context, spec) {
            if (arguments.length == 2)
                return _getElementObject(context).find(spec);
            else
                return $(context);
		},		
		
// ---------------------------- END MISCELLANEOUS ---------------------------------------		
		
// -------------------------------------- DRAG/DROP	---------------------------------
		
		destroyDraggable : function(el) {
			if ($(el).data("draggable"))
				$(el).draggable("destroy");
		},

		destroyDroppable : function(el) {
			if ($(el).data("droppable"))
				$(el).droppable("destroy");
		},
		/**
		 * initialises the given element to be draggable.
		 */
		initDraggable : function(el, options, isPlumbedComponent, _jsPlumb) {
			options = options || {};
			el = $(el);

			options.start = jsPlumbUtil.wrap(options.start, function() {
				$("body").addClass(_jsPlumb.dragSelectClass);
			}, false);

			options.stop = jsPlumbUtil.wrap(options.stop, function() {
				$("body").removeClass(_jsPlumb.dragSelectClass);
			});

			// remove helper directive if present and no override
			if (!options.doNotRemoveHelper)
				options.helper = null;
			if (isPlumbedComponent)
				options.scope = options.scope || jsPlumb.Defaults.Scope;
			el.draggable(options);
		},
		
		/**
		 * initialises the given element to be droppable.
		 */
		initDroppable : function(el, options) {
			options.scope = options.scope || jsPlumb.Defaults.Scope;
			$(el).droppable(options);
		},
		
		isAlreadyDraggable : function(el) {
			return $(el).hasClass("ui-draggable");
		},
		
		/**
		 * returns whether or not drag is supported (by the library, not whether or not it is disabled) for the given element.
		 */
		isDragSupported : function(el, options) {
			return $(el).draggable;
		},				
						
		/**
		 * returns whether or not drop is supported (by the library, not whether or not it is disabled) for the given element.
		 */
		isDropSupported : function(el, options) {
			return $(el).droppable;
		},
		/**
		 * takes the args passed to an event function and returns you an object representing that which is being dragged.
		 */
		getDragObject : function(eventArgs) {
			return eventArgs[1].draggable || eventArgs[1].helper;
		},
		
		getDragScope : function(el) {
			return $(el).draggable("option", "scope");
		},

		getDropEvent : function(args) {
			return args[0];
		},
		
		getDropScope : function(el) {
			return $(el).droppable("option", "scope");		
		},
		/**
		 * takes the args passed to an event function and returns you an object that gives the
		 * position of the object being moved, as a js object with the same params as the result of
		 * getOffset, ie: { left: xxx, top: xxx }.
		 * 
		 * different libraries have different signatures for their event callbacks.  
		 * see getDragObject as well
		 */
		getUIPosition : function(eventArgs, zoom, dontAdjustHelper) {
			var ret;
			zoom = zoom || 1;
			if (eventArgs.length == 1) {
				ret = { left: eventArgs[0].pageX, top:eventArgs[0].pageY };
			}
			else {
				var ui = eventArgs[1],
				  _offset = ui.position;//ui.offset;
				  
				ret = _offset || ui.absolutePosition;
				
				// adjust ui position to account for zoom, because jquery ui does not do this.
				if (!dontAdjustHelper) {
					ui.position.left /= zoom;
					ui.position.top /= zoom;
				}
			}
			return { left:ret.left, top: ret.top  };
		},
		
		setDragFilter : function(el, filter) {
			if (jsPlumb.isAlreadyDraggable(el))
				el.draggable("option", "cancel", filter);
		},
		
		setElementDraggable : function(el, draggable) {
			el.draggable("option", "disabled", !draggable);
		},
		
		setDragScope : function(el, scope) {
			el.draggable("option", "scope", scope);
		},
		/**
         * mapping of drag events for jQuery
         */
		dragEvents : {
			'start':'start', 'stop':'stop', 'drag':'drag', 'step':'step',
			'over':'over', 'out':'out', 'drop':'drop', 'complete':'complete'
		},
		
// -------------------------------------- END DRAG/DROP	---------------------------------		

// -------------------------------------- EVENTS	---------------------------------		

		/**
		 * note that jquery ignores the name of the event you wanted to trigger, and figures it out for itself.
		 * the other libraries do not.  yui, in fact, cannot even pass an original event.  we have to pull out stuff
		 * from the originalEvent to put in an options object for YUI. 
		 * @param el
		 * @param event
		 * @param originalEvent
		 */
		trigger : function(el, event, originalEvent) {
			var h = jQuery._data(_getElementObject(el)[0], "handle");
            h(originalEvent);
		},
		getOriginalEvent : function(e) {
			return e.originalEvent;
		},
		/**
		 * event binding wrapper.  it just so happens that jQuery uses 'bind' also.  yui3, for example,
		 * uses 'on'.
		 */
		 
		 // TODO rename to 'on'
		on : function(el, event, callback) {
			el = _getElementObject(el);
			el.bind(event, callback);
		},				
		
		// TODO rename to 'off'
		off : function(el, event, callback) {
			el = _getElementObject(el);
			el.unbind(event, callback);
		}

// -------------------------------------- END EVENTS	---------------------------------		

		
	});

	jsPlumb.CurrentLibrary = {					        
																															
				
		// TODO remove library dependency on a removeElement method.
		removeElement : function(element) {			
			_getElementObject(element).remove();
		}
		
		
	};
	
	$(document).ready(jsPlumb.init);
	
})(jQuery);

