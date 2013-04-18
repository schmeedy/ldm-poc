$(window).load(function () {
    var diagram = new LdmDiagram("diagram-canvas", "diagram-sematic-model");
    diagram.reload();

    $("#new-dataset").click(function() {
        diagram.newDataset({id: "", title: ""});
    });
});