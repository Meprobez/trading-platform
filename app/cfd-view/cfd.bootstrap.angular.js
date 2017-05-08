app.config(function($locationProvider) {
    $locationProvider.html5Mode({
    	enabled: true,
	 	requireBase: false
    });
});

var tmeShowLocation=null;
var showLocation_oldPath=null;
function showLocation($location,onLoad){
	clearTimeout(tmeShowLocation);
	tmeShowLocation=setTimeout(function(){
		var path=$location.url();
		if (showLocation_oldPath==path)
			return;
		showLocation_oldPath=path;
		if (!path)
			return;
		
		try{
			if (cfdModule.charts.mainChart.chart)
				cfdModule.charts.mainChart.chart.destroy();
		}catch(e){
			console.log("Can't destroy chart");
		}
		$("[id='chart']").remove();
		closeSideBarRight();
		
   		$("#sidebarMenu").find(".active").removeClass("active");
   		$('[href="'+path+'"]').addClass("active");
		
	   $("#content_page").css("opacity","0");
	   $.get(path,{showAjaxPage:true},function(data){
		    var content = $(data);
		    $("#content_page").html(content);
		   
		    //console.log(content);
		    var content= $("#content_page");
		    angular.element(document).injector().invoke(function($compile) {$compile(content)(cfdScope)});
       		if (typeof(onLoad)!="undefined"){
				try{
					onLoad();
				}catch($e){
					console.log($e);
					alert("Error Loading page");
				}
			}
       			
       		$("#content_page").css("opacity","1");
	   });			
	},10);
}


function moveLocation($location){
	clearTimeout(tmeShowLocation);
	tmeShowLocation=setTimeout(function(){
		var path=$location.url();
		if (showLocation_oldPath==path)
			return;
		showLocation_oldPath=path;
		if (!path)
			return;

		console.log("Real move to : "+path);
		//return;
		//if (window.location.pathname!=path)
			window.location=path;
	},10);
}

function realMoveUrl(url){
	window.location=url;
	return false;
}


