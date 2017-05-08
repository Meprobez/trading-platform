var cfdModule={
	init:function(){
		if (typeof(WS)!="object")
			return setTimeout(cfdModule.init,50);
		if(!WS.addCallback)
			return setTimeout(cfdModule.init,50);
		
		for(var i in cfdModule._callbacks){
			WS.addCallback(i,cfdModule._callbacks[i]);
		}
		
		if (typeof(SERVER_URLS.assetTimes)!="undefined"){
			$.get(SERVER_URLS.assetTimes,function(data){
				ASSETS_TIMES=data;
			});				
		}
	
		
		cfdModule.reloadServerData();
		
		setInterval(function(){
			cfdModule.updateAssetsValues();
		},500);		
		
		setInterval(cfdModule.initAssetUpdateList,3000);
		setInterval(cfdModule.updateDayRangeList,60000);
				

					
	},
	alerts:{
		getActive:function(){
			var alerts={};
			for(var i in ASSETS_ALERTS){
				var al=ASSETS_ALERTS[i];
				if (al.report_by_notify!=="WAITING" && al.report_by_notify!=="PENDING_SEND")
					continue;
				
				if (!alerts[ al.assetName])
					alerts[al.assetName]=[];
					
				al.rate=parseFloat(al.rate);
				al.on_create_rate=parseFloat(al.on_create_rate);
				
				alerts[al.assetName].push(al);
			}
			return alerts;			
		},
	},
	assetsNames:[],
	minSpaceFromRate:0.015/100,
	assetPrices:{},
	selectedAsset:null,
	selectedType:null,
	reloadInProccess:false,
	signalsUpdate:new Date().getTime(),
	tempData:{},
	pad:function(n, width, z){
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;		
	},	
	currentUTC:function(){
		if (cfdModule.tempData.time){
			var x=cfdModule.tempData.time;
		}else{
			var x=new Date();	
		}
		return (new Date(x.getUTCFullYear(),x.getUTCMonth(),x.getUTCDate(),x.getUTCHours(),x.getUTCMinutes(),x.getUTCSeconds()  ));
	},
	isOpenAsset:function(assetsName,datetime){
		if (!ASSETS_TIMES[assetsName]){
			console.log("Times not set for asset : "+assetsName);
			return false;
		}
		var cur_date=datetime ? datetime : cfdModule.currentUTC();
		var date=cfdModule.pad(cur_date.getUTCFullYear(),0)+"-"+cfdModule.pad(cur_date.getUTCMonth()+1,2)+"-"+cfdModule.pad(cur_date.getUTCDate(),2);
		var times=[];
		if (ASSETS_TIMES[assetsName][date]){
			times=ASSETS_TIMES[assetsName][date];
		}else if(ASSETS_TIMES[assetsName][cur_date.getDay()+1]){
			times=ASSETS_TIMES[assetsName][cur_date.getDay()+1];
		}
		for(var i in times){
			var t_start	= times[i].start.split(":");
			var t_end	= times[i].end.split(":");			
			var d_start = new Date(cur_date.getFullYear(),cur_date.getMonth(),cur_date.getDate(),t_start[0],t_start[1],t_start[2]);
			var d_end   = new Date(cur_date.getFullYear(),cur_date.getMonth(),cur_date.getDate(),t_end[0],t_end[1],t_end[2]);
			if (cur_date>=d_start && cur_date<=d_end)
				return true;
		}
		return false;
	},
	check_sl_tp:function(asset,type_sl_tp,type,check_rate,open_rate){
		if (type=="SELL"){
			if (open_rate){
				var rate=open_rate;
			}else{
				var rate=parseFloat(cfdModule.getAssetValue(asset,"BUY"));	
			}
			
			var rate_high = rate+(rate*cfdModule.minSpaceFromRate); 
			var rate_low  = rate-(rate*cfdModule.minSpaceFromRate);
			var sl=rate_high;
			var tp=rate_low;	
			
			if (type_sl_tp=="sl"){
				return [check_rate>=sl,"greater than",sl];
			}else if(type_sl_tp=="tp"){
				return [check_rate<=tp,"less than",tp];
			}
		}else{
			if (open_rate){
				var rate=open_rate;
			}else{
				var rate=parseFloat(cfdModule.getAssetValue(asset,"SELL"));
			}			
			
			var rate_high = rate+(rate*cfdModule.minSpaceFromRate); 
			var rate_low  = rate-(rate*cfdModule.minSpaceFromRate);
			var sl=rate_low;
			var tp=rate_high;
			
			var sl=rate;
			var tp=rate_high;			
			if (type_sl_tp=="tp"){
				return [check_rate>=tp,"greater than",tp];
			}else if(type_sl_tp=="sl"){
				return [check_rate<=sl,"less than",sl];
			}
		}
	},
	openTrade:function(p){
		if (!p.assetName){
			alert("invalid assetName");
			return false;
		}
		if (!p.type){
			alert("invalid type");
			return false;
		}		
		if (!p.amount){
			alert("invalid amount");
			return false;
		}
		
		if (p.tp){
			var c=cfdModule.check_sl_tp(p.assetName,'tp',p.type,parseFloat(p.tp),parseFloat(p.order_rate))
			if (!c[0]){
				alert("invalid TP - need to be : "+c[1]+" "+c[2].toFixed(ASSET_SETTINGS[p.assetName].digits));
				return false;				
			}

		}
		if (p.sl){
			var c=cfdModule.check_sl_tp(p.assetName,'sl',p.type,parseFloat(p.sl),parseFloat(p.order_rate))
			if (!c[0]){
				alert("invalid SL - need to be : "+c[1]+" "+c[2].toFixed(ASSET_SETTINGS[p.assetName].digits));
				return false;				
			}
		}
				
		var send_data={
			"assetName"  : p.assetName,
			"type"		 : p.type,
			"amount"	 : p.amount,
			"sl"		 : p.sl,
			"tp"		 : p.tp,
			"order_rate" : p.order_rate
		}
		var req={
			url: SERVER_URLS.openTrade,
			method: "POST",
			data: send_data,
			dataType : 'json',
			success:function(data){
	            cfdModule.reloadServerData(data);
	            WS.sendFunction("tradeOpen",{
					trade_id:data.trade_id
				});      	
				if (p.success)
					p.success(data);				
			}	
		};
		
		if (p.beforeSend){
			req.beforeSend=p.beforeSend;
		}
		
		
		if (p.error){
			req.error=p.error;
		}

		if (p.complete){
			req.complete=p.complete;
		}
				
		var jqxhr = $.ajax(req);
		
	},
	charts:{
		mainChart		 : typeof(chartCfd)!="undefined" ? new chartCfd("chart") 				: null,
		openTradesChart	 : typeof(chartCfd)!="undefined" ? new chartCfd("openTrades_chart")		: null,
		orderTradesChart : typeof(chartCfd)!="undefined" ? new chartCfd("ordersTrades_chart")	: null
	},
	showTradeDetails:function(obj,tradeId){
		$("#tradeDetails_"+tradeId).toggle();
		$(obj).toggleClass("details_close").toggleClass("details_open");
	},
	loadClosedTrades:function(dateStart,dateEnd,onLoad){
		$.ajax({
		  url:SERVER_URLS.closedTrades,
		  type: "POST",
		  data:{
		  	"dateStart"	: dateStart,
		  	"dateEnd"	: dateEnd
		  },
		  success: onLoad,
		});
	},
	reloadServerData:function(srv_data){
		var f_parse=function(data){
				ASSET_SETTINGS	= data.ASSET_SETTINGS ? data.ASSET_SETTINGS : ASSET_SETTINGS;
				EUR_RATES		= data.EUR_RATES ? data.EUR_RATES : EUR_RATES;
				BALANCE			= data.BALANCE ? data.BALANCE : BALANCE;
				GROUP_ID		= data.GROUP_ID ? data.GROUP_ID : GROUP_ID;
				
				if (data.OPEN_TRADES)
					cfdModule.openTrades.init(data.OPEN_TRADES);
				if (data.ORDERS_TRADES)
					cfdModule.ordersTrades.init(data.ORDERS_TRADES);
			
		};
		
		if(!srv_data){
			if (cfdModule.reloadInProccess)
				return;
			cfdModule.reloadInProccess=true;
			$.ajax({
			  type: "POST",
			  url:SERVER_URLS.serverData,
			  success: f_parse,
			  complete:function(){
			  	cfdModule.reloadInProccess=false;
			  }
			  });	
		}else{
			f_parse(srv_data);
		}
		

	},
	isForexAsset:function(assetName){
		if (!ASSET_SETTINGS[assetName])
			return null;
		return ASSET_SETTINGS[assetName].type_id==1;
	},
	balance:{
		available:function(){
			var pnl=cfdModule.openTrades.totalPNL();
			var inMargin=cfdModule.openTrades.totalInMargin();
			var comm=cfdModule.openTrades.totalCommission();
			var swap=cfdModule.openTrades.totalSwap();
			
			var available=BALANCE+pnl-inMargin-comm-swap;
			
			return available<0 ? 0 : available;
		},	
		equity:function(){
			var pnl=cfdModule.openTrades.totalPNL();
			var comm=cfdModule.openTrades.totalCommission();
			var swap=cfdModule.openTrades.totalSwap();
			
			var equity=BALANCE+pnl-comm-swap;
			return equity<0 ? 0 : equity;
		},
		maintenance_margin:function(){
			var m_margin=cfdModule.openTrades.totalMmargin();
			if (m_margin>cfdModule.balance.equity()){
				console.log("open trades margin over equity")
				cfdModule.reloadServerData();
			}
				
			return m_margin;
		}
	},
	ordersTrades:{
		trades:{},
		onInit:function(trades){},
		init:function(trades){
			cfdModule.ordersTrades.trades={};
			for(var i in trades){
				cfdModule.ordersTrades.trades[trades[i].id]=new function(){return  trades[i]};
				cfdModule.ordersTrades.trades[trades[i].id].close=function(){
					$.ajax({
					  type: "POST",
					  url:SERVER_URLS.closeTradeOrder,
					  data:{"trade_id"	: this.id },
					  success: function(data){ cfdModule.reloadServerData(data); }
					 });	
				},
				cfdModule.ordersTrades.trades[trades[i].id].isActivated=function(){
					
					var t=parseFloat(this.open_price) - parseFloat(this.close_price);
					if (t==0){
						return true;
					}else if (t<0){
						if (parseFloat(cfdModule.getAssetValue(this.asset_name,this.type.replace("PENDING_",""))) <=this.open_price)
							return true;
					}else if (t>0){
						
						if (parseFloat(cfdModule.getAssetValue(this.asset_name,this.type.replace("PENDING_",""))) >=this.open_price)
							return true;
					}
					return false;
				}
				cfdModule.ordersTrades.trades[trades[i].id].current_rate = function(){
					if (this.type=="PENDING_BUY"){
						return  cfdModule.getAssetValue(this.asset_name,"BUY");
					}else if(this.type=="PENDING_SELL"){
						return  cfdModule.getAssetValue(this.asset_name,"SELL");
					}
					return 0;
				}							
			}	
			cfdModule.ordersTrades.onInit(cfdModule.ordersTrades.trades);
		}
	},
	openTrades:{
		trades:{},
		onInit:function(trades){},
		init:function(trades){
			cfdModule.openTrades.trades={};
			for(var i in trades){
				cfdModule.openTrades.trades[trades[i].id]=new function(){return  trades[i]};
				cfdModule.openTrades.trades[trades[i].id].update_tp_sl=function(tp,sl){
					if (tp){
						var c=cfdModule.check_sl_tp(this.asset_name,'tp',this.type,parseFloat(tp))
						if (!c[0]){
							alert("invalid TP - need to be : "+c[1]+" "+c[2].toFixed(ASSET_SETTINGS[this.asset_name].digits));
							return false;				
						}

					}
					if (sl){
						var c=cfdModule.check_sl_tp(this.asset_name,'sl',this.type,parseFloat(sl))
						if (!c[0]){
							alert("invalid SL - need to be : "+c[1]+" "+c[2].toFixed(ASSET_SETTINGS[this.asset_name].digits));
							return false;				
						}
					}			
							
					$.ajax({
					  type: "POST",
					  url:SERVER_URLS.updateTrade,
					  data:{
					  	"trade_id"	: this.id,
					  	"tp"		: tp,
					  	"sl"		: sl
					  },
					  success: function(data){
					  	cfdModule.reloadServerData(data);
					  }
					 });
					 return true;
				};
				cfdModule.openTrades.trades[trades[i].id].isStopLimit=function(){
					var rate=this.current_rate();
					if (this.tp==0 || this.sl==0 || !rate)
						return false;
						
					if (this.type=="BUY"){
						if (rate>=this.tp){
							return true;
						}
							
						if (rate<=this.sl)
							return true;
														
					}else if(this.type=="SELL"){
						if (rate<=this.tp)
							return true;
							
						if (rate>=this.sl)
							return true;
					}
					
					return false;
				};
				cfdModule.openTrades.trades[trades[i].id].pnl=function(){
					if (this.isStopLimit()){
						//cfdModule.reloadServerData();
						//return 0;
						//console.log("need to close this trade");
						//return null;
					}
						 
					var total_amount=this.open_price *this.amount;
					var total_amount_current=this.currentTotal();
					
					if (!total_amount_current)
						return null;

					var pnl=0;
					if (this.type=="BUY"){
						pnl=total_amount_current-total_amount;
					}else if(this.type=="SELL"){
						pnl=total_amount-total_amount_current;
					}
					
					//console.log(pnl);

									
					pnl=cfdModule.convertPrice(pnl,this.pnl_currency,CURRENCY,this.change_fee);
					pnl=parseFloat(pnl.toFixed(2));
					//pnl-=this.commission;
					
					return pnl;
				};
				cfdModule.openTrades.trades[trades[i].id].total_value=function(){					 
					var total_amount=this.open_price *this.amount;
					return cfdModule.convertPrice(total_amount,this.pnl_currency,CURRENCY,this.change_fee);
				};				
				cfdModule.openTrades.trades[trades[i].id].currentTotal=function(){
					return this.current_rate()*this.amount;
				};
				
				cfdModule.openTrades.trades[trades[i].id].current_rate = function(){
					if (this.type=="BUY"){
						return  cfdModule.getAssetValue(this.asset_name,"SELL");
					}else if(this.type=="SELL"){
						return  cfdModule.getAssetValue(this.asset_name,"BUY");
					}
					return 0;
				}					
			}

			cfdModule.openTrades.onInit(cfdModule.openTrades.trades);
		},
		totalPNL:function(){ 
			var pnl=0;
			for(var i in cfdModule.openTrades.trades){
				pnl+=cfdModule.openTrades.trades[i].pnl();
			}
			return pnl;
		},
		totalInMargin:function(){
			var inMargin=0;
			for(var i in cfdModule.openTrades.trades){
				if (typeof cfdModule.openTrades.trades[i].margin_i=="string"){
					inMargin+=parseFloat(cfdModule.openTrades.trades[i].margin_i);
				}else{
					inMargin+=cfdModule.openTrades.trades[i].margin_i;	
				}
					
				
			}
			return inMargin;
		},
		totalMmargin:function(){
			var Mmargin=0;
			for(var i in cfdModule.openTrades.trades){
				Mmargin+=parseFloat(cfdModule.openTrades.trades[i].margin_m);
			}
			return Mmargin;
		},
		totalCommission:function(){
			var commission=0;
			for(var i in cfdModule.openTrades.trades){
				commission+=parseFloat(cfdModule.openTrades.trades[i].commission);
			}
			return commission;
		},
		totalSwap:function(){
			var swap=0;
			for(var i in cfdModule.openTrades.trades){
				swap+=parseFloat(cfdModule.openTrades.trades[i].swap_amount);
			}
			return swap;			
		}
		
	},
	getAssetValue:function(assetName,type){
		var price=0;
		
		if (!cfdModule.isOpenAsset(assetName)){
			if (cfdModule.assetPrices[assetName] && cfdModule.assetPrices[assetName].last_price && cfdModule.assetPrices[assetName].last_price>0)
				return cfdModule.assetPrices[assetName].last_price;
				
			if (cfdModule.assetPrices[assetName] && cfdModule.assetPrices[assetName].close && cfdModule.assetPrices[assetName].close>0)
				return cfdModule.assetPrices[assetName].close;
			
		}
							
		if (!ASSET_SETTINGS[assetName])
			return 0;
		var spread=ASSET_SETTINGS[assetName].spread/100;
		
		if (!cfdModule.assetPrices[assetName])
			return 0;
		if (type=="BUY"){
			price= cfdModule.assetPrices[assetName]["buy"];
			return price ? parseFloat(parseFloat(price+(price*spread)).toFixed(ASSET_SETTINGS[assetName].digits)) : 0;
		}
			
		if (type=="SELL"){
			price= cfdModule.assetPrices[assetName]["sell"];
			return price ? parseFloat(parseFloat(price-(price*spread)).toFixed(ASSET_SETTINGS[assetName].digits)) : 0;
		}
		
		return 0;
		
	},
	getCurrentcurrency:function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return null;
		return ASSET_SETTINGS[selected].currency;
	},
	getCurrentMarginPercent:function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;
		return 1/ASSET_SETTINGS[selected].leverage*100;
	},
	getCurrentMarginMaintancePercent:function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;
		return (cfdModule.getCurrentMarginPercent()*ASSET_SETTINGS[selected].maintance_margin/100);
	},	
	getCurrentLeverage:function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 1;
		return  ASSET_SETTINGS[selected].leverage;
	},
	getAssetDetails:function(asset){
		if (ASSETS_TIMES[asset] && ASSETS_TIMES[asset]){
			var cur_date=cfdModule.currentUTC();
			var date=cfdModule.pad(cur_date.getUTCFullYear(),0)+"-"+cfdModule.pad(cur_date.getUTCMonth()+1,2)+"-"+cfdModule.pad(cur_date.getUTCDate(),2);
			if (ASSETS_TIMES[asset]){
				if (ASSETS_TIMES[asset][date]){
					times=ASSETS_TIMES[asset][date];
				}else if(ASSETS_TIMES[asset][cur_date.getDay()+1]){
					times=ASSETS_TIMES[asset][cur_date.getDay()+1];
				}
			}
		}	
			
		return {
			min_step  : ASSET_SETTINGS[asset].min_step,
			min_qty   : ASSET_SETTINGS[asset].min_qty,
			commision : ASSET_SETTINGS[asset].commision,
			swap_time : ASSET_SETTINGS[asset].swap_time,
			swap_long : ASSET_SETTINGS[asset].swap_long,
			swap_short : ASSET_SETTINGS[asset].swap_short,
			roll_over  : ASSET_SETTINGS[asset].roll_over,
			dividend_date : ASSET_SETTINGS[asset].dividend_date,
			expire_date   : ASSET_SETTINGS[asset].expire_date,
			description   : ASSET_SETTINGS[asset].description,
			times	  	  : times
		}	
	},	
	showDetails:function(asset){
		cfdModule.selectedAsset=asset;
		cfdScope.$apply()
		
		$("#asset_details_min_step").text(ASSET_SETTINGS[asset].min_step);
		$("#asset_details_min_qty").text(ASSET_SETTINGS[asset].min_qty);
		$("#asset_details_commision_buy").text(ASSET_SETTINGS[asset].commision+"%");
		$("#asset_details_commision_sell").text(ASSET_SETTINGS[asset].commision+"%");

		$("#asset_details_swap_time").text(ASSET_SETTINGS[asset].swap_time+" GMT");
		$("#asset_details_swap_long").text(ASSET_SETTINGS[asset].swap_long+"%");
		$("#asset_details_swap_short").text(ASSET_SETTINGS[asset].swap_short+"%");
		
		$("#asset_details_roll_over_devidend_date_text").text($("#asset_details_roll_over_devidend_date_text").attr("txt_roll"));
		$("#asset_details_roll_over_devidend_date_value").text(ASSET_SETTINGS[asset].roll_over=="0000-00-00" ? "N/A" : ASSET_SETTINGS[asset].roll_over);
		
		if (ASSET_SETTINGS[asset].dividend_date!="0000-00-00"){
			$("#asset_details_roll_over_devidend_date_text").text($("#asset_details_roll_over_devidend_date_text").attr("txt_devidennd"));
			$("#asset_details_roll_over_devidend_date_value").text(ASSET_SETTINGS[asset].dividend_date);			
		}
		
		$("#asset_details_expiry_date").text(ASSET_SETTINGS[asset].expire_date=="0000-00-00" ? "N/A" : ASSET_SETTINGS[asset].expire_date);
		$("#asset_details_description").text(ASSET_SETTINGS[asset].description);
		
		
		if (ASSETS_TIMES[asset] && ASSETS_TIMES[asset]){
			var cur_date=cfdModule.currentUTC();
			var date=cfdModule.pad(cur_date.getUTCFullYear(),0)+"-"+cfdModule.pad(cur_date.getUTCMonth()+1,2)+"-"+cfdModule.pad(cur_date.getUTCDate(),2);

			if (ASSETS_TIMES[asset]){
				if (ASSETS_TIMES[asset][date]){
					times=ASSETS_TIMES[asset][date];
				}else if(ASSETS_TIMES[asset][cur_date.getDay()+1]){
					times=ASSETS_TIMES[asset][cur_date.getDay()+1];
				}
				var open_times="";
				for(var i in times){
					var t_start	= times[i].start.split(":");
					var t_end	= times[i].end.split(":");			
					open_times+=t_start[0]+":"+t_start[1]+":"+t_start[2];
					open_times+="-";
					open_times+=t_end[0]+":"+t_end[1]+":"+t_end[2]+" GMT<br/>";
				}
				$("#asset_details_trading_hours").html(open_times);
				
			}

		}
		

		
		
		$("#dlg_asset_details").dialog({
			"height":"auto",
			"width":"auto",
			 modal: true,
			"title":$("#dlg_asset_details").attr("txt_title")+" : " + ASSET_SETTINGS[asset].label,
			buttons: {
				        "Ok": function() {
				          $( this ).dialog( "close" );
				        }
				      }
		});
	},
	convertPrice:function(value,from,to,change_fee){
		if (from==to)
			return value;
		var rate=1;
		
		
			
		if (from=="EUR"){
			rate=typeof EUR_RATES[to] == "string" ? parseFloat(EUR_RATES[to]) : EUR_RATES[to];
		}else if(to=="EUR"){
			rate=typeof EUR_RATES[from] == "string" ? 1/parseFloat(EUR_RATES[from]) : 1/EUR_RATES[from];

		}else{
			rate=1/EUR_RATES[from]*EUR_RATES[to];	
		}
		
		if (typeof change_fee=="string")
			change_fee=parseFloat(change_fee);
		
		
			
		var total=value*rate;
		return total-(total*change_fee/100);
	},
	initAssetUpdateList:function(){
		var assetNames=[];
		
		$("[symbol]").each(function(){
			var asset=$(this).attr("symbol");
			assetNames.push(asset);
		});	
		
		for(var i in cfdModule.openTrades.trades){
			assetNames.push(cfdModule.openTrades.trades[i].asset_name);
		}
		for(var i in cfdModule.ordersTrades.trades){
			assetNames.push(cfdModule.ordersTrades.trades[i].asset_name);
		}
		var alerts=cfdModule.alerts.getActive();
		for(var asset in alerts){
			assetNames.push(asset);
		}
		
		//make it uniouqe
		cfdModule.assetsNames=$.grep(assetNames, function(v, k){
		    return $.inArray(v ,assetNames) === k;
		});
	},
	updateDayRangeList:function(){
		var assetsNames=cfdModule.assetsNames;
		$("[symbol]").each(function(){
			assetsNames.push($(this).attr("symbol"));
		});	
		//make it uniouqe
		assetsNames=$.grep(assetsNames, function(v, k){
		    return $.inArray(v ,assetsNames) === k;
		});
		
		var as_lst="";
		for(var i  in assetsNames){
			as_lst+=assetsNames[i]+",";	
		}	
		as_lst = as_lst.substring(0, as_lst.length - 1);
		if (cfdModule.tempData.lastSendOhlc==as_lst)
			return;
		cfdModule.tempData.lastSendOhlc=as_lst;
		
		var url="/remoteapisrv/ohlc/";
		$.post(url,{symbols:as_lst}, function (data) {
			
			for(var symbol in data){
				if (!cfdModule.assetPrices[symbol])
					cfdModule.assetPrices[symbol]={};
				
									
				if (data[symbol]==null){
					cfdModule.assetPrices[symbol].ibOpen=false;
					cfdModule.assetPrices[symbol].ibCloseReason="asset null (maybe unset ?)";
					continue;
				}
				
				var low=data[symbol].low;
				var high=data[symbol].high;
				
				if (data[symbol].open)
						cfdModule.assetPrices[symbol].open  = data[symbol].open;
						
				if (data[symbol].close)
						cfdModule.assetPrices[symbol].close  = data[symbol].close;

				if (data[symbol].last_price)
						cfdModule.assetPrices[symbol].last_price  = data[symbol].last_price;
						
												
				if (data[symbol].bid<0 && data[symbol].ask<0){
					cfdModule.assetPrices[symbol].ibCloseReason="bid & ask <0";
					cfdModule.assetPrices[symbol].ibOpen=false;
					continue;
				}

				if (data[symbol].bid>=data[symbol].ask){
					//$('tr[symbol="'+symbol+'"]').addClass("tradeClosed");
					cfdModule.assetPrices[symbol].ibCloseReason="bid >= ask";
					cfdModule.assetPrices[symbol].ibOpen=false;
					continue;
				}
				


				if (data[symbol].bid==0 && data[symbol].ask==0){
					cfdModule.assetPrices[symbol].ibOpen=false;
					cfdModule.assetPrices[symbol].ibCloseReason="bid & ask = 0";
					continue;
				}
				
				cfdModule.assetPrices[symbol].ibOpen=true;				
								
				if (!symbol || !data[symbol] || !data[symbol].high )
					continue;
				low=typeof low=="string" ? parseFloat(low) : low;
				high=typeof high=="string" ? parseFloat(high) : high;
				
				low=low.toFixed(ASSET_SETTINGS[symbol].digits);
				high=high.toFixed(ASSET_SETTINGS[symbol].digits);
				

				cfdModule.assetPrices[symbol].high  = data[symbol].high;
				cfdModule.assetPrices[symbol].low   = data[symbol].low;

				
				$('[symbol="'+symbol+'"]').find(".dayHighLow").attr("low",low).attr("high",high);

					
			}
		});
		/*
		for(var i  in assetsNames){
			if (cfdModule.isForexAsset(assetsNames[i])){
				as_lst+='"'+assetsNames[i]+'=X"';	
			}else{
				as_lst+='"'+assetsNames[i]+'"';	
			}
			
			
			as_lst+=",";
		}		
		//console.log(as_lst);
		var query='select * from yahoo.finance.quote where symbol in ('+as_lst+')';
		var url="//query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=json&callback=?&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	    $.getJSON(url, function (data) {
	    	//console.log(data);
	    	var result=data.query.results.quote;
	    	for(var i in result){
				var symbol=result[i].symbol.replace("=X","");
				var low=result[i].DaysLow;
				var high=result[i].DaysHigh;
				if (low==null || low=="null")
					low=0;
				if (high==null || high=="null")
					high=0;
				low=typeof low=="string" ? parseFloat(low) : low;
				high=typeof high=="string" ? parseFloat(high) : high;
				
				low=low.toFixed(ASSET_SETTINGS[symbol].digits)
				high=high.toFixed(ASSET_SETTINGS[symbol].digits)
				
				$('[symbol="'+symbol+'"]').find(".dayHighLow").text(low+"/"+high);
			}
	    	
	    });
		*/
		
	},
	sellAsset:function(asset){
		cfdModule.selectedAsset=asset;
		cfdModule.selectedType="SELL";
		$("#frm_buy_sell_assetName").val(asset)
		$("#frm_buy_sell_type").val("SELL")

		var rate = cfdModule.getAssetValue(cfdModule.selectedAsset,cfdModule.selectedType);
		var min_qty=ASSET_SETTINGS[asset].min_qty<ASSET_SETTINGS[asset].min_step ? ASSET_SETTINGS[asset].min_step : ASSET_SETTINGS[asset].min_qty

		$("#frm_buy_sell_amount").val(cfdModule.getDefaultAmount(asset));
		
		
		$("[ng-model='chk_tp']").prop("checked",false);
		$("[ng-model='chk_sl']").prop("checked",false);
		$("[ng-model='chk_order_rate']").prop("checked",false);
		
		
		
		
		angular.element($('[ng-model="chk_tp"]')).triggerHandler('click');
		angular.element($('[ng-model="chk_sl"]')).triggerHandler('click');
		angular.element($('[ng-model="chk_order_rate"]')).triggerHandler('click');		


		$("#frm_buy_sell_amount").attr({
			"step": ASSET_SETTINGS[asset].min_step,
			"min" : min_qty
		});

		$("#frm_buy_sell_amount").prop({
			"step": ASSET_SETTINGS[asset].min_step,
			"min" : min_qty
		});
		
		
		angular.element($('#frm_buy_sell_amount')).triggerHandler('input')
		angular.element($('#frm_buy_sell_amount')).triggerHandler('change'); //Fix IE BUG
		
		var rate=parseFloat(cfdModule.getAssetValue(cfdModule.selectedAsset,cfdModule.selectedType));
		cfdScope.order_rate_val=parseFloat((rate-(rate*cfdModule.minSpaceFromRate)).toFixed(ASSET_SETTINGS[cfdModule.selectedAsset].digits))
		
		var tp=rate-(rate*(cfdModule.minSpaceFromRate+0.02));
		var sl=rate+(rate*(cfdModule.minSpaceFromRate+0.02));
		$('[ng-model="tp_val"]').val(tp.toFixed(ASSET_SETTINGS[cfdModule.selectedAsset].digits));
		$('[ng-model="sl_val"]').val(sl.toFixed(ASSET_SETTINGS[cfdModule.selectedAsset].digits));

		angular.element($('[ng-model="tp_val"]')).triggerHandler('input');
		angular.element($('[ng-model="sl_val"]')).triggerHandler('input');
		
		
		
		$("#new_order_sl").attr("maxlength",$("#new_order_sl").val().length );		
		$("#new_order_tp").attr("maxlength",$("#new_order_tp").val().length );
		
		angular.element($('[ng-model="tp_val"]')).triggerHandler('change'); //FIX IE BUG
		angular.element($('[ng-model="sl_val"]')).triggerHandler('change'); //FIX IE BUG
		
		
		var btns={};
		var cancel_txt=$("#dlg_buy_sell").attr("txt_btnCancel");
		var ok_txt=$("#dlg_buy_sell").attr("txt_btnSell");
		btns[ok_txt]=function() { $("#frm_buy_sell").submit(); };
		btns[cancel_txt]= function() { $( this ).dialog( "close" ); };
				
		$("#dlg_buy_sell_only_type").text($("#dlg_buy_sell_only_type").attr("txt_sell"));
		
		$("#dlg_buy_sell").dialog({
			"height": "auto",
			"width" : "500",
			"modal" : true,
			"title" : $("#dlg_buy_sell").attr("title_sell")+ " : " + ASSET_SETTINGS[asset].label,
			buttons : btns
		});
	},
	buyAsset:function(asset){
		cfdModule.selectedAsset=asset;
		cfdModule.selectedType="BUY";

		var rate = cfdModule.getAssetValue(cfdModule.selectedAsset,cfdModule.selectedType);
		var min_qty=ASSET_SETTINGS[asset].min_qty<ASSET_SETTINGS[asset].min_step ? ASSET_SETTINGS[asset].min_step : ASSET_SETTINGS[asset].min_qty;
		

		$("#frm_buy_sell_amount").val(cfdModule.getDefaultAmount(asset));
		

		$("#frm_buy_sell_assetName").val(asset)
		$("#frm_buy_sell_type").val("BUY")

		
		$("[ng-model='chk_tp']").prop("checked",false);
		$("[ng-model='chk_sl']").prop("checked",false);
		$("[ng-model='chk_order_rate']").prop("checked",false);
		
		angular.element($('[ng-model="chk_tp"]')).triggerHandler('click');
		angular.element($('[ng-model="chk_sl"]')).triggerHandler('click');
		angular.element($('[ng-model="chk_order_rate"]')).triggerHandler('click');
		
		
		
		$("#frm_buy_sell_amount").attr({
			"step": ASSET_SETTINGS[asset].min_step,
			"min" : min_qty
		});
		
		$("#frm_buy_sell_amount").prop({
			"step": ASSET_SETTINGS[asset].min_step,
			"min" : min_qty
		});		
		
		angular.element($('#frm_buy_sell_amount')).triggerHandler('input');
		angular.element($('#frm_buy_sell_amount')).triggerHandler('change'); //Fix IE BUG
		
		var rate=parseFloat(cfdModule.getAssetValue(cfdModule.selectedAsset,cfdModule.selectedType));
		cfdScope.order_rate_val=parseFloat((rate+(rate*cfdModule.minSpaceFromRate)).toFixed(ASSET_SETTINGS[cfdModule.selectedAsset].digits))
		
		$("#dlg_buy_sell_only_type").text($("#dlg_buy_sell_only_type").attr("txt_buy"));
		
		
		var tp=rate+(rate*(cfdModule.minSpaceFromRate+0.02));
		var sl=rate-(rate*(cfdModule.minSpaceFromRate+0.02));
		$('[ng-model="tp_val"]').val(tp.toFixed(ASSET_SETTINGS[cfdModule.selectedAsset].digits));
		$('[ng-model="sl_val"]').val(sl.toFixed(ASSET_SETTINGS[cfdModule.selectedAsset].digits));

		angular.element($('[ng-model="tp_val"]')).triggerHandler('input');
		angular.element($('[ng-model="sl_val"]')).triggerHandler('input');

		angular.element($('[ng-model="tp_val"]')).triggerHandler('change'); //FIX IE BUG
		angular.element($('[ng-model="sl_val"]')).triggerHandler('change'); //FIX IE BUG
				

		$("#new_order_sl").attr("maxlength",$("#new_order_sl").val().length );		
		$("#new_order_tp").attr("maxlength",$("#new_order_tp").val().length );
		
		
		var btns={};
		var cancel_txt=$("#dlg_buy_sell").attr("txt_btnCancel");
		var ok_txt=$("#dlg_buy_sell").attr("txt_btnBuy");
		btns[ok_txt]=function() { $("#frm_buy_sell").submit(); };
		btns[cancel_txt]= function() { $( this ).dialog( "close" ); };		
		
		$("#dlg_buy_sell").dialog({
			"height": "auto",
			"width" : "500",
			"modal" :  true,
			"title" : $("#dlg_buy_sell").attr("title_buy")+ " : " + ASSET_SETTINGS[asset].label,
			buttons: btns
		});
	},
	getDefaultAmount:function(asset){
		var margin=0;
		var rate = cfdModule.getAssetValue(cfdModule.selectedAsset,cfdModule.selectedType);
		var ava=cfdModule.balance.available()/5;
		var source_curr=ASSET_SETTINGS[asset].currency;
		
		
		if (cfdModule.isForexAsset(asset)){
			margin=ava*cfdModule.getCurrentLeverage();	
			margin=cfdModule.convertPrice(margin,CURRENCY,source_curr,ASSET_SETTINGS[asset].change_fee*-1);
		}else{
			margin=ava*cfdModule.getCurrentLeverage()/rate;	
			margin=cfdModule.convertPrice(margin,CURRENCY,source_curr,ASSET_SETTINGS[asset].change_fee*-1);
		}
		
		margin=Math.round(margin);
		var amount=margin-(margin%ASSET_SETTINGS[asset].min_step);
		var min_qty=ASSET_SETTINGS[asset].min_qty<ASSET_SETTINGS[asset].min_step ? ASSET_SETTINGS[asset].min_step : ASSET_SETTINGS[asset].min_qty;
		
		var num = Math.floor((amount.toString().length)/2);
		if (num>0){
			var n_amount= amount.toString().substr(0,num);
			for(var i=num;i<amount.toString().length;i++){
				n_amount+="0";
			}	
			amount=parseInt(n_amount);		
		}


		
		if (amount<min_qty)
			amount=min_qty;
		return amount;
	},
	calcChange:function(price,open_price){
		if (!price || !open_price)
			return 0;
		var change=((open_price-price)/price)*100;
		if (change>0 || change<0)
			return parseFloat(change.toFixed(2));
		return 0;
	},
	onPriceTick:function(assetPrices){},
	onTradeOrderActivated:function(data){},
	onTradeSlClose:function(data){},
	onTradeTPClose:function(data){},
	onTradeMarginClose:function(data){},
	onTradeAssetExpired:function(data){},
	onAssetAlert:function(alert,asset,current_rate){},
	_callbacks:{
		trade_order_activated:function(data){
			cfdModule.reloadServerData();
			cfdModule.onTradeOrderActivated(data);
		},
		trade_sl_close:function(data){
			cfdModule.reloadServerData();
			cfdModule.onTradeSlClose(data);
		},
		trade_tp_close:function(data){
			cfdModule.reloadServerData();
			cfdModule.onTradeTPClose(data);
		},
		trade_magin_close:function(data){
			cfdModule.reloadServerData();
			cfdModule.onTradeMarginClose(data);
		},
		trade_asset_expired:function(data){
			cfdModule.reloadServerData();
			cfdModule.onTradeAssetExpired(data);
		},
		currentTime:function(data){
			cfdModule.tempData.time=new Date(data.time);
		},
		tradeClosed:function(data){
			cfdModule.reloadServerData();
		},
		tradeClosedOrder:function(data){
			cfdModule.reloadServerData();
		},
		groupUpdated:function(data){
			if (data.group_id==GROUP_ID){
				cfdModule.reloadServerData();
			}
		},
		updateBalance:function(data){
			cfdModule.reloadServerData();
		},
		cfdGroupUpdated:function(data){
			if (data.new_group_id!=GROUP_ID){
				cfdModule.reloadServerData();
			}
		},
		getPrices:function(data){
        	var i=0;
        	var randAsset=null;
        	var updatedAssets={};
        	
        	var alerts=cfdModule.alerts.getActive();
        	for(var asset in data){
        		var sell_buy=data[asset].split(" ");
        		var updated=false;
        		
        		if 	(!cfdModule.assetPrices[asset]){
        			cfdModule.assetPrices[asset]={};
        			updated=true;
        		}else{
        			if (sell_buy[0] > cfdModule.assetPrices[asset]["sell"]){
        				cfdModule.assetPrices[asset]["sell_status"]="up";
        				updated=true;	
        			}else if (sell_buy[0] < cfdModule.assetPrices[asset]["sell"]){
        				cfdModule.assetPrices[asset]["sell_status"]="down";	
        				updated=true;
        			}
        			
        			if (sell_buy[1] > cfdModule.assetPrices[asset]["buy"]){
        				cfdModule.assetPrices[asset]["buy_status"]="up";
        				updated=true;
        			}else if (sell_buy[1] < cfdModule.assetPrices[asset]["buy"]){
        				cfdModule.assetPrices[asset]["buy_status"]="down";	
        				updated=true;
        			}
        		}
  				
  				if (updated)
					updatedAssets[asset]=cfdModule.assetPrices[asset];
				       			
        		cfdModule.assetPrices[asset]["sell"] =parseFloat(sell_buy[0]);
        		cfdModule.assetPrices[asset]["buy"]  =parseFloat(sell_buy[1]);    
         		
         		if (updated && cfdModule.charts.mainChart &&  cfdModule.charts.mainChart.asset==asset
         		 	/*
         			cfdModule.charts.mainChart.barSize=="1 secs" && 
         			cfdModule.charts.mainChart.chartType!="candlestick" && 
         			cfdModule.charts.mainChart.chartType!="ohlc" 
         			*/
         		){
         			var t=(new Date()).getTime();// current time
         			y = (cfdModule.assetPrices[asset]["sell"]+cfdModule.assetPrices[asset]["buy"])/2;
         			cfdModule.charts.mainChart.addData(t,y);
         			/*
         			if (!cfdModule.charts.mainChart.lastUpdate)
         				cfdModule.charts.mainChart.lastUpdate=0;
         			if (cfdModule.charts.mainChart.lastUpdate+1000< t){
         				
         				if (cfdModule.charts.mainChart.lastValue!=y){
		         			cfdModule.charts.mainChart.lastUpdate=t;
		         			
		         			
		         			if (cfdModule.charts.mainChart.chart && cfdModule.charts.mainChart.chart.series){
			        			var series =cfdModule.charts.mainChart.chart.series[0];
			        			
								cfdModule.charts.mainChart.lastValue=y;
								
								var points=series.points;
								if (points.length>400){
									var lastPoint=points[points.length-1];
									if (lastPoint)
										lastPoint.remove();	
								}
								

								
								var point=new cfdModule.charts.mainChart.chartPoint(t,y,y,y,y);

								
					            series.addPoint(point, true, false,{
					                duration: 500,
					                easing: 'easeInOutCubic'
					            });		
					            
								series.yAxis.removePlotLine("currentPrice");
					            series.yAxis.addPlotLine({
					                value: y,
					                id: "currentPrice",
					                width: 1,
					                color: '#e2e2e2',//rgba(255,255,0,1)',
					                dashStyle: 'ShortDot',
					                zIndex: 100000000000000,
					                label: {
					                    useHTML: true,
					                    //html: tickText,
					                    text: Number(y).toFixed(5),
					                    //backgroundColor:'#cccccc',
					                    align: 'left',
					                }
					            })
							}	
							
							
						}
						
												
					}
					*/
				}	 
				
				if (cfdModule.assetPrices[asset]){
					var o=0;
					if (cfdModule.assetPrices[asset].close>0){
						o=cfdModule.assetPrices[asset].close;
					}else{
						if (cfdModule.assetPrices[asset].open>0){
							o=cfdModule.assetPrices[asset].open
						}
					}
					
					var p=cfdModule.assetPrices[asset]["sell"];	
					if (cfdModule.assetPrices[asset].last_price && cfdModule.assetPrices[asset].last_price>0){
						p=cfdModule.assetPrices[asset].last_price;
					}
					
					/*
					if (!cfdModule.isOpenAsset(p)){
						if ((cfdModule.assetPrices[asset].close && cfdModule.assetPrices[asset].close>0) && (cfdModule.assetPrices[asset].open && cfdModule.assetPrices[asset].open>0)){
							p=cfdModule.assetPrices[asset].close;
							o=cfdModule.assetPrices[asset].open;
						}	
					}
					*/
					cfdModule.assetPrices[asset]["change"]=cfdModule.calcChange(o,p);			
				}
				
				if (alerts[asset]){
					var asset_alerts=alerts[asset];
			    	for(var i in asset_alerts){
			    		var alert=asset_alerts[i];
			    		var current_rate =  cfdModule.getAssetValue(asset,alert.type.toUpperCase());
			    		var d=alert.rate-alert.on_create_rate;
			    		var notify=false;
			    		
			    		if (alert.report_by_notify=="PENDING_SEND"){
			    			notify=true;
			    		}
			    			
			    			
			    		if (d>0 && current_rate>=alert.rate){
			    			notify=true;
			    			
			    		}else if(d<0 && current_rate<=alert.rate){
			    			notify=true;
			    			//console.log([alert.type.toLowerCase(),alert.rate])
			    		}else if(d==0){
			    			notify=true;
			    		}
			    		
			    		if (notify){
							alert.report_by_notify="SENDED";
							cfdModule.onAssetAlert(alert,asset,current_rate);
			    		}

			    	}					
				}
        	}
        	if (Object.keys(updatedAssets).length>0){
				cfdModule.onPriceTick(updatedAssets);
				
			}
        		

        }
	},
	updateAssetsValues:function(){
		if (cfdModule.assetPrices.length==0)
			return;
		WS.sendFunction("getPrices",{
			assets:cfdModule.assetsNames
		});
	}
}
$(function(){
	cfdModule.init();
});


