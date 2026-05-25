import { useState, useCallback, useRef } from "react";
import {
  ReactFlow, Controls, Background, addEdge, useNodesState, useEdgesState,
  type Connection, type Node, type Edge, MarkerType, Handle, Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus, Trash2, Copy, Undo2, Redo2, Save, Layout,
  AlertTriangle, Zap, Clock, X,
} from "lucide-react";
import { toast } from "sonner";

// Node components
function ProcessNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[160px] text-center shadow-sm ${
      data.bottleneck ? 'border-destructive bg-destructive/5' :
      data.automation ? 'border-info bg-info/5' :
      data.wait ? 'border-warning bg-warning/5' :
      data.risk ? 'border-destructive/60 bg-destructive/5' :
      selected ? 'border-accent bg-accent/5' :
      'border-border bg-card'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <p className="text-xs font-semibold text-foreground">{data.label}</p>
      {data.responsible && <p className="text-[10px] text-muted-foreground mt-0.5">{data.responsible}</p>}
      {data.time && <p className="text-[10px] text-muted-foreground">{data.time}</p>}
      {data.cost && <p className="text-[10px] text-success">{data.cost}</p>}
      {data.bottleneck && <span className="badge-destructive text-[10px] mt-1 inline-block">Gargalo</span>}
      {data.automation && <span className="badge-info text-[10px] mt-1 inline-block">Automatizável</span>}
      {data.wait && <span className="badge-warning text-[10px] mt-1 inline-block">Espera</span>}
      {data.risk && <span className="badge-destructive text-[10px] mt-1 inline-block">Risco</span>}
      {data.observation && <p className="text-[9px] text-muted-foreground mt-1 italic">📝 {data.observation}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

function DecisionNode({ data }: { data: any }) {
  return (
    <div className="relative" style={{ width: 120, height: 80 }}>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full border-2 border-accent bg-accent/5 rotate-45 rounded-sm" />
        <p className="absolute text-xs font-semibold text-foreground text-center px-2">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-muted-foreground" />
    </div>
  );
}

function StartEndNode({ data }: { data: any }) {
  return (
    <div className="px-6 py-2 rounded-full border-2 border-primary bg-primary/5 text-center">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <p className="text-xs font-semibold text-foreground">{data.label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

function DocumentNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-info bg-info/5 min-w-[140px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <p className="text-xs font-semibold text-foreground">📄 {data.label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

function WaitNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-warning border-dashed bg-warning/5 min-w-[140px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <p className="text-xs font-semibold text-foreground">⏳ {data.label}</p>
      {data.time && <p className="text-[10px] text-muted-foreground">{data.time}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

function ApprovalNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-accent bg-accent/5 min-w-[140px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <p className="text-xs font-semibold text-foreground">✅ {data.label}</p>
      {data.responsible && <p className="text-[10px] text-muted-foreground">{data.responsible}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

const nodeTypes = {
  process: ProcessNode, decision: DecisionNode, startEnd: StartEndNode,
  document: DocumentNode, wait: WaitNode, approval: ApprovalNode,
};

const NODE_TYPE_OPTIONS = [
  { value: "startEnd", label: "Início/Fim" },
  { value: "process", label: "Tarefa" },
  { value: "decision", label: "Decisão" },
  { value: "document", label: "Documento" },
  { value: "wait", label: "Espera" },
  { value: "approval", label: "Aprovação" },
];

interface FlowEditorProps {
  initialNodes?: any[];
  initialEdges?: any[];
  editable?: boolean;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  flowchartId?: string;
}

export default function FlowEditor({ initialNodes: propNodes, initialEdges: propEdges, editable = false, onSave, flowchartId }: FlowEditorProps) {
  const defaultNodes: Node[] = propNodes && propNodes.length > 0
    ? propNodes.map((n: any, i: number) => ({
        id: n.id || String(i),
        type: n.type || "process",
        position: n.position || { x: 250, y: i * 120 },
        data: {
          label: n.label || n.data?.label || "Etapa",
          responsible: n.responsible || n.data?.responsible,
          time: n.time || n.data?.time,
          cost: n.cost || n.data?.cost,
          bottleneck: n.bottleneck || n.data?.bottleneck,
          automation: n.automation || n.data?.automation,
          wait: n.wait || n.data?.wait,
          risk: n.risk || n.data?.risk,
          observation: n.observation || n.data?.observation,
        },
      }))
    : [
        { id: "1", type: "startEnd" as const, position: { x: 250, y: 0 }, data: { label: "Início" } },
        { id: "2", type: "process" as const, position: { x: 220, y: 100 }, data: { label: "Aguardando diagnóstico..." } },
        { id: "3", type: "startEnd" as const, position: { x: 250, y: 200 }, data: { label: "Fim" } },
      ];

  const defaultEdges: Edge[] = propEdges && propEdges.length > 0
    ? propEdges.map((e: any, i: number) => ({
        id: e.id || `e-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed },
      }))
    : [
        { id: "e1-2", source: "1", target: "2", markerEnd: { type: MarkerType.ArrowClosed } },
        { id: "e2-3", source: "2", target: "3", markerEnd: { type: MarkerType.ArrowClosed } },
      ];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPanel, setShowPanel] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const reactFlowRef = useRef<any>(null);

  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { nodes: [...nodes], edges: [...edges] }]);
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setHistoryIndex(i => i - 1);
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setNodes(next.nodes);
    setEdges(next.edges);
    setHistoryIndex(i => i + 1);
  }, [history, historyIndex, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory();
      setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    },
    [setEdges, pushHistory]
  );

  const addNode = useCallback((type: string) => {
    pushHistory();
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 250, y: nodes.length * 100 },
      data: { label: type === "startEnd" ? "Início/Fim" : type === "decision" ? "Decisão?" : "Nova Etapa" },
    };
    setNodes(nds => [...nds, newNode]);
  }, [nodes, setNodes, pushHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    pushHistory();
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setShowPanel(false);
    setContextMenu(null);
  }, [setNodes, setEdges, pushHistory]);

  const duplicateNode = useCallback((nodeId: string) => {
    pushHistory();
    const orig = nodes.find(n => n.id === nodeId);
    if (!orig) return;
    const id = `node-${Date.now()}`;
    setNodes(nds => [...nds, { ...orig, id, position: { x: orig.position.x + 30, y: orig.position.y + 30 } }]);
  }, [nodes, setNodes, pushHistory]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
  }, [setNodes]);

  const updateNodeType = useCallback((nodeId: string, type: string) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, type } : n));
  }, [setNodes]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    if (!editable) return;
    setSelectedNode(node);
    setShowPanel(true);
    setContextMenu(null);
  }, [editable]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    if (!editable) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, [editable]);

  const handlePaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const autoLayout = useCallback(() => {
    pushHistory();
    const sorted = [...nodes];
    sorted.forEach((n, i) => { n.position = { x: 250, y: i * 130 }; });
    setNodes(sorted);
  }, [nodes, setNodes, pushHistory]);

  const handleSave = useCallback(() => {
    if (onSave) onSave(nodes, edges);
    else toast.success("Fluxograma salvo");
  }, [nodes, edges, onSave]);

  return (
    <div className="relative h-full">
      <ReactFlow
        ref={reactFlowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={editable ? onNodesChange : undefined}
        onEdgesChange={editable ? onEdgesChange : undefined}
        onConnect={editable ? onConnect : undefined}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
        fitView
        className="bg-background"
      >
        <Controls />
        <Background gap={20} size={1} />

        {/* Toolbar */}
        {editable && (
          <Panel position="top-left" className="flex items-center gap-1 bg-card border border-border rounded-lg p-1.5 shadow-sm">
            <div className="relative group">
              <button className="p-1.5 rounded hover:bg-muted transition-colors" title="Adicionar bloco">
                <Plus className="w-4 h-4 text-foreground" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-1 hidden group-hover:block z-50 min-w-[140px]">
                {NODE_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => addNode(opt.value)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded transition-colors text-foreground">
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-border" />
            <button onClick={undo} className="p-1.5 rounded hover:bg-muted transition-colors" title="Desfazer"><Undo2 className="w-4 h-4 text-foreground" /></button>
            <button onClick={redo} className="p-1.5 rounded hover:bg-muted transition-colors" title="Refazer"><Redo2 className="w-4 h-4 text-foreground" /></button>
            <div className="w-px h-5 bg-border" />
            <button onClick={autoLayout} className="p-1.5 rounded hover:bg-muted transition-colors" title="Auto Layout"><Layout className="w-4 h-4 text-foreground" /></button>
            <div className="w-px h-5 bg-border" />
            <button onClick={handleSave} className="p-1.5 rounded hover:bg-muted text-success transition-colors" title="Salvar"><Save className="w-4 h-4" /></button>
          </Panel>
        )}
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed bg-card border border-border rounded-lg shadow-lg p-1 z-[999] min-w-[160px]" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button onClick={() => { duplicateNode(contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded flex items-center gap-2 text-foreground">
            <Copy className="w-3.5 h-3.5" /> Duplicar
          </button>
          <button onClick={() => { const n = nodes.find(nn => nn.id === contextMenu.nodeId); if (n) updateNodeData(n.id, { bottleneck: !n.data.bottleneck }); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-3.5 h-3.5" /> Marcar Gargalo
          </button>
          <button onClick={() => { const n = nodes.find(nn => nn.id === contextMenu.nodeId); if (n) updateNodeData(n.id, { automation: !n.data.automation }); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded flex items-center gap-2 text-foreground">
            <Zap className="w-3.5 h-3.5" /> Marcar Automação
          </button>
          <button onClick={() => { const n = nodes.find(nn => nn.id === contextMenu.nodeId); if (n) updateNodeData(n.id, { risk: !n.data.risk }); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Marcar Risco
          </button>
          <div className="h-px bg-border my-1" />
          <button onClick={() => deleteNode(contextMenu.nodeId)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-destructive/10 rounded flex items-center gap-2 text-destructive">
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        </div>
      )}

      {/* Property Panel */}
      {showPanel && selectedNode && editable && (
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border p-4 overflow-y-auto z-50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm">Propriedades</h3>
            <button onClick={() => setShowPanel(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select value={selectedNode.type} onChange={e => { updateNodeType(selectedNode.id, e.target.value); setSelectedNode({ ...selectedNode, type: e.target.value }); }}
                className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs outline-none">
                {NODE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Título</label>
              <input value={String(selectedNode.data.label || "")} onChange={e => { updateNodeData(selectedNode.id, { label: e.target.value }); setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value } }); }}
                className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Responsável</label>
              <input value={String(selectedNode.data.responsible || "")} onChange={e => updateNodeData(selectedNode.id, { responsible: e.target.value })}
                className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs outline-none" placeholder="Ex: Gerente" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tempo</label>
              <input value={String(selectedNode.data.time || "")} onChange={e => updateNodeData(selectedNode.id, { time: e.target.value })}
                className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs outline-none" placeholder="Ex: 15min" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Custo</label>
              <input value={String(selectedNode.data.cost || "")} onChange={e => updateNodeData(selectedNode.id, { cost: e.target.value })}
                className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs outline-none" placeholder="Ex: R$ 50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Observação</label>
              <textarea value={String(selectedNode.data.observation || "")} onChange={e => updateNodeData(selectedNode.id, { observation: e.target.value })}
                rows={2} className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs outline-none resize-none" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs text-muted-foreground">Tags</label>
              {[
                { key: "bottleneck", label: "Gargalo", icon: AlertTriangle },
                { key: "automation", label: "Automatizável", icon: Zap },
                { key: "wait", label: "Espera", icon: Clock },
                { key: "risk", label: "Risco", icon: AlertTriangle },
              ].map(tag => (
                <button key={tag.key} onClick={() => updateNodeData(selectedNode.id, { [tag.key]: !selectedNode.data[tag.key] })}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
                    selectedNode.data[tag.key] ? "bg-accent/10 text-accent-foreground" : "hover:bg-muted text-muted-foreground"
                  }`}>
                  <tag.icon className="w-3.5 h-3.5" /> {tag.label}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <button onClick={() => deleteNode(selectedNode.id)} className="w-full px-3 py-2 rounded text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2 justify-center transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Excluir Bloco
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
