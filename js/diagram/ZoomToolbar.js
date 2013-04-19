ldm.diagram.Toolbar = Class.extend({

    init: function(elementId, app, view) {
        this.html = $("#" + elementId);
        this.view = view;
        this.app = app;


        // Inject the UNDO Button and the callbacks
        //
        this.zoomInButton = $("<button class='btn '><i class='icon-zoom-in'/></button>");
        this.html.append(this.zoomInButton);
        this.zoomInButton.button().click($.proxy(function() {
            this.view.setZoom(this.view.getZoom() * 0.9, true);
            this.app.layout();
        }, this));

        // Inject the DELETE Button
        //
        this.resetButton = $("<button class='btn'>1:1</button>");
        this.html.append(this.resetButton);
        this.resetButton.button().click($.proxy(function() {
            this.view.setZoom(1.0, true);
            this.app.layout();
        }, this));

        // Inject the REDO Button and the callback
        //
        this.zoomOutButton = $("<button class='btn'><i class='icon-zoom-out'/></button>");
        this.html.append(this.zoomOutButton);
        this.zoomOutButton.button().click($.proxy(function() {
            this.view.setZoom(this.view.getZoom() * 1.1, true);
            this.app.layout();
        }, this));
    }

});