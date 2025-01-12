import store from '../core/store.js';
import eventBus from '../core/events.js';
import { CONFIG } from '../core/config.js';

class Mapper {
    constructor() {
        this.store = store;
        this.eventBus = eventBus;
        this.svg = null;
        this.simulation = null;
        this.draggedNode = null;

        this.init();
        this.bindEvents();
    }

    init() {
        // Initialize D3 force simulation
        this.svg = d3.select('#mapperCanvas')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%');

        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(CONFIG.CANVAS.NODE_SPACING))
            .force('charge', d3.forceManyBody().strength(CONFIG.CANVAS.FORCE_STRENGTH))
            .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

        // Initialize groups for links and nodes
        this.svg.append('g').attr('class', 'links');
        this.svg.append('g').attr('class', 'nodes');

        // Enable zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.selectAll('g').attr('transform', event.transform);
            });

        this.svg.call(zoom);
    }

    bindEvents() {
        // Store updates
        this.store.subscribe('accounts', () => this.updateVisualization());
        this.store.subscribe('connections', () => this.updateVisualization());

        // Drag events
        this.svg.on('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.svg.on('drop', (e) => {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const coords = d3.pointer(e);
            this.createNode(data, coords);
        });
    }

    updateVisualization() {
        const accounts = Array.from(this.store.getState('accounts').values());
        const connections = Array.from(this.store.getState('connections').values());

        // Update links
        const links = this.svg.select('.links')
            .selectAll('line')
            .data(connections, d => `${d.source}-${d.target}`);

        links.exit().remove();

        const linksEnter = links.enter()
            .append('line')
            .attr('class', 'connection');

        // Update nodes
        const nodes = this.svg.select('.nodes')
            .selectAll('.node-group')
            .data(accounts, d => d.id);

        nodes.exit().remove();

        const nodesEnter = nodes.enter()
            .append('g')
            .attr('class', 'node-group')
            .call(this.dragBehavior());

        nodesEnter.append('circle')
            .attr('class', d => `node node-${d.type}`)
            .attr('r', CONFIG.CANVAS.NODE_RADIUS);

        nodesEnter.append('text')
            .attr('class', 'node-text')
            .attr('dy', CONFIG.CANVAS.NODE_RADIUS + 20)
            .attr('text-anchor', 'middle')
            .text(d => d.name);

        // Update simulation
        this.simulation
            .nodes(accounts)
            .force('link').links(connections);

        this.simulation.alpha(1).restart();
    }

    dragBehavior() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    createNode(data, [x, y]) {
        const accountService = window.accountService;
        const account = accountService.createAccount({
            ...data,
            x,
            y
        });

        this.eventBus.emit('node:created', account);
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight - 64; // Subtract header height
        
        this.svg
            .attr('width', width)
            .attr('height', height);

        this.simulation
            .force('center', d3.forceCenter(width / 2, height / 2))
            .restart();
    }
}

export default new Mapper(); 