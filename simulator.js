var red = "orangered";  // 0 or false
var green = "forestgreen";  // 1 or true
var white = "white";
var black = "black";

var running = false;
var done = false;
var simtime = 1.0;
var dt = 0.01;
var k=0;
var maxk = 0;
var t=0;

// see this: https://gojs.net/latest/samples/canvases.html?gclid=EAIaIQobChMIraapsZPp5gIVTNyGCh08CQpgEAAYASAAEgJ8w_D_BwE

var simdata = '';

var chartdata = new Object();

var chartdata ={};

go.licenseKey = "54f947e1bb6431b700ca0d2b113f69ed1bb37b349e8c1ef15e5342a4ef0a69432a98ed7f03d78f90d4fe4ffc086dc6d08e956921c749516ee537d38c13e783aebb6777ba120b46dba35125cbc9ae2ef4af2a72fac5b27ef2c8688aa7bbaec3ce0ce9e1c44bcb0dba36781936";

function runCallback(){
  if(!running){
    chartdata = {};
  simtime = parseFloat(document.getElementById("simtime").value);
   dt = parseFloat(document.getElementById("timestep").value);
  t = 0;
  simdata = '';
  resetBlocks();
  running = true;
  done=false;
  maxk = simtime/dt;
  k=0;
  console.log(k,maxk,running,simdata);

}
}

function resetBlocks(){
  myDiagram.nodes.each(function(node) {
              switch (node.category) {
                case "gain": resetGain(node);break;
                case "gain2": resetGain(node);break;
                case "scope": resetScope(node); break;
                case "add": resetAdd(node);break;
                case "integrator": resetIntegrator(node);break;
                case "chart":resetChart(node);break;
                case "clock":resetClock(node);break;
                case "multiply":resetMultiply(node);break;
                case "divide":resetDivide(node);break;
                case "sin":resetSin(node);break;
                case "cos":resetCos(node);break;
                case "tan":resetTan(node);break;
              }
            });
}

function updateBindings(){
 myDiagram.nodes.each(function(node) {
              switch (node.category) {
                case "gain": updateDataGain(node);break;
                case "gain2": updateDataGain(node);break;
                case "integrator": updateDataIntegrator(node);break;
                case "constant": updateDataConstant(node);break;
              }
            });
}

