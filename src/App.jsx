
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

const initialNodes = [
  {
    id: '1',
    type: 'flowBlock',
    position: { x: 100, y: 120 },
    data: { label: 'Start trigger', kind: 'TRIGGER', detail: 'Workflow starts here' },
  },
  {
    id: '2',
    type: 'flowBlock',
    position: { x: 390, y: 120 },
    data: { label: 'Send notification', kind: 'ACTION', detail: 'Perform an action' },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
  },
];

function FlowBlock({ data, selected }) {
  return (
    <div className={`flow-block ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="block-top">
        <span className={`block-icon ${data.kind.toLowerCase()}`}>
          {data.kind === 'TRIGGER' ? '⚡' : data.kind === 'CONDITION' ? '◇' : '↗'}
        </span>
        <span className="block-kind">{data.kind}</span>
        <span className="live-dot" />
      </div>
      <div className="block-label">{data.label}</div>
      <div className="block-detail">{data.detail}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { flowBlock: FlowBlock };

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [notice, setNotice] = useState('Your workflow canvas is ready');

  const onConnect = useCallback(
    (connection) => {
      setEdges((current) =>
        addEdge({ ...connection, animated: true }, current)
      );
      setNotice('Connection added');
    },
    [setEdges]
  );

  function addBlock(kind) {
    const id = String(Date.now());
    const details = {
      TRIGGER: 'Workflow starts here',
      ACTION: 'Configure an action',
      CONDITION: 'Define a rule',
    };

    const newNode = {
      id,
      type: 'flowBlock',
      position: {
        x: 100 + Math.random() * 250,
        y: 260 + Math.random() * 180,
      },
      data: {
        label:
          kind === 'TRIGGER'
            ? 'New trigger'
            : kind === 'CONDITION'
              ? 'Check condition'
              : 'New action',
        kind,
        detail: details[kind],
      },
    };

    setNodes((current) => [...current, newNode]);
    setSelectedNode(id);
    setNotice(`${kind.toLowerCase()} block added`);
  }

  function renameSelected(value) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode
          ? { ...node, data: { ...node.data, label: value } }
          : node
      )
    );
  }

  function deleteSelected() {
    if (!selectedNode) return;
    setNodes((current) => current.filter((node) => node.id !== selectedNode));
    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== selectedNode && edge.target !== selectedNode
      )
    );
    setSelectedNode(null);
    setNotice('Block removed');
  }

  function testWorkflow() {
    if (nodes.length < 2) {
      setNotice('Add at least two blocks to test your workflow');
      return;
    }
    setNotice(
      `Test complete: ${nodes.length} blocks, ${edges.length} connections. No external actions were executed.`
    );
  }

  const activeNode = nodes.find((node) => node.id === selectedNode);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="./">
          <span className="brand-mark">F</span>
          <span>FLOW<span className="brand-accent">FORGE</span></span>
        </a>
        <div className="project-name">
          <span className="status-indicator" />
          Untitled workflow <span className="muted">/ Editor</span>
        </div>
        <div className="top-actions">
          <span className="saved-label">LOCAL EDITOR</span>
          <button className="run-button" onClick={testWorkflow}>
            ▶ Test workflow
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="side-heading">WORKSPACE</div>
          <div className="side-item active"><span>▦</span> Workflow builder</div>
          <div className="side-item"><span>◷</span> Run history</div>
          <div className="side-item"><span>⚙</span> Settings</div>

          <div className="side-heading blocks-heading">BUILDING BLOCKS</div>
          <p className="sidebar-help">Add a block, then drag from its bottom handle to another block's top handle.</p>

          <button className="add-block trigger-option" onClick={() => addBlock('TRIGGER')}>
            <span className="option-icon">⚡</span>
            <span><strong>Trigger</strong><small>Start a workflow</small></span>
            <span className="plus">+</span>
          </button>
          <button className="add-block action-option" onClick={() => addBlock('ACTION')}>
            <span className="option-icon">↗</span>
            <span><strong>Action</strong><small>Do something</small></span>
            <span className="plus">+</span>
          </button>
          <button className="add-block condition-option" onClick={() => addBlock('CONDITION')}>
            <span className="option-icon">◇</span>
            <span><strong>Condition</strong><small>Check a rule</small></span>
            <span className="plus">+</span>
          </button>

          <div className="sidebar-footer">
            <span className="live-dot" /> VISUAL BUILDER
            <small>FlowForge · Prototype</small>
          </div>
        </aside>

        <section className="canvas-section">
          <div className="canvas-toolbar">
            <div>
              <div className="canvas-title">Workflow canvas</div>
              <div className="canvas-subtitle">Design your automation visually</div>
            </div>
            <div className="canvas-count">
              <span>{nodes.length} BLOCKS</span>
              <span>{edges.length} CONNECTIONS</span>
            </div>
          </div>

          <div className="flow-canvas">
            <div className="canvas-glow" />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNode(node.id)}
              onPaneClick={() => setSelectedNode(null)}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: '#45f0a5', strokeWidth: 2 },
              }}
              colorMode="dark"
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1}
                color="#25352e"
              />
              <Controls />
              <MiniMap
                nodeColor="#32d995"
                maskColor="rgba(3, 10, 7, 0.7)"
              />
            </ReactFlow>
          </div>

          <div className="statusbar">
            <span className="status-indicator" /> {notice}
            <span className="status-right">Changes are currently in memory</span>
          </div>
        </section>

        <aside className="inspector">
          <div className="inspector-heading">PROPERTIES</div>
          {activeNode ? (
            <>
              <p className="inspector-caption">Selected block</p>
              <label className="field-label" htmlFor="block-name">Block name</label>
              <input
                id="block-name"
                className="property-input"
                value={activeNode.data.label}
                onChange={(event) => renameSelected(event.target.value)}
              />
              <label className="field-label">Block type</label>
              <div className="type-value">{activeNode.data.kind}</div>
              <label className="field-label">Description</label>
              <p className="inspector-caption">{activeNode.data.detail}</p>
              <button className="delete-button" onClick={deleteSelected}>
                Delete block
              </button>
            </>
          ) : (
            <div className="empty-inspector">
              <span className="inspector-symbol">⌘</span>
              <strong>Select a block</strong>
              <p>Click a workflow block to edit its name and view its properties.</p>
            </div>
          )}
          <div className="inspector-tip">
            <span>✦ BUILDER TIP</span>
            Connect blocks by dragging from the small handle below one block to the handle above another.
          </div>
        </aside>
      </section>
    </main>
  );
}
