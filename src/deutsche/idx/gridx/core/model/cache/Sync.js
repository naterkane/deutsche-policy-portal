define([
	"../../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../../../node_modules/intern-geezer/node_modules/dojo/_base/Deferred",
	"./_Cache"
], function(declare, Deferred, _Cache){

	return declare(/*===== "gridx.core.model.cache.Async", =====*/_Cache, {
		keep: function(){},
		free: function(){},

		when: function(args, callback){
			var d = new Deferred;
			try{
				if(callback){
					callback();
				}
				d.callback();
			}catch(e){
				d.errback(e);
			}
			return d;
		},

		//Private---------------------------------------------
		_init: function(method, args){
			var t = this;
			if(!t._filled){
				t._storeFetch({ start: 0 });
				if(t.store.getChildren){
					t._fetchChildren();
				}
			}
		},

		_fetchChildren: function(){
			var s = this._struct,
				pids = s[''].slice(1),
				pid;
			while(pids.length){
				pid = pids.shift();
				Deferred.when(this._loadChildren(pid), function(){
					[].push.apply(pids, s[pid].slice(1));
				});
			}
		}
	});
});
