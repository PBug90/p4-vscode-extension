import { logDebug, logInfo} from '../utils/logger';
import { MyP4Listener } from '../compiler/my_p4_listener';


export function resourceCalculator(ctx, typeDefMap, actionMap) {

	var tableIdentifier = ctx.getChild(2).getText();	//storing the table identifier just in case

	const findSize = {
		'multiplier': 0,
		'size': 0
	};
	
	
	const maxSize = {
		'max': 0
	};

	MyP4Listener.prototype.enterNonTableKwName = function(ctx){
		var isSize = ctx.getText();
		MyP4Listener.prototype.enterInitializer = function(ctx) {	
			if (isSize == "size"){	//if not equal to drop()...
				findSize.multiplier = Number(ctx.getText());	//setting the multiplier for findSize
			}
		};
	};


	//Only want to get action ref if it's inside table property
	MyP4Listener.prototype.enterActionRef = function(ctx) {
	
		if (actionMap.has(ctx.getText())){
	
			actionMap.get(ctx.getText()).forEach(element => {
				if (typeDefMap.has(element)){
					findSize.size += Number(typeDefMap.get(element));
				}
	
			});
	
			if (findSize.size > maxSize.max){
				maxSize.max = findSize.size;	//in order to ensure the maximum size;
				findSize.size = 0;	//resetting size
			}
		}
	};
	var totalResources = maxSize.max*findSize.multiplier;
	return totalResources;

}



