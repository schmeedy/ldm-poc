/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.layout.connection.SketchBridgedConnectionRouter
 * <b>BETA VERSION. Not for production!!!<br></b>
 * Provide a router which routes the connection in a hand drawn manner.
 * 
 * 
 * @inheritable
 * @author Andreas Herz
 * 
 * @extends  draw2d.layout.connection.MazeConnectionRouter
 */
draw2d.layout.connection.SketchConnectionRouter = draw2d.layout.connection.MazeConnectionRouter.extend({
    NAME : "draw2d.layout.connection.SketchConnectionRouter",


	/**
	 * @constructor 
	 * Creates a new Router object.
	 * 
	 */
    init: function(){
    	this._super();
    	
    	this.useSpline = true;
    	this.useShift = 5;
    	this.useSimplifyValue=0.2;
        this.finder = new PF.JumpPointFinder({allowDiagonal: false,dontCrossCorners: true});
    }
});