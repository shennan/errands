module.exports = function(){
	
	var errand = {

		args:arguments,
		errands:[],
		asyncs:[],
		index:0,
		running:false,

		next:function(){
			
			if(errand.errands[errand.index]){

				errand.running = true;

				var fn = errand.errands[errand.index];

				setTimeout(function(){

					fn.apply(errand, errand.args);

					if(!errand.asyncs[errand.index - 1]){

						errand.next();

					}
				}, 0);

				errand.index++;

			}else{

				errand.running = false;

			}

			return errand;

		},

		run:function(fn, async){

			async = async || 0;

			if(typeof fn === 'function'){

				errand.errands.push(fn);
				errand.asyncs.push(async);

			}else if(typeof fn === 'object'){
				
				for(var i in fn){

					errand.errands.push(fn[i]);
					errand.asyncs.push(async);

				}
			}

			return !errand.running ? errand.next() : errand;

		},

		wait:function(fn){

			fn = fn || 1000;

			if(typeof fn === 'number'){

				errand.run(function(){

					setTimeout(this.next, fn);

				}, 1);

			}else{

				errand.run(fn, 1);

			}

			return !errand.running ? errand.next() : errand;

		},

		repeat:function(i){

			i = i || 1;

			var fn = errand.errands[errand.errands.length - 1];
			var async = errand.asyncs[errand.asyncs.length - 1];
			
			if(fn){

				for(; i; i--){
					
					errand.run(fn, async);
					
				}
			}

			return !errand.running ? errand.next() : errand;

		},

		skip:function(i){

			i = i || 1;
			
			errand.run(function(){

				errand.index += i;

				errand.next();

			}, 0)

			return !errand.running ? errand.next() : errand;

		}
	}

	return errand;

}