class ThreatMap {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        
        this.nodes = [];
        this.links = [];
        
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));
            
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        this.linkGroup = this.svg.append("g");
        this.nodeGroup = this.svg.append("g");
    }

    addNode(data) {
        const newNode = {
            id: Date.now(),
            ...data
        };
        
        this.nodes.push(newNode);
        this.updateVisualization();
        return newNode;
    }

    addLink(source, target) {
        const sourceNode = this.nodes.find(n => n.id === source);
        const targetNode = this.nodes.find(n => n.id === target);
        
        const newLink = { 
            source, 
            target,
            type: targetNode.type === 'service' ? 'service-link' : 'root-link'
        };
        this.links.push(newLink);
        this.updateVisualization();
    }

    updateVisualization() {
        // Adjust force simulation based on node types
        this.simulation
            .force("link", d3.forceLink().id(d => d.id)
                .distance(100))
            .force("charge", d3.forceManyBody().strength(d => {
                return -100;
            }))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("x", d3.forceX(this.width / 2).strength(0.1))
            .force("y", d3.forceY(this.height / 2).strength(0.1));

        // Update links
        const link = this.linkGroup
            .selectAll(".link")
            .data(this.links)
            .join("line")
            .attr("class", d => `link ${d.type}`);

        // Update nodes
        const node = this.nodeGroup
            .selectAll(".node")
            .data(this.nodes)
            .join("g")
            .attr("class", d => `node ${d.type} ${d.passwordType}`)
            .call(d3.drag()
                .on("start", this.dragStarted.bind(this))
                .on("drag", this.dragged.bind(this))
                .on("end", this.dragEnded.bind(this)));

        node.selectAll("circle").remove();
        node.selectAll("text").remove();

        node.append("circle")
            .attr("r", function(d) {
                if (d.type === 'root') return 40;
                if (d.type === 'linked') return 35;
                return 30;
            })
            .style("stroke", d => d.color || this.getNodeColor(d.passwordType))
            .style("fill", "none");

        node.append("text")
            .text(d => d.name)
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("fill", "currentColor");

        this.simulation
            .nodes(this.nodes)
            .on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("transform", d => `translate(${d.x},${d.y})`);
            });

        this.simulation.force("link").links(this.links);
        this.simulation.alpha(1).restart();
    }

    getNodeColor(type) {
        // Using CASMM levels for coloring
        const colors = {
            passless: "#2E7D32",    // Level 8
            codeless2fa: "#4CAF50", // Level 7
            app2fa: "#8BC34A",      // Level 6
            sms2fa: "#2196F3",      // Level 5
            passman: "#FFC107",     // Level 4
            qualpass: "#FF9800",    // Level 3
            uniqpass: "#F44336",    // Level 2
            sharpass: "#B71C1C"     // Level 1
        };
        return colors[type] || "#757575";
    }

    dragStarted(event) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    dragEnded(event) {
        if (!event.active) this.simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}