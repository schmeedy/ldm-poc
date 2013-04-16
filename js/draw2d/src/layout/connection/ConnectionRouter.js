/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.layout.connection.ConnectionRouter
 * Routes a {@link draw2d.Connection}, possibly using a constraint.
 *
 * @author Andreas Herz
 */
draw2d.layout.connection.ConnectionRouter = Class.extend({
    NAME : "draw2d.layout.connection.ConnectionRouter",

	/**
	 * @constructor 
	 * Creates a new Router object
	 */
    init: function(){
    },
    
    
    /**
     * @method
     * Routes the Connection.
     * 
     * @param {draw2d.Connection} connection The Connection to route
     * @template
     */
    route:function( connection)
    {
    	throw "subclasses must implement the method [ConnectionRouter.route]";
    }   
});