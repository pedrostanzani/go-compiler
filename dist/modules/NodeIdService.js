"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeIdService = void 0;
class NodeIdService {
    static _instance;
    id = 1;
    constructor() { }
    static getInstance() {
        if (NodeIdService._instance) {
            return NodeIdService._instance;
        }
        const n = new NodeIdService();
        NodeIdService._instance = n;
        return n;
    }
    increment() {
        this.id++;
    }
    getId() {
        return this.id;
    }
}
exports.nodeIdService = NodeIdService.getInstance();