app.config(function($routeProvider) {
    $routeProvider
        .when('/trade.php/cfd/', {
		    controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
				showLocation($location,function(){
					makeAssetTypesMenu();
					
					
					//$("#page-content-wrapper").css("padding","0px");
					$("#panels").split({orientation:'horizontal',position: '50%',onDrag:splitterChangeIndex });	
					/*
					$("#main_panel_left").split({orientation:'horizontal',position: '60%',onDrag:splitterChangeIndex });	
					$("#main_panel_right").split({orientation:'horizontal',position: '60%',onDrag:splitterChangeIndex });
					*/
					$("li",".slt_chart_time").click(function(){
						cfdModule.charts.mainChart.barSize=$(this).attr("bar");
						cfdModule.charts.mainChart.duration=$(this).attr("dur");
						cfdModule.charts.mainChart.draw();
						$("#txt_selcted_duration").text($(this).text());
					});	
					
				    $( "#txtSeachAsset" ).autocomplete({
					   source: function (request, response) {
					   		//query: request.term;
					   		var res=searchAsset(MENU_HIERED,request.term);
					   		response(res);
					   	},
					   	select:function(event, ui){
					   		selectAsset(ui.item.value);
					   	}
				    });					
					$("#txt_selcted_duration").text($(".slt_chart_time").find("[bar='"+cfdModule.charts.mainChart.barSize+"']").text());
				});
				
		    }],
		    template : '<div/>',
        })
         .when('/trade.php/cfd/FOprofile/editFullInfo', {
         	 controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
         	 	showLocation($location,function(){
         	 		initPageClientInfo();
         	 	});
         	 }],
         	 template : '<div/>',
         })
         .when('/trade.php/cfd/FOtradesHistory/openTrades', {
         	controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
	 			showLocation($location,function(){
         	 		var trades=cfdModule.openTrades.trades;
					cfdModule.openTrades.onInit(trades);
	
					$("li",".slt_chart_time").click(function(){
						cfdModule.charts.mainChart.barSize=$(this).attr("bar");
						cfdModule.charts.mainChart.duration=$(this).attr("dur");
						cfdModule.charts.mainChart.draw();
						$("#txt_selcted_duration").text($(this).text());
					});	
										 				
	 				
	 				$("#panels_open").split({orientation:'horizontal',position: '50%',onDrag:splitterChangeIndex });	
					if (!cfdModule.charts.mainChart.asset)
						cfdModule.charts.mainChart.asset="EURUSD";
					cfdModule.charts.mainChart.draw();
					
					$("#txt_selcted_duration").text($(".slt_chart_time").find("[bar='"+cfdModule.charts.mainChart.barSize+"']").text());
	 			});
         	}],
         	 template : '<div/>',
         })
         .when('/trade.php/cfd/FOtradesHistory/openOrders', {
         	 controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
         	 	showLocation($location,function(){
         	 		var trades=cfdModule.ordersTrades.trades;
					cfdModule.ordersTrades.onInit(trades);

	 				$("#panels_open").split({orientation:'horizontal',position: '50%',onDrag:splitterChangeIndex });	

					$("li",".slt_chart_time").click(function(){
						cfdModule.charts.mainChart.barSize=$(this).attr("bar");
						cfdModule.charts.mainChart.duration=$(this).attr("dur");
						cfdModule.charts.mainChart.draw();
						$("#txt_selcted_duration").text($(this).text());
					});	
					

					if (!cfdModule.charts.mainChart.asset)
						cfdModule.charts.mainChart.asset="EURUSD";
					cfdModule.charts.mainChart.draw();
	 									
					$("#tbl_ordersTrades").dataTable({
						"order": [],
						"language": {"url": DATATABLES_LANG_URL}
					});
					
					$("#txt_selcted_duration").text($(".slt_chart_time").find("[bar='"+cfdModule.charts.mainChart.barSize+"']").text());
         	 	});
         	 }],
         	 template : '<div/>',
         })         
         .when('/trade.php/cfd/FOhistory/', {
         	 controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
         	 	showLocation($location,function(){
         	 		$("#frm_history").submit(function(){
         	 			$(this).ajaxSubmit({
         	 				success:function(data){
								$("#historyData").html(data.data)
							}
         	 			});
         	 			return false;
         	 		});
         	 		$("#frm_history").submit();
         	 		
					 $(".datepicker").datepicker();

					$(".btn_balance_to_sa").click(function(){
						$("#dlg_sa_to_balance").hide();
						$("#dlg_balance_to_sa").fadeIn();
					});
					$(".btn_sa_to_balance").click(function(){
						$("#dlg_sa_to_balance").fadeIn();
						$("#dlg_balance_to_sa").hide();
					});

					$(".btn_close_trasfer").click(function(){
						$("#dlg_sa_to_balance").fadeOut();
						$("#dlg_balance_to_sa").fadeOut();
					});
         	 	});
         	 }],
         	 template : '<div/>',
         })
         .when('/trade.php/cfd/FOtradesHistory/', {
		    controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
				showLocation($location,function(){
					$("#dateStart_tradeHistory").val(moment().format('01/MM/YYYY'));
					$("#dateEnd_tradeHistory").val(moment().format('DD/MM/YYYY'));
							
					$("#tbl_history").dataTable({
						"order": [],
						"language": {"url": DATATABLES_LANG_URL}
					});
					$("#btn_ok_tradeHistory").click(function(){
						$("#tbl_history").DataTable().clear().draw();
						cfdModule.loadClosedTrades($("#dateStart_tradeHistory").val(),$("#dateEnd_tradeHistory").val(),function(data){
							var rows=[];
							for(var i in data.trades){
								var trade=data.trades[i];
								var commission = CURRENCIES[CURRENCY] == '$' || CURRENCIES[CURRENCY] == '£' ? CURRENCIES[CURRENCY]+" "+(trade.commission*-1) : (trade.commission*-1)+" "+CURRENCIES[CURRENCY];
								var swap_amount = CURRENCIES[CURRENCY] == '$' || CURRENCIES[CURRENCY] == '£' ? CURRENCIES[CURRENCY]+" "+(trade.swap_amount*-1) : (trade.swap_amount*-1)+" "+CURRENCIES[CURRENCY];
								var close_pnl = CURRENCIES[CURRENCY] == '$' || CURRENCIES[CURRENCY] == '£' ? CURRENCIES[CURRENCY]+" "+trade.close_pnl : trade.close_pnl+" "+CURRENCIES[CURRENCY];
								rows.push([
									trade.id,
									trade.open_time,
									trade.asset_name,
									trade.type,
									trade.amount,
									trade.open_price,
									trade.sl,
									trade.tp,
									trade.close_time,
									trade.close_price,
									commission,
									swap_amount,
									close_pnl,
									trade.close_reason		
								]);
							}
							
							$("#tbl_history").DataTable().rows.add( rows).draw();	
						});						
					});
					$("#btn_ok_tradeHistory").click();
					$(".datepicker").datepicker();
				});
		    }], 
		    template : '<div/>',         	
         })      
         .when('/trade.php/trader/default/switchMode', {
		    controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
		    	console.log("Move");
				moveLocation($location);
			}],
		    template : '<div/>',         	
         })      
         
    	/*
        // route for the home page

        // route for the about page
        .when('/about', {
            templateUrl : 'pages/about.html',
            controller  : 'cfdController'
        })

        // route for the contact page
        .when('/contact', {
            templateUrl : 'pages/contact.html',
            controller  : 'cfdController'
        })
        */
        //other
        .otherwise({
		    controller : ['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams){
				showLocation($location);
		    }], 
		    template : '<div/>',
        });
});