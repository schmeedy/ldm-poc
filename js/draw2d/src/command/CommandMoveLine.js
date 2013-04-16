/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.command.CommandMoveLine
 * 
 * Command for the movement of figures.
 *
 * @inheritable
 * @author Andreas Herz
 * 
 * @extends draw2d.command.Command
 */
draw2d.command.CommandMoveLine = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandMoveLine", 
  
    /**
     * @constructor
     * Create a new Command objects which can be execute via the CommandStack.
     *
     * @param {draw2d.Figure} figure the figure to move
     * @param {Number} [x] the current x position
     * @param {Number} [y] the current y position
     */
    init : function(figure, startX, startY, endX, endY)
    {
        this._super("Line moved");
        this.line     = figure;
        this.startX1  = startX;
        this.startY1  = startY;
        this.endX1    = endX;
        this.endY1    = endY;

        this.startX2  = -1;
        this.startY2  = -1;
        this.endX2    = -1;
        this.endY2    = -1;
    },
   
   /**
    * Returns [true] if the command can be execute and the execution of the
    * command modify the model. A CommandMove with [startX,startX] == [endX,endY] should
    * return false. <br>
    * the execution of the Command doesn't modify the model.
    *
    * @type boolean
    **/
   canExecute:function()
   {
     // return false if we doesn't modify the model => NOP Command
     return this.startX1!=this.startX2 ||
            this.startY1!=this.startY2 ||
            this.endX1!=this.endX2 ||
            this.endY1!=this.endY2;
   },

   /**
    * Execute the command the first time
    * 
    **/
   execute:function()
   {
      this.startX2 = this.line.getStartX();
      this.startY2 = this.line.getStartY();
      this.endX2   = this.line.getEndX();
      this.endY2   = this.line.getEndY();
      this.redo();
   },

   /**
    * Undo the command
    *
    **/
   undo:function()
   {
     this.line.setStartPoint(this.startX1, this.startY1);
     this.line.setEndPoint(this.endX1, this.endY1);
    
//     if(this.line.workflow.getCurrentSelection()==this.line)
//        this.line.workflow.showLineResizeHandles(this.line);
   },

   /** 
    * Redo the command after the user has undo this command
    *
    **/
   redo:function()
   {
     this.line.setStartPoint(this.startX2, this.startY2);
     this.line.setEndPoint(this.endX2, this.endY2);
//     if(this.line.workflow.getCurrentSelection()==this.line)
//        this.line.workflow.showLineResizeHandles(this.line);
   }
});