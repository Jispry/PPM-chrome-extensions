(function() {
	"use strict;"
	
	console.log("PPM_Search Extention");
	
	// customizable options
	var configuration = {
		// label of table by witch to group and display data
		groupingColumnLabel: "Service Name",
		// label next to display buttons
		buttonLabel: "Show Service names:",
	};
	
	/**
	 * utils module
	 */
	var utils = function(){
		/**
		 * @param {Array} initial array
		 * @param {Array} array that is substracted
		 * @returns result of substraction
		 */
		function arraySubstract(from, items)
		{
			return $(from).not(items).get();
		}
		return {
			arraySubstract: arraySubstract
		}
	}();
	
	var searchExt = function(){
		
		/**
		 * Array with custom limited functionality
		 */
		var MyArray = function(){
			var array = [];
			
			this.init = function(initArray){
				if (Array.isArray(initArray)){
					array = initArray;
				}
				// if not Array than its an Array item
				else{
					array = [initArray];
				}
			}
			
			this.remove = function(item){
				if(array.length === 0){
					throw Error("Unable to remove " + item + ". Array is empty!");
				}
				
				var index = array.indexOf(item);
				if (index === -1){
					throw Error("Unable to remove " + item + ". Not found!");
				}
				else{
					array.splice(index, 1);
				}
			}
			
			this.add = function(item){
				array.push(item);
			}
			
			this.getAll = function(){
				return array;
			}
			
			this.isInArray = function(item){
				if (array.indexOf(item) === -1){
					return false;
				}
				return true;
			}
		}
		
		// all distinct values from column defined by configuration.groupingColumnLabel. defines the value for show/hide buttons
		var groupingColumns = new MyArray();
		// list of active/shown data by grouping column
		var activeGroupingColumns = new MyArray();		
		var hideServiceButtonsId = 'ppm-ext-hide-service-btns';
		var searchTableSelector = '#searchResultTable';
		// key for local storage
		var localStorageSavedActiveKey = 'activeGroupingColumns';
		
		/**
		  * returns parse html string from element
		  * @param {jQuery} selector
		  * @returns {string} trimmed inner html of element
		  */
		function getServiceNameFromHtml(element){
			var htmlString = $(element).html();
			return htmlString.trim().replace(" ", "");
		}
		
		function createHideMultiselect(){
			if (groupingColumns && groupingColumns.getAll().length > 0){
				var container = $('<div id=' + hideServiceButtonsId + '>');
				container.html(configuration.buttonLabel);
				//add buttons
				groupingColumns.getAll().forEach(function iterrator(serviceName){
					var item = $("<span>")
						.addClass("btn")
						.attr("data-value", serviceName)
						.html(serviceName);
					if (activeGroupingColumns.isInArray(serviceName)){
						item.addClass("active");
					}
					
					container.append(item);
				});
				
				container.insertBefore($(searchTableSelector));
			}
			else{
				console.log("NogroupingColumns");
			}
		}
		
		function initServiceNameClasses(){			
			//find serviceName header
			var $header = $('th:contains("' + configuration.groupingColumnLabel + '")');
			if ($header){
				// +1 because 1st element in header is td
				var index = $header.parent().children().index($header) + 1;
				
				// add css Classes
				$(searchTableSelector + ' tr.standardHeight').each(function iterrator(){
					var $td = $(this).children()[index];
					var serviceName = getServiceNameFromHtml($td);
					// add service name to list of groupingColumns
					if (groupingColumns.isInArray(serviceName) === false){
						groupingColumns.add(serviceName);
					}
					// add ServiceName class to tr
					$(this).addClass(serviceName);
				});
				
			}
			else{
				console.log("Failed to locate " + configuration.groupingColumnLabel + " column");
				throw Error("Failed to locate " + configuration.groupingColumnLabel + " column");
			}
		}
		
		function loadActiveFromStorage(){
			if (localStorage){
				var result = localStorage.getItem(localStorageSavedActiveKey);
				if (result && result.length > 0){
					activeGroupingColumns.init(result.split(','));
				}
				// if not found all groupingColumns Are active
				else{
					console.log("Nothing in Storage");
					activeGroupingColumns.init(groupingColumns.getAll());
				}
			}
			else{
				activeGroupingColumns.init(groupingColumns.getAll());
				throw Error("No LocalStorage Support");
			}
		}
		
		function updateActiveInStorage(){
			if (localStorage){
				localStorage[localStorageSavedActiveKey] = activeGroupingColumns.getAll();
			}
			else{
				throw Error("No LocalStorage Support");
			}
		}
		
		function initialHide(){
			var toHide = utils.arraySubstract(groupingColumns.getAll(), activeGroupingColumns.getAll());
			var selector = createSelector(toHide);
			$(selector).hide();
		}
		
		function createSelector(items){
			if (Array.isArray(items) && items.length > 0){
				// adds 1st class dot and join items 
				var selector = "." + items.join(", .");
				return selector;
			}
			else if (items && items.length > 0){
				return "." + items;
			}
			else{
				return "";
			}
		}
		
		function init(){
			initServiceNameClasses();
			loadActiveFromStorage();
			updateActiveInStorage();
			createHideMultiselect();
			initialHide();
			
			// show hide click binding
			$('#' + hideServiceButtonsId + ' span').click(function (){
				var serviceName = $(this).data("value");
				if ($(this).hasClass("active")){
					$('.' + serviceName).hide();
					activeGroupingColumns.remove(serviceName);
				}
				else{
					$('.' + serviceName).show();
					activeGroupingColumns.add(serviceName);
				}
				
				$(this).toggleClass("active");
				updateActiveInStorage();
			});
			
			// show hide double click binding
			$('#' + hideServiceButtonsId + ' span').dblclick(function (){
				var serviceName = $(this).data("value");
				
				// only selected service should be active after double click
				activeGroupingColumns.init(serviceName);
				// update the storage
				updateActiveInStorage();
				
				// select service names to hide all except active
				var toHide =  utils.arraySubstract(groupingColumns.getAll(), activeGroupingColumns.getAll());
				var selector  = createSelector(toHide);
				$(selector).hide();
				
				//show table lines with class
				$('.' + serviceName).show();
				
				//update buttons classes. remove active from all
				$('#' + hideServiceButtonsId + ' span').removeClass("active");
				//set active to current button
				$(this).toggleClass("active");
			});
		}
		return {
			init: init
		}
	}();
	
	searchExt.init();
})();