function init() { 

      // simtime = parseFloat(document.getElementById("simtime").value);
      // dt = parseFloat(document.getElementById("timestep").value);
      // if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make;  // for conciseness in defining templates

      myDiagram =
        $(go.Diagram, "myDiagramDiv",  // create a new Diagram in the HTML DIV element "myDiagramDiv"
          {
            "draggingTool.isGridSnapEnabled": true,  // dragged nodes will snap to a grid of 10x10 cells
            "undoManager.isEnabled": true
          });

      // when the document is modified, add a "*" to the title and enable the "Save" button
      myDiagram.addDiagramListener("Modified", function(e) {
        var button = document.getElementById("saveModel");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
          if (idx < 0) document.title += "*";
        } else {
          if (idx >= 0) document.title = document.title.substr(0, idx);
        }
      });


      var palette = new go.Palette("palette");  // create a new Palette in the HTML DIV element "palette"

      // creates relinkable Links that will avoid crossing Nodes when possible and will jump over other Links in their paths
      myDiagram.linkTemplate =
        $(go.Link,

          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 5,
            relinkableFrom: true, relinkableTo: true,reshapable: true, resegmentable: true,
            selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
            shadowOffset: new go.Point(0, 0), shadowBlur: 5, shadowColor: "blue",
            toShortLength: 3,
            // fromShortLength: 3
          },
          //  { relinkableFrom: true, relinkableTo: true, reshapable: true, resegmentable: true },
          // {
          //   routing: go.Link.AvoidsNodes,  // but this is changed to go.Link.Orthgonal when the Link is reshaped
          //   adjusting: go.Link.End,
          //   curve: go.Link.JumpOver,
          //   corner: 5,
          //   toShortLength: 4
          // },
      
          new go.Binding("isShadowed", "isSelected").ofObject(),
          $(go.Shape, { name: "SHAPE", strokeWidth: 2, stroke: black }),
          $(go.Shape, { toArrow: "Standard" }),
          $(go.TextBlock, { name:"VAL", margin: 4,editable: true, verticalAlignment: go.Spot.Top, visible: false}, new go.Binding("text","text").makeTwoWay(go.Point.stringify))
          );

      // node template helpers
      var sharedToolTip =
        $("ToolTip",
          { "Border.figure": "RoundedRectangle" },
          $(go.TextBlock, { margin: 2 },
            new go.Binding("text", "", function(d) { return d.category; })));

      // define some common property settings
      function nodeStyle() {
        return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("isShadowed", "isSelected").ofObject(),
        {
          selectionAdorned: false,
          shadowOffset: new go.Point(0, 0),
          shadowBlur: 15,
          shadowColor: "blue",
          toolTip: sharedToolTip,
          rotatable: true,
        }];
      }

      function textBoxStyle() {
        return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("isShadowed", "isSelected").ofObject(),
        {
          selectionAdorned: false,
          shadowOffset: new go.Point(0, 0),
          shadowBlur: 15,
          shadowColor: "blue",
          toolTip: sharedToolTip,
          rotatable: true,
        }];
      }


      function shapeStyle() {
        return {
          name: "NODESHAPE",
          fill: "lightgray",
          stroke: "darkslategray",
          desiredSize: new go.Size(40, 40),
          strokeWidth: 2,
          portId: ""
        };
      }

      function chartShapeStyle() {
        return {
          name: "NODESHAPE",
          fill: "transparent",
          stroke: "transparent",
          desiredSize: new go.Size(200, 160),
          strokeWidth: 2,
          portId: ""
        };
      }


      function ellipseStyle() {
        return {
          name: "NODESHAPE",
          fill: "lightgray",
          stroke: "darkslategray",
          desiredSize: new go.Size(44, 44),
          strokeWidth: 2,
          portId: ""
        };
      }

      function portStyle(input) {
        return {
          desiredSize: new go.Size(6, 6),
          fill: "black",
          // fromSpot: go.Spot.Right,
          fromLinkable: !input,
          // toSpot: go.Spot.Left,
          toLinkable: input,
          toMaxLinks: 1,
          cursor: "pointer",
          // toArrow: "standard",
        };
      }

      function chartportStyle(input) {
        return {
          desiredSize: new go.Size(300, 150),
          fill: "transparent",
          stroke: "transparent",
          // fromSpot: go.Spot.Right,
          fromLinkable: !input,
          // toSpot: go.Spot.Left,
          toLinkable: input,
          toMaxLinks: 1,
          cursor: "pointer",
          // toArrow: "standard",
        };
      }

      var scopeTemplate =
        $(go.Node, "Spot", nodeStyle(),
           {fromSpot: go.Spot.RightCenter,  // coming out from right side
         toSpot: go.Spot.LeftCenter },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5) , toSpot: new go.Spot(0,.5)}),
          
          $(go.TextBlock, { name: "RESULT", margin: 4,editable: true }, new go.Binding("text","scopeVal").makeTwoWay(go.Point.stringify))
        );

      var chartTemplate =
        $(go.Node, "Spot", nodeStyle(),
          {fromSpot: go.Spot.RightCenter,  // coming out from right side
         toSpot: go.Spot.LeftCenter },   // going into at left side}
         // $(go.Shape, "Rectangle", chartShapeStyle()),
         $(go.Shape, "Circle", chartportStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(-150, 0.5) , toSpot: new go.Spot(0,.5)}),
          $(go.Panel, "Auto",
            $(go.Shape, { fill: "transparent" },
              new go.Binding("stroke", "color")),
            $(go.Picture,
              { name: "chart", width: 300, height: 150, portId: "" },
              new go.Binding("element", "datasets", makeLineChart))
          ),
          $(go.TextBlock,
            { margin: 8 },
            new go.Binding("text"))
        );

     

      var textTemplate=
    $(go.Node, textBoxStyle(),
      $(go.TextBlock,
        { text: "TextLabel",
          background: 'rgba(0, 0, 0, 0)',
          editable: true }, new go.Binding("text","textContents").makeTwoWay(go.Point.stringify))
    );


      var gainTemplate =
        $(go.Node, "Spot", nodeStyle(),
        {fromSpot: new go.Spot(0, 0.5),  // coming out from right side
        toSpot: new go.Spot(1,.5) },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5), toSpot: new go.Spot(0,.5) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot:  new go.Spot(1, 0.5)}),
          $(go.TextBlock, { name: "GAIN", margin: 4, editable: true }, new go.Binding("text","gainVal")),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "Gain (right)"),
        );

        var sinTemplate =
        $(go.Node, "Spot", nodeStyle(),
        {fromSpot: go.Spot.RightCenter,  // coming out from right side
        toSpot: go.Spot.LeftCenter },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5), toSpot: new go.Spot(0,.5) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot:  new go.Spot(1, 0.5)}),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '12px FontAwesome'}, "sin"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "trig"),
        );

        var cosTemplate =
        $(go.Node, "Spot", nodeStyle(),
        {fromSpot: go.Spot.RightCenter,  // coming out from right side
        toSpot: go.Spot.LeftCenter },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5), toSpot: new go.Spot(0,.5) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot:  new go.Spot(1, 0.5)}),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '12px FontAwesome'}, "cos"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "trig"),
        );

        var tanTemplate =
        $(go.Node, "Spot", nodeStyle(),
        {fromSpot: go.Spot.RightCenter,  // coming out from right side
        toSpot: go.Spot.LeftCenter },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5), toSpot: new go.Spot(0,.5) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot:  new go.Spot(1, 0.5)}),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '12px FontAwesome'}, "tan"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "trig"),
        );

        var gain2Template =
        $(go.Node, "Spot", nodeStyle(),
         {toSpot: new go.Spot(1,.5),  // coming out from right side
          fromSpot: new go.Spot(0, 0.5) },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(1, 0.5), toSpot: new go.Spot(1,.5) }),
          $(go.Shape, "TriangleLeft", portStyle(false),
            { portId: "out", alignment: new go.Spot(0, 0.5), fromSpot:  new go.Spot(0, 0.5)}),
          $(go.TextBlock, { name: "GAIN", margin: 4, editable: true }, new go.Binding("text","gainVal")),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "Gain (left)"),
        );


       var constantTemplate =
        $(go.Node, "Spot", nodeStyle(),
          {fromSpot: go.Spot.RightCenter,  // coming out from right side
          toSpot: go.Spot.LeftCenter },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot: new go.Spot(1,.5) }),
          $(go.TextBlock, { name:"CONST", margin: 4,editable: true }, new go.Binding("text","constVal").makeTwoWay(go.Point.stringify)),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "Constant"),
        );

        var scopeTemplate =
        $(go.Node, "Spot", nodeStyle(),
           {fromSpot: go.Spot.Right,  // coming out from right side
         toSpot: go.Spot.Left},   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5) , toSpot: new go.Spot(0,.5)}),
          
          $(go.TextBlock, { name: "RESULT", margin: 4,editable: true }, new go.Binding("text","scopeVal").makeTwoWay(go.Point.stringify)),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "SaveData"),
        );

        var addTemplate =
        $(go.Node, "Spot", nodeStyle(),
          {fromSpot: go.Spot.RightCenter,  // coming out from right side
          toSpot: go.Spot.NotRightSide },   // going into at left side}
          $(go.Shape, "Ellipse", ellipseStyle()),
          $(go.Shape, "Circle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0, 0.5), toSpot: new go.Spot(0,.5) }),
          $(go.Shape, "Circle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(.5, 1), toSpot: new go.Spot(.5,1) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot: new go.Spot(1,.5) }),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '24px FontAwesome'}, "\u03a3"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, -.625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "Sum"),
          
          
        );

        var divideTemplate =
        $(go.Node, "Spot", nodeStyle(),
          {fromSpot: go.Spot.RightCenter,  // coming out from right side
          toSpot: go.Spot.NotRightSide },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),
          $(go.Shape, "Circle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0, 0.75), toSpot: new go.Spot(0,.75) }),
          $(go.Shape, "Circle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0, .25), toSpot: new go.Spot(0,.25) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot: new go.Spot(1,.5) }),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '24px FontAwesome'}, "\u00F7"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, -.625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "divide"),          
        );

        var multTemplate =
        $(go.Node, "Spot", nodeStyle(),
          {fromSpot: go.Spot.RightCenter,  // coming out from right side
          toSpot: go.Spot.NotRightSide },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),
          $(go.Shape, "Circle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0, 0.75), toSpot: new go.Spot(0,.75) }),
          $(go.Shape, "Circle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0, .25), toSpot: new go.Spot(0,.25) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot: new go.Spot(1,.5) }),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '24px FontAwesome'}, "X"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, -.625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "multiply"),          
        );

        var clockTemplate =
        $(go.Node, "Spot", nodeStyle(),
          {fromSpot: go.Spot.RightCenter,  // coming out from right side
          toSpot: go.Spot.NotRightSide },   // going into at left side}
          $(go.Shape, "Ellipse", ellipseStyle()),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5), fromSpot: new go.Spot(1,.5) }),
          $(go.TextBlock, { alignment: new go.Spot(0.5, 0, 0, 20), name: "lab", margin: 4, editable: false, font: '24px FontAwesome'}, "\uD83D\uDD50"),
          $(go.TextBlock, { alignment: new go.Spot(0.5, -.625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "clock"),
          
          
        );

        var integratorTemplate =
        $(go.Node, "Spot", nodeStyle(),
           {doubleClick: nodeDoubleClick },
           {fromSpot: go.Spot.RightCenter,  // coming out from right side
         toSpot: go.Spot.LeftCenter, 
          },   // going into at left side}
          $(go.Shape, "Rectangle", shapeStyle()),  // override the default fill (from shapeStyle()) to be white
          $(go.Shape, "Circle", portStyle(true),  // input port
            { portId: "in", alignment: new go.Spot(0, 0.5) }),
          $(go.Shape, "TriangleRight", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) }),
          $(go.TextBlock, { name: "INT", margin: 4, editable: false, font: '24px FontAwesome'}, "\u222B"),
          $(go.TextBlock, { name: "VAL", margin: 4, editable: true, visible: false }, new go.Binding("text","intval").makeTwoWay(go.Point.stringify)),
          $(go.TextBlock, { name: "INITVAL", margin: 4, editable: true, visible: false }, new go.Binding("text","initval").makeTwoWay(go.Point.stringify)),
          $(go.TextBlock, { alignment: new go.Spot(0.5, .625, 0, 20), name: "lab", margin: 4, editable: true, font: '10px FontAwesome'}, "integrator"),
        );


      // add the templates created above to myDiagram and palette
      myDiagram.nodeTemplateMap.add("clock",clockTemplate);
      myDiagram.nodeTemplateMap.add("multiply",multTemplate);
      myDiagram.nodeTemplateMap.add("divide",divideTemplate);
      myDiagram.nodeTemplateMap.add("sin",sinTemplate);
      myDiagram.nodeTemplateMap.add("cos",cosTemplate);
      myDiagram.nodeTemplateMap.add("tan",tanTemplate);
      myDiagram.nodeTemplateMap.add("constant",constantTemplate);
      myDiagram.nodeTemplateMap.add("gain",gainTemplate);
      myDiagram.nodeTemplateMap.add("gain2",gain2Template);
      myDiagram.nodeTemplateMap.add("scope",scopeTemplate);
      myDiagram.nodeTemplateMap.add("add",addTemplate);
      myDiagram.nodeTemplateMap.add("integrator",integratorTemplate);
      myDiagram.nodeTemplateMap.add("chart",chartTemplate);
      myDiagram.nodeTemplateMap.add("label",textTemplate);



      // share the template map with the Palette
      palette.nodeTemplateMap = myDiagram.nodeTemplateMap;

      palette.model.nodeDataArray = [
        { category: "clock"},
        { constVal:"100", category: "constant"},
        { gainVal:"1", category: "gain"},
        { gainVal:"1", category: "gain2"},
        { category: "add"},
        { category: "multiply"},
        { category: "divide"},
        { category: "sin"},
        { category: "cos"},
        { category: "tan"},
        { intval:"0", category: "integrator"},
        { scopeVal: "0",category: "scope"},
        {datasets:"", category:"chart"},
        {textContents:"textLabel", category:"label"}
      ];

      loadModel();

      loop();
}


        function nodeDoubleClick(e, obj) {
        var clicked = obj.part;
        if (clicked !== null) {
          var thisemp = clicked.data;

        var newval = window.prompt("Initial Value",obj.findObject("INITVAL").text);
        obj.findObject("INITVAL").text = newval;
        obj.findObject("VAL").text = newval;
        setOutputLinks2(obj,newval);
        console.log(obj.findObject("VAL").text);
          
        }
      }

 // This Binding conversion function creates a Canvas element for a Picture
      // that has a rendering of a line chart drawn by Chart.js.
      function makeLineChart(data, picture) {

        // console.log(data)
        var canvases = document.getElementById("myCanvases");

        canv = document.createElement("canvas");
        canv.width = canv.style.width = "600px";
        canv.height = canv.style.height = "300px";

        // apparently Chart.js expects the Canvas to be in a DIV
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.appendChild(canv);
        // add the DIV/Canvas to the DOM, temporarily
        canvases.appendChild(div);

        var config = {  // Chart.js configuration, including the DATASETS data from the model data
          type: "scatter",
          title:"Scope Chart",
          data: {
        datasets: [{
            // xAxisID: "Time (s)",
            // yAxisID: "Output",
            pointBackgroundColor: 'rgba(0, 0, 0, 1)',
            showLine: true,
            borderColor: 'rgba(0, 0, 0, 1)',
            fill: false,
            label: '',
            data: data
        }]
    },
          options: {
             scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: ("Output"),
              }
            }],
             xAxes: [{
              scaleLabel: {
                display: true,
                labelString: ("Time (s)"),
              }
            }]
        },
             title: {
            display: true,
            text: 'Scope Plot'
        },
            animation: {
              onComplete: function() {
                var canvases = document.getElementById("myCanvases");
                if (canvases) {  // remove the Canvas that was in the DOM for rendering
                  canvases.removeChild(div);
                }
              }
            }
          }
        };

        new Chart(canv, config);

        return canv;
      }



    // update the diagram every 250 milliseconds
    function loop() {
      setTimeout(function() {  updateStates(); loop(); }, 1);
    }

    // update the value and appearance of each node according to its type and input values
    function updateStates() {
      var oldskip = myDiagram.skipsUndoManager;
      myDiagram.skipsUndoManager = true;
      

      // do all "input" nodes first
        myDiagram.nodes.each(function(node) {
              switch (node.category) {
                case "constant": doConstant(node);break;
                case "clock": doClock(node);break;
              }
            });

      // now we can do all other kinds of nodes
      if(running){
            simdata+=t.toFixed(4)+'\t'
            myDiagram.nodes.each(function(node) {
              switch (node.category) {
                case "gain": doGain(node);break;
                case "gain2": doGain(node);break;
                case "scope": doScope(node); break;
                case "add": doAdd(node);break;
                case "multiply": doMultiply(node);break;
                case "divide": doDivide(node);break;
                case "sin": doSin(node);break;
                case "cos": doCos(node);break;
                case "tan": doTan(node);break;
              }
            });

      //do integrator nodes second to last 
      myDiagram.nodes.each(function(node) {
        if (node.category === "integrator") {
          doIntegrator(node);
        }
      });

      //do all chart nodes actually last
      myDiagram.nodes.each(function(node) {
        if (node.category === "chart") {
          doChart(node);
        }
      });
     
      simdata+='\r\n'
      document.getElementById("simdata").value = simdata;
      document.getElementById("simdata").scrollTop = document.getElementById("simdata").scrollHeight
      k+=1;//increment the timestep
      t+=dt;
      //check to see if we are done
      if (k>maxk){
        running=false; 
        done = true;
        console.log("DONE");
      };
      
      myDiagram.skipsUndoManager = oldskip;
    }
    else{
      if(done){
      done=false;
      myDiagram.nodes.each(function(node) {
              if (node.category=="chart") {
                node.findObject("chart").element = makeLineChart(chartdata[node.key],node.findObject("chart").element);
              }
            });
    }
  }

}

    function getLinkValue2(link){
      return parseFloat(link.findObject("VAL").text)
    }





    function setOutputLinks2(node, value) {
      node.findLinksOutOf().each(function(link) { link.findObject("VAL").text = value.toString(); });
    }

    // update nodes by the specific function for its type
    // determine the color of links coming out of this node based on those coming in and node type

    function resetGain(node){
      setOutputLinks2(node,0);
    }
    function resetClock(node){
      setOutputLinks2(node,0);
    }
    function resetMultiply(node){
      setOutputLinks2(node,0);
    }
    function resetDivide(node){
      setOutputLinks2(node,0);
    }
    function resetSin(node){
      setOutputLinks2(node,0);
    }
    function resetCos(node){
      setOutputLinks2(node,0);
    }
    function resetTan(node){
      setOutputLinks2(node,0);
    }
    function resetConstant(node){
      setOutputLinks2(node,0);
    }
    function resetAdd(node){
      setOutputLinks2(node,0);
    }
    function resetScope(node){
      node.findObject("RESULT").text="0";
      setOutputLinks2(node,0);
    }
    function resetIntegrator(node){
      node.findObject("VAL").text="0";
      var textcurrval = node.findObject("INITVAL").text;
      // console.log(textcurrval)
        if(textcurrval == ''){
          textcurrval = '0.0';
          node.findObject("INITVAL").text="0.0";
          // console.log("no initial condition");
      }

      setOutputLinks2(node,parseFloat(node.findObject("INITVAL").text));
    }

    function resetChart(node){
      // chartdata[node.key]=[{x:0,y:0}];
      chartdata[node.key]=[];
      console.log(chartdata)
    }

    function doChart(node){
      var result = 0;
      node.findLinksInto().each(function(link){ result = getLinkValue2(link)})

      //update the chart data for this chart.
      chartdata[node.key].push({x:t, y: result})

      // node.findObject("chart").element = makeLineChart(node.findObject("chart").element, chartdata[node.key] );
      
      //uncomment this next line to make the chart update live!
      // node.findObject("chart").element = makeLineChart(thisdata,node.findObject("chart").element);

    }

    function updateDataGain(node){
      var gain = parseFloat(node.findObject("GAIN").text);
      myDiagram.model.setDataProperty(node.data,"gainVal",gain.toString())
    }

    function doGain(node){
      var gain = parseFloat(node.findObject("GAIN").text);
      // myDiagram.model.setDataProperty(node.data,"gainVal",gain.toString())

      // console.log(myDiagram.model.toJson())
      var input = 0;
      node.findLinksInto().each(function(link){ input = getLinkValue2(link)})
      var result = 1.0*input*gain;
      setOutputLinks2(node,result);
    }
    function doSin(node){
      var input = 0;
      node.findLinksInto().each(function(link){ input = getLinkValue2(link)})
      var result = Math.sin(input);
      setOutputLinks2(node,result);
    }
    function doCos(node){
      var input = 0;
      node.findLinksInto().each(function(link){ input = getLinkValue2(link)})
      var result = Math.cos(input);
      setOutputLinks2(node,result);
    }
    function doTan(node){
      var input = 0;
      node.findLinksInto().each(function(link){ input = getLinkValue2(link)})
      var result = Math.tan(input);
      setOutputLinks2(node,result);
    }

    function updateDataConstant(node){
      var myConstant = parseFloat(node.findObject("CONST").text);
      myDiagram.model.setDataProperty(node.data,"constVal",myConstant.toString())
    }
    function doConstant(node){
      var myConstant = parseFloat(node.findObject("CONST").text);
      // myDiagram.model.setDataProperty(node.data,"constVal",myConstant.toString())
      // console.log("constant value: "+myConstant.toString())
      setOutputLinks2(node,myConstant);
    }

    function doClock(node){
      // console.log("constant value: "+myConstant.toString())
      setOutputLinks2(node,t);
    }

    function doAdd(node){
      var result = 0;
      node.findLinksInto().each(function(link){ result += getLinkValue2(link)})
      setOutputLinks2(node,result);
    }
    function doMultiply(node){
      var result = 1;
      var mylinks = [];
      connections = node.findLinksInto()
      while(connections.next()){
        mylinks.push(getLinkValue2(connections.value))
      }
      // node.findLinksInto().each(function(link){ result /= getLinkValue2(link)})
      console.log(mylinks)
      result = 1.0*mylinks[0]*mylinks[1];
      setOutputLinks2(node,result);
    }
    function doDivide(node){
      var result = 1;
      var mylinks = [];
      connections = node.findLinksInto()
      while(connections.next()){
        mylinks.push(getLinkValue2(connections.value))
      }
      // node.findLinksInto().each(function(link){ result /= getLinkValue2(link)})
      console.log(mylinks)
      result = 1.0*mylinks[0]/mylinks[1];
      setOutputLinks2(node,result);
    }

    function doScope(node){
      var result = 0;
      node.findLinksInto().each(function(link){ result = getLinkValue2(link)})
      node.findObject("RESULT").text=result.toFixed(4);
      simdata+=result.toFixed(4)+'\t'
    }

    function updateDataIntegrator(node){
       var textcurrval = node.findObject("INITVAL").text;
       if(textcurrval==''){
        textcurrval = '0.0';
       }
        myDiagram.model.setDataProperty(node.data,"initval",textcurrval)
    }

    function doIntegrator(node){
      var newval;
      if(t==0){
        var textcurrval = node.findObject("INITVAL").text;
        // myDiagram.model.setDataProperty(node.data,"initval",textcurrval)
        // console.log(textcurrval)
        if(textcurrval == ''){
          textcurrval = '0.0';
          console.log("no initial condition");
        }
        var currval = parseFloat(textcurrval);
        // console.log("currval: ");
        // console.log(currval)
        newval = currval
      }
      else{
        var currval = parseFloat(node.findObject("VAL").text);
        var input = 0;
      node.findLinksInto().each(function(link){ input = getLinkValue2(link)})
      newval = input*dt+currval;
      //console.log(result);
      }
      
      node.findObject("VAL").text=newval;
      setOutputLinks2(node,newval);
    }



    //save data to a text file

        function saveData() {
      var blob;
  if (typeof window.Blob == "function") {
    blob = new Blob([simdata], {
      type: "text/latex"
    });
  } else {
    var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    var bb = new BlobBuilder();
    bb.append(simdata);
    blob = bb.getBlob(simdata);
  }
  var URL = window.URL || window.webkitURL;
  var bloburl = URL.createObjectURL(blob);
  var anchor = document.createElement("a");
  if ('download' in anchor) {
    anchor.style.visibility = "hidden";
    anchor.href = bloburl;
    anchor.download = "SimData.txt";
    document.body.appendChild(anchor);
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);
  } else if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, "SimData.txt");
  } else {
    location.href = bloburl;
  }
}

    // save a model to and load a model from JSON text, displayed below the Diagram
    function saveModel() {
      updateBindings();
      // myModel.updateBindings();
      document.getElementById("mySavedModel").value = myDiagram.model.toJson();
      var blob;
  if (typeof window.Blob == "function") {
    blob = new Blob([myDiagram.model.toJson()], {
      type: "text/latex"
    });
  } else {
    var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    var bb = new BlobBuilder();
    bb.append(myDiagram.model.toJson());
    blob = bb.getBlob(myDiagram.model.toJson());
  }
  var URL = window.URL || window.webkitURL;
  var bloburl = URL.createObjectURL(blob);
  var anchor = document.createElement("a");
  if ('download' in anchor) {
    anchor.style.visibility = "hidden";
    anchor.href = bloburl;
    anchor.download = "myModel";
    document.body.appendChild(anchor);
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);
  } else if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, name);
  } else {
    location.href = bloburl;
  }

      myDiagram.isModified = false;
}
    function loadModel() {
      myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
      // obj.findObject("INITVAL").text = newval;
        // obj.findObject("VAL").text = newval;
    }