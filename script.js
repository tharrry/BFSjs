var canvas;
var btn = $('#sbmt');
var form = $('#graphForm');
var formInputs = 0;
var nodes = [];
var parents;
var adjLists;


//D3 stuff
var width = document.body.clientWidth;
var height = document.body.clientHeight;
var myTreeLayout;
var root;
var links;
var linkPathGen;
var margin = {
    top:10,
    right:20,
    bottom: 10,
    left:20
};
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;


var svg = d3.select('svg');
var g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

function windowResized() {
    width = document.body.clientWidth;
    height = document.body.clientHeight;
}

function Vertex(name) {
    var obj = {};
    obj.name = name;
    obj.parent = null;
    obj.children = [];
    obj.visited = false;
    return obj;
}

function BFS() {
    if (nodes.length > 0) {
        var q = [nodes[0]];
        nodes[0].visited = true;

        while (q.length > 0) {
            var item = q.shift();
            var index = getNodeIndex(item);
            console.log("Examining node", item.name, "or nodes[", index, "]");
            if (index >= 0){
                console.log("Index was good.");
                for (var i = 0; i < adjLists[index].length; i++) {
                    var elem = adjLists[index][i];
                    console.log("Found child", elem.name);
                    if (!elem.visited) {
                        console.log(elem.name, "was not visited yet");
                        elem.visited = true;
                        elem.parent = item.name;
                        item.children.push(elem);
                        q.push(elem);
                    }
                }
            }
        }
        return true;
    }
    return false;
}

function getNodeIndex(node) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name == node.name || nodes[i].name == node){
            return i;
        }
    }
    return -1;
}

function getNoNodes(no) {
    nodes = [];
    if (no[no.length - 1] == "") {
        no.pop();
    }
    no.forEach(function (element) {
        nodes.push(Vertex(element));
    });
    return nodes.length;
}

function readNode(e) {
    var id = e.charAt(e.length - 1);
    var ref = '#'.concat(e);
    var edges = $(ref).val();
    edges = edges.split(" ");
    if (edges[edges.length - 1] == "") {
        edges.pop();
    }
    for (var i = 0; i < edges.length; i++) {
        var index = getNodeIndex(edges[i]);
        if (index >= 0) {
            adjLists[id] = [...adjLists[id], nodes[index]];
        }
    }
}

function readNodes() {
    var nodesFromForm = $('#nodes').val();
    var noNodes;
    var ref = "list";
    nodesFromForm = nodesFromForm.split(" ");
    noNodes = getNoNodes(nodesFromForm);
    if (noNodes < 10 && noNodes > 0) {
        if (noNodes > formInputs) {
            for (var i = formInputs; i < noNodes; i++) {
                var inputRef = ref.concat(i);
                $("<input type='text' value='' />")
                    .attr("id", inputRef)
                    .attr("name", inputRef)
                    .appendTo("#graphForm")
                    .on('input', function () {
                    readNodes();
                });
            }
        }
        else {
            for (var i = formInputs; i >= noNodes; i--) {
                var inputRef = "#".concat(ref.concat(i));
                $(inputRef).remove();
            }
        }
        adjLists = new Array(noNodes);
        adjLists.fill([]);
        parents = new Array(noNodes);
        formInputs = noNodes;
        for (var i = 0; i < formInputs; i++) {
            readNode(ref.concat(i));
        }
        if (BFS()) {
            builTree();
        }
        
        //tr(root);
    }
    else {
        console.log("Too many or too few nodes.");
    }
}

function buildTreeNode (node) {
    var obj = {
        "data": {
            "id": node.name
        }
    }
    if (node.children.length > 0) {
        obj.children = [];
        node.children.forEach(e => {
            obj.children.push(buildTreeNode(e));
        });
    }
    return  obj;
}

function builTree () {
    g.selectAll("*").remove();
    console.log("I got called...")
    myTreeLayout = d3.tree().size([innerWidth,innerHeight]);
    root = d3.hierarchy(buildTreeNode(nodes[0]));
    links = myTreeLayout(root).links();
    linkPathGen = d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y);

    g.selectAll('path').data(links)
        .enter().append('path')
        .attr('d', linkPathGen);

    g.selectAll('text').data(root.descendants())
        .enter()
        .append('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('dy', '0.32em')
        .attr('text-anchor','middle')
        .text(d => d.data.data.id);
}
