class NodeIdService {
  private static _instance: NodeIdService;
  private id: number = 1;

  private constructor() {}

  public static getInstance(): NodeIdService {
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

export const nodeIdService = NodeIdService.getInstance();
