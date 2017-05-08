var cfdScope=null;
var app = angular.module('cfdApp', ['ngRoute']);

app.directive('unbindable', function(){
    return {
        scope: true
    };
});



app.filter("sanitize", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
}]);


app.controller('cfdController', function($scope) {
	cfdScope=$scope;
    $scope.unbind = function(el_id) {
        var element =  document.getElementById(el_id);
        angular.element( element ).scope().$destroy();
    };

	$scope.currentTime=function(){
		function pad(n, width, z) {
		  z = z || '0';
		  n = n + '';
		  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}		
		var date=new Date();
		return pad(date.getUTCHours(),2)+":"+pad(date.getUTCMinutes(),2)+":"+pad(date.getUTCSeconds(),2);		
	}
	
	$scope.market=function(){
		
	}
	
	$scope.get_margin_usage=function(){
		var mu=Number(cfdModule.balance.maintenance_margin())/Number(cfdModule.balance.equity())*100;
		return isNaN(mu) ? "0.00"  : mu.toFixed(2);
	};
	
	
	$scope.get_exposure_coverage=function(){
		/*
		var amount=0;
		for(var i in cfdModule.openTrades.trades){
			var trade=cfdModule.openTrades.trades[i];
			amount+=Number(trade.total_value());
		}		
		var t=Number(amount/Number(cfdModule.balance.available()));
		return isNaN(t)  ? "0.00" : t.toFixed(2);
		*/
		var mu=Number(cfdModule.balance.maintenance_margin())/Number(cfdModule.balance.equity())*100;
		return isNaN(mu) ? "0.00"  : mu.toFixed(2);
	};
	
	$scope.get_net_exposure=function(){
		var amounts={"BUY":0,"SELL":0};
		for(var i in cfdModule.openTrades.trades){
			var trade=cfdModule.openTrades.trades[i];
			amounts[trade.type]+=Number(trade.total_value());
		}
		return Number((amounts["BUY"] - amounts["SELL"])/cfdModule.balance.available()).toFixed(2);
	};
	
	$scope.isActivatedOrderId = function(trade_id){		
		return ""; // Auto reload by WS
		var t = cfdModule.ordersTrades.trades[trade_id].isActivated();	
		if (t)
			cfdModule.reloadServerData();
		return "";
	}	
	
	$scope.set_tp_sl = function(){
		var selected=cfdModule.selectedAsset;
		var type=cfdModule.selectedType;
		if (selected==null || type==null)
			return "";
		

		
		
		if (cfdModule.selectedType=="SELL"){
			var rate=parseFloat(cfdModule.getAssetValue(selected,"BUY"));
			var rate_high = rate+(rate*cfdModule.minSpaceFromRate); 
			var rate_low  = rate-(rate*cfdModule.minSpaceFromRate);
			var sl=rate_high;
			var tp=rate_low;
			/*
			if (cfdScope.tp_val>tp){
				$scope.tp_val=parseFloat(tp.toFixed(ASSET_SETTINGS[selected].digits));
			}
				
			
			if (cfdScope.sl_val<sl){
				$scope.sl_val=parseFloat(sl.toFixed(ASSET_SETTINGS[selected].digits));			
			}
			*/	
		}else{
			var rate=parseFloat(cfdModule.getAssetValue(selected,"SELL"));
			var rate_high = rate+(rate*cfdModule.minSpaceFromRate); 
			var rate_low  = rate-(rate*cfdModule.minSpaceFromRate);
			var sl=rate_low;
			var tp=rate_high;
			/*
			if (cfdScope.tp_val<tp)
				$scope.tp_val=parseFloat(tp.toFixed(ASSET_SETTINGS[selected].digits));
			
			if (cfdScope.sl_val>sl)
				$scope.sl_val=parseFloat(sl.toFixed(ASSET_SETTINGS[selected].digits));	
			*/
		}

		var rate=parseFloat(cfdModule.getAssetValue(selected,cfdModule.selectedType));
		var rate_high = rate+(rate*cfdModule.minSpaceFromRate); 
		var rate_low  = rate-(rate*cfdModule.minSpaceFromRate);
		/*
		if (cfdScope.order_rate_val>rate_low && cfdScope.order_rate_val<rate_high){
			var val = ($scope.order_rate_val-rate_low) > (rate_high-$scope.order_rate_val)	?  rate_high : rate_low;
			$scope.order_rate_val= parseFloat(val.toFixed(ASSET_SETTINGS[selected].digits));
		}	
		*/
		


		return "";
	};
	
	$scope.if_trade_closed = function (assetName){
		if (!cfdModule.assetPrices[assetName] || !cfdModule.assetPrices[assetName].buy || !cfdModule.assetPrices[assetName].sell)
			return "tradeClosed";	
		if (cfdModule.assetPrices[assetName].sell>=cfdModule.assetPrices[assetName].buy)
			return "tradeClosed";		
		if (!cfdModule.assetPrices[assetName].ibOpen)
			return "tradeClosed";
		if (!cfdModule.isOpenAsset(assetName))
			return "tradeClosed";
		return "";
	}
		
		
	$scope.get_trade_current_rate = function(trade_id){
		if (!cfdModule.openTrades.trades[trade_id])
			return;
		return cfdModule.openTrades.trades[trade_id].current_rate();	
	};
	$scope.get_order_trade_current_rate = function(trade_id){
		if (!cfdModule.ordersTrades.trades[trade_id])
			return;
		return cfdModule.ordersTrades.trades[trade_id].current_rate();	
	};
		
	
	
	$scope.get_m_margin = function(){
		return cfdModule.balance.maintenance_margin().toFixed(3);	
	};
	
	$scope.get_balance_available = function(){
		return cfdModule.balance.available().toFixed(2);		
	}
	
	$scope.get_balance = function(){
		return Number(BALANCE).toFixed(2);		
	}
		
	
	
	
	$scope.get_balance_equity = function(){
		return cfdModule.balance.equity().toFixed(2);		
	}
			
	
	$scope.get_trade_pnl_class = function(trade_id){
		if (!cfdModule.openTrades.trades[trade_id])
			return "";
		var pnl =cfdModule.openTrades.trades[trade_id].pnl();	
		if (pnl>0)
			return "up";
		if (pnl<0)
			return "down";			
		return "";			
	}
		
	$scope.calc_trade_pnl = function(trade_id){
		if (!cfdModule.openTrades.trades[trade_id])
			return;
		return cfdModule.openTrades.trades[trade_id].pnl();	
	}
	
	$scope.get_open_trades_count=function(){
		return Object.keys(cfdModule.openTrades.trades).length;
	};
	
	$scope.get_orders_trades_count=function(){
		return Object.keys(cfdModule.ordersTrades.trades).length;
	};
	
	$scope.get_total_pnl_class=function(){
		var pnl  = cfdModule.openTrades.totalPNL();
		var comm = cfdModule.openTrades.totalCommission();
		var swap = cfdModule.openTrades.totalSwap();		
		comm=comm+swap;
		pnl-=comm;
		
		pnl =parseFloat(pnl.toFixed(2));
		
		if (pnl>0)
			return "up";
		if (pnl<0)
			return "down";			
		return "na";
	}
	
	$scope.get_open_trades_pnl=function(){
		var cur=CURRENCIES[CURRENCY];
		var pnl  = cfdModule.openTrades.totalPNL();
		var comm = cfdModule.openTrades.totalCommission();
		var swap = cfdModule.openTrades.totalSwap();
		
		comm=comm+swap;
		pnl-=comm;
		return  parseFloat((pnl).toFixed(2)).toFixed(2);	
	};
	
	$scope.get_selected_currency = function(){
		return cfdModule.getCurrentcurrency();
	}
	
	$scope.get_selected_margin_percent = function(){
		return cfdModule.getCurrentMarginPercent().toFixed(2)+"%";
	}

	$scope.get_selected_maintenance_margin_percent = function(){
		return cfdModule.getCurrentMarginMaintancePercent().toFixed(2)+"%";
	}
	
	$scope.is_show_buy_sell_value = function(){
		return true;
		var selected=cfdModule.selectedAsset;
		if (!selected)
			return null;
		return ASSET_SETTINGS[selected].type_id!=1;
	}
	
	
	$scope.get_selected_leverage = function(){
		return "1:"+cfdModule.getCurrentLeverage();
	}
	
	$scope.calc_total_value = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (ASSET_SETTINGS[selected].type_id==1){
			var total= $scope.buy_sell_amount;
		}else{
			var total= $scope.get_current_rate()*$scope.buy_sell_amount;	
		}
		if (!total)
			return "0 "+CURRENCIES[source_curr]+ " = " +"0 "+ CURRENCIES[CURRENCY];
			 
		if (typeof(total)=="string")
			total=parseFloat(total);
		
		var total_currency=cfdModule.convertPrice(total,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		return total.toFixed(2)+" "+CURRENCIES[source_curr]+ " = " +total_currency.toFixed(2)+" "+ CURRENCIES[CURRENCY];
		
	};
	
	$scope.get_selected_asset = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return "";
		return ASSET_SETTINGS[selected].label;
	}
	
	$scope.get_current_rate = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;
		var type=cfdModule.selectedType;
		
		return  cfdModule.getAssetValue(selected,type);
	}
	
	$scope.calc_commission = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;
			
		var total= $scope.get_current_rate()*$scope.buy_sell_amount;
		var source_curr=ASSET_SETTINGS[selected].currency;
		
		var commission=total*(ASSET_SETTINGS[selected].commision/100);
		commission_currency=cfdModule.convertPrice(commission,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		
		
		return commission.toFixed(2)+" "+CURRENCIES[source_curr]+ " = " +commission_currency.toFixed(2)+" "+ CURRENCIES[CURRENCY];
		
	}
	
	$scope.calc_req_margin = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;
		var source_curr=ASSET_SETTINGS[selected].currency;

		var margin=0;
		if (cfdModule.isForexAsset(selected)){
			margin=$scope.buy_sell_amount/cfdModule.getCurrentLeverage();	
		}else{
			var total= $scope.get_current_rate()*$scope.buy_sell_amount;
			margin=total/cfdModule.getCurrentLeverage();	
		}
		
		var margin_currency=cfdModule.convertPrice(margin,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		
		return margin.toFixed(2)+" "+CURRENCIES[source_curr]+" = "+margin_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
	}

	$scope.get_asset_sell_value = function (asset) {
	    return cfdModule.getAssetValue(asset,"SELL");
	};

	$scope.get_asset_buy_value = function (asset) {
		return cfdModule.getAssetValue(asset,"BUY");
	};
	
	$scope.get_asset_sell_status = function (asset) {
		if (cfdModule.assetPrices[asset])
			return cfdModule.assetPrices[asset]["sell_status"];
	    return "";
	};

	$scope.get_asset_buy_status = function (asset) {
		if (cfdModule.assetPrices[asset])
			return cfdModule.assetPrices[asset]["buy_status"];
	    return "";
	};

	$scope.calc_tp_profit = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return "0";	

		if ($scope.chk_order_rate){
			var total= $scope.order_rate_val*$scope.buy_sell_amount;
		}else{
			var total= $scope.get_current_rate()*$scope.buy_sell_amount;	
		}
		
		var will_total= Number($scope.tp_val)*Number($scope.buy_sell_amount);
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (cfdModule.isForexAsset(selected)){
			source_curr=selected.replace(source_curr,"");
		}

		//var profit= Math.abs(total-will_total);
		if (cfdModule.selectedType=="BUY"){
			var profit= will_total-total;
		}else{
			var profit= total-will_total;
		}		
		
		
		var profit_currency=cfdModule.convertPrice(profit,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		if (isNaN(profit_currency))
			return null;
		var ret=profit.toFixed(2)+CURRENCIES[source_curr]+ " = "+profit_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
		if (profit<0){
			ret="<span style='color:red'>"+ret+"</span>";
		}
		return ret;
	} 
	
	$scope.calc_sl_profit = function(){
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return "0";		
		if ($scope.chk_order_rate){
			var total= $scope.order_rate_val*$scope.buy_sell_amount;
		}else{
			var total= $scope.get_current_rate()*$scope.buy_sell_amount;	
		}
		var will_total= $scope.sl_val*$scope.buy_sell_amount;
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (cfdModule.isForexAsset(selected)){
			source_curr=selected.replace(source_curr,"");
		}		

		//var profit= Math.abs(total-will_total)*-1;
		if (cfdModule.selectedType=="BUY"){
			var profit= will_total-total;
		}else{
			var profit= total-will_total;
		}		
				
		var profit_currency=cfdModule.convertPrice(profit,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		if (isNaN(profit_currency))
			return null;		
		var ret= profit.toFixed(2)+CURRENCIES[source_curr]+ " = "+profit_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
		if (profit>0){
			ret="<span style='color:red'>"+ret+"</span>";
		}
		return ret;		
	}

	$scope.calc_trade_tp_profit = function(){
		var trade_id=cfdModule.tempData ?  cfdModule.tempData.trade_id : null;
		if (!trade_id || !cfdModule.openTrades.trades[trade_id])
			return 0;	
		
		var amount		= parseFloat(cfdModule.openTrades.trades[trade_id].amount);
		var open_price	= parseFloat(cfdModule.openTrades.trades[trade_id].open_price);
		
		
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;		
		var total= open_price*amount;
		var will_total= parseFloat($scope.tp_val)*amount;
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (cfdModule.isForexAsset(selected)){
			source_curr=selected.replace(source_curr,"");
		}		
		

		
		if (cfdModule.openTrades.trades[trade_id].type=="BUY"){
			var profit= will_total-total;
		}else{
			var profit= total-will_total;
		}
		
		var profit_currency=cfdModule.convertPrice(profit,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		
		return profit.toFixed(2)+CURRENCIES[source_curr]+ " = "+profit_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
	} 

	$scope.calc_order_trade_tp_profit = function(){
		var trade_id=cfdModule.tempData ?  cfdModule.tempData.trade_id : null;
		if (!trade_id || !cfdModule.ordersTrades.trades[trade_id])
			return 0;	
		
		var amount		= parseFloat(cfdModule.ordersTrades.trades[trade_id].amount);
		var open_price	= parseFloat(cfdModule.ordersTrades.trades[trade_id].open_price);
		
		
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;		
		var total= open_price*amount;
		var will_total= parseFloat($scope.tp_val)*amount;
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (cfdModule.isForexAsset(selected)){
			source_curr=selected.replace(source_curr,"");
		}		
		

		
		if (cfdModule.ordersTrades.trades[trade_id].type=="BUY"){
			var profit= will_total-total;
		}else{
			var profit= total-will_total;
		}
		
		var profit_currency=cfdModule.convertPrice(profit,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		
		return profit.toFixed(2)+CURRENCIES[source_curr]+ " = "+profit_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
	} 
	
	
	$scope.calc_trade_sl_profit = function(){
		var trade_id=cfdModule.tempData ?  cfdModule.tempData.trade_id : null;
		if (!trade_id || !cfdModule.openTrades.trades[trade_id])
			return 0;		
		var amount		= parseFloat(cfdModule.openTrades.trades[trade_id].amount);
		var open_price	= parseFloat(cfdModule.openTrades.trades[trade_id].open_price);
				
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;		
		var total= open_price*amount;
		var will_total= $scope.sl_val*amount;
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (cfdModule.isForexAsset(selected)){
			source_curr=selected.replace(source_curr,"");
		}

		
		if (cfdModule.openTrades.trades[trade_id].type=="BUY"){
			var profit= will_total-total;
		}else{
			var profit= total-will_total;
		}
		
		
		var profit_currency=cfdModule.convertPrice(profit,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		
		return profit.toFixed(2)+CURRENCIES[source_curr]+ " = "+profit_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
	}

	$scope.calc_order_trade_sl_profit = function(){
		var trade_id=cfdModule.tempData ?  cfdModule.tempData.trade_id : null;
		if (!trade_id || !cfdModule.ordersTrades.trades[trade_id])
			return 0;		
		var amount		= parseFloat(cfdModule.ordersTrades.trades[trade_id].amount);
		var open_price	= parseFloat(cfdModule.ordersTrades.trades[trade_id].open_price);
				
		var selected=cfdModule.selectedAsset;
		if (selected==null)
			return 0;		
		var total= open_price*amount;
		var will_total= $scope.sl_val*amount;
		var source_curr=ASSET_SETTINGS[selected].currency;
		if (cfdModule.isForexAsset(selected)){
			source_curr=selected.replace(source_curr,"");
		}

		
		if (cfdModule.ordersTrades.trades[trade_id].type=="BUY"){
			var profit= will_total-total;
		}else{
			var profit= total-will_total;
		}
		
		
		var profit_currency=cfdModule.convertPrice(profit,source_curr,CURRENCY,ASSET_SETTINGS[selected].change_fee*-1);
		
		return profit.toFixed(2)+CURRENCIES[source_curr]+ " = "+profit_currency.toFixed(2)+" "+CURRENCIES[CURRENCY];
	}
		

	$scope.get_asset_change_value = function (asset) {
		if (cfdModule.assetPrices[asset] && cfdModule.assetPrices[asset].change){					
			var change=cfdModule.assetPrices[asset].change;
			if (change>0 || change<0){
				return change.toFixed(2)+"%";
			}
		}
			
	    return "0.00"+"%";
	}; 
		
	$scope.get_asset_change_status = function (asset) {
		if (!cfdModule.isOpenAsset(asset)){
			return "";
		}		
		if (cfdModule.assetPrices[asset] && cfdModule.assetPrices[asset].change){
			change=cfdModule.assetPrices[asset].change;
			if (change>0){
				return "change_up";
			}else if (change<0){
				return "change_down";
			}
			return "";
		}
	};
		

});