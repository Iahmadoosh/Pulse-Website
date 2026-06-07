import { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Box, 
  Factory, 
  AlertCircle, 
  ShoppingCart, 
  X, 
  Sparkles, 
  Bot, 
  ArrowUpRight, 
  ArrowRight,
  RefreshCw,
  Loader2,
  Calendar,
  Globe,
  Plus,
  Trash2,
  Edit2,
  Check,
  Link2,
  ShieldAlert,
  HelpCircle,
  Hash,
  Coins
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Initial Mock datasets
const INITIAL_INVENTORY = [
  { id: '1', name: 'Industrial Widget A', sku: 'WID-A-001', type: 'Hardware Components', stock: 450, reorderLevel: 100, price: 25.50, dailyVelocity: 12 },
  { id: '2', name: 'Processing Unit B', sku: 'PU-B-002', type: 'Hardware Components', stock: 12, reorderLevel: 50, price: 150.00, dailyVelocity: 4 },
  { id: '3', name: 'Assembly Component C', sku: 'COM-C-003', type: 'Raw Goods', stock: 0, reorderLevel: 200, price: 5.75, dailyVelocity: 18 },
  { id: '4', name: 'Packaging Material Series', sku: 'PKG-004', type: 'Packaging', stock: 1200, reorderLevel: 500, price: 1.20, dailyVelocity: 45 },
  { id: '5', name: 'Heat Sink Arrays', sku: 'HSA-005', type: 'Hardware Components', stock: 85, reorderLevel: 150, price: 12.00, dailyVelocity: 9 },
];

const INITIAL_SHIPMENTS = [
  { id: 'SHP-9012', origin: 'Shanghai Hub', destination: 'West Coast Dist.', status: 'In Transit', expected: 'Nov 12', progress: 65, carrier: 'fedex' },
  { id: 'SHP-9013', origin: 'Frankfurt Facility', destination: 'East Coast Dist.', status: 'Customs', expected: 'Nov 09', progress: 90, carrier: 'dhl' },
  { id: 'SHP-9014', origin: 'Central Warehouse', destination: 'Retail Hub A', status: 'Processing', expected: 'Nov 15', progress: 20, carrier: 'ups' },
];

const INITIAL_VENDORS = [
  { id: 'V1', name: 'Apex Manufacturing Solutions', category: 'Hardware Components', status: 'Active', contractExp: '2026-12-31' },
  { id: 'V2', name: 'Global Logistics Partners', category: 'Freight & Shipping', status: 'Active', contractExp: '2027-06-15' },
  { id: 'V3', name: 'Elemental Materials Co.', category: 'Raw Goods', status: 'Under Review', contractExp: '2026-08-20' },
];

interface LinkedCarrierAccount {
  carrier: 'fedex' | 'ups' | 'dhl' | 'usps';
  accountId: string;
  apiKey: string;
  status: 'connected' | 'online';
  linkedAt: string;
}

const CARRIER_DETAILS = {
  fedex: {
    name: 'FedEx Web Services',
    logoColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    placeholder: 'FDX-ACC-0918'
  },
  ups: {
    name: 'UPS Developer API',
    logoColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    placeholder: 'UPS-DEV-7128'
  },
  dhl: {
    name: 'DHL Express MyDHL+',
    logoColor: 'text-red-600',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    placeholder: 'DHL-CORP-4521'
  },
  usps: {
    name: 'USPS Web Tools',
    logoColor: 'text-blue-900',
    borderColor: 'border-blue-200',
    bgColor: 'bg-emerald-50',
    placeholder: 'USPS-USER-9021'
  }
};

export function SupplyChainView() {
  // Sync States from localStorage to prevent resetting on tab switch
  const [inventory, setInventory] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [linkedCarriers, setLinkedCarriers] = useState<LinkedCarrierAccount[]>([]);
  
  // Local active tab loads
  useEffect(() => {
    try {
      const storedInv = localStorage.getItem('pulse_erp_inventory');
      if (storedInv) {
        setInventory(JSON.parse(storedInv));
      } else {
        setInventory(INITIAL_INVENTORY);
        localStorage.setItem('pulse_erp_inventory', JSON.stringify(INITIAL_INVENTORY));
      }

      const storedShp = localStorage.getItem('pulse_erp_shipments');
      if (storedShp) {
        setShipments(JSON.parse(storedShp));
      } else {
        setShipments(INITIAL_SHIPMENTS);
        localStorage.setItem('pulse_erp_shipments', JSON.stringify(INITIAL_SHIPMENTS));
      }

      const storedCarriers = localStorage.getItem('pulse_linked_carriers');
      if (storedCarriers) {
        setLinkedCarriers(JSON.parse(storedCarriers));
      } else {
        // Hydrate default linked carriers to keep dashboard highly functional & realistic
        const initialCarriers: LinkedCarrierAccount[] = [
          { carrier: 'fedex', accountId: 'FDX-8910-LIVE', apiKey: 'KEY_PX92...', status: 'connected', linkedAt: '2026-05-18' },
          { carrier: 'ups', accountId: 'UPS-8012-MGR', apiKey: 'KEY_UP98...', status: 'online', linkedAt: '2026-05-22' }
        ];
        setLinkedCarriers(initialCarriers);
        localStorage.setItem('pulse_linked_carriers', JSON.stringify(initialCarriers));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Modal to add inventory 
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSku, setAddSku] = useState('');
  const [addType, setAddType] = useState('Hardware Components');
  const [addStock, setAddStock] = useState(100);
  const [addPrice, setAddPrice] = useState(19.99);
  const [addReorder, setAddReorder] = useState(30);
  const [addVelocity, setAddVelocity] = useState(5);

  // Row inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editType, setEditType] = useState('');
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editReorder, setEditReorder] = useState(0);
  const [editVelocity, setEditVelocity] = useState(0);

  // Link Carrier State
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [carrierSelect, setCarrierSelect] = useState<'fedex' | 'ups' | 'dhl' | 'usps'>('fedex');
  const [carrierAccId, setCarrierAccId] = useState('');
  const [carrierKey, setCarrierKey] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Predictive State Toggles
  const [isPredictiveActive, setIsPredictiveActive] = useState(true);
  
  // Replenishment Action State
  const [replenishingId, setReplenishingId] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  // AI Logistics Assistant state
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Calculations
  const totalInventoryValue = inventory.reduce((acc, item) => acc + (item.stock * item.price), 0);
  const lowStockCount = inventory.filter(item => item.stock > 0 && item.stock <= item.reorderLevel).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;
  const activeShipmentsCount = shipments.length;
  const vendors = INITIAL_VENDORS;

  // Manual Add Logic
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addSku.trim()) return;

    const newPrd = {
      id: Math.random().toString(36).substring(2, 9),
      name: addName.trim(),
      sku: addSku.trim().toUpperCase(),
      type: addType,
      stock: Math.max(0, addStock),
      price: Math.max(0, addPrice),
      reorderLevel: Math.max(0, addReorder),
      dailyVelocity: Math.max(1, addVelocity)
    };

    setInventory(prev => {
      const updated = [...prev, newPrd];
      localStorage.setItem('pulse_erp_inventory', JSON.stringify(updated));
      return updated;
    });

    // Reset fields
    setAddName('');
    setAddSku('');
    setAddStock(100);
    setAddPrice(19.99);
    setAddReorder(30);
    setAddVelocity(5);
    setShowAddModal(false);
  };

  // Manual Edit Inline Initiate
  const startInlineEdit = (item: any) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditSku(item.sku);
    setEditType(item.type || 'Hardware Components');
    setEditStock(item.stock);
    setEditPrice(item.price);
    setEditReorder(item.reorderLevel);
    setEditVelocity(item.dailyVelocity);
  };

  const saveInlineEdit = (id: string) => {
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            name: editName.trim(),
            sku: editSku.toUpperCase().trim(),
            type: editType,
            stock: Math.max(0, editStock),
            price: Math.max(0, editPrice),
            reorderLevel: Math.max(0, editReorder),
            dailyVelocity: Math.max(1, editVelocity)
          };
        }
        return item;
      });
      localStorage.setItem('pulse_erp_inventory', JSON.stringify(updated));
      return updated;
    });
    setEditingId(null);
  };

  const deleteProduct = (id: string) => {
    setInventory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('pulse_erp_inventory', JSON.stringify(updated));
      return updated;
    });
  };

  // Link Carrier logic
  const handleLinkCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierAccId.trim()) return;

    setIsLinking(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API Handshake

    const newCarrierConn: LinkedCarrierAccount = {
      carrier: carrierSelect,
      accountId: carrierAccId.trim(),
      apiKey: carrierKey.trim() ? carrierKey.trim().slice(0, 7) + '...' : 'CORP-MEMBER-KEY',
      status: 'connected',
      linkedAt: new Date().toLocaleDateString()
    };

    setLinkedCarriers(prev => {
      // Avoid duplicate linked keys
      const filtered = prev.filter(c => c.carrier !== carrierSelect);
      const updated = [...filtered, newCarrierConn];
      localStorage.setItem('pulse_linked_carriers', JSON.stringify(updated));
      return updated;
    });

    setIsLinking(false);
    setShowCarrierModal(false);
    setCarrierAccId('');
    setCarrierKey('');
  };

  const disconnectCarrier = (carrier: LinkedCarrierAccount['carrier']) => {
    setLinkedCarriers(prev => {
      const updated = prev.filter(c => c.carrier !== carrier);
      localStorage.setItem('pulse_linked_carriers', JSON.stringify(updated));
      return updated;
    });
  };

  // Single-Click AI Smart replenishment trigger
  const handleSmartReplenish = async (itemId: string, itemName: string, sku: string) => {
    setReplenishingId(itemId);
    setLogMessages([]);
    
    const addLog = (msg: string, delay: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
          resolve();
        }, delay);
      });
    };

    await addLog(`Initializing ERP Supply Chain Predictive Reorder Loop...`, 0);
    await addLog(`Querying active vendor agreement databases for SKU: ${sku}...`, 500);
    await addLog(`Selecting supplier: Apex Manufacturing Solutions (Contract rates validated).`, 500);
    await addLog(`Triggering secure REST connection with carrier APIs...`, 600);

    // Dynamic routing checking synced shipping carriers
    if (linkedCarriers.length > 0) {
      const trackingCar = linkedCarriers[0].carrier.toUpperCase();
      await appendLogMock(`Routed dispatch payload to linked ${trackingCar} account stream (${linkedCarriers[0].accountId}).`, 600);
    } else {
      await appendLogMock(`No primary linked carriers found. Initializing sandbox dispatch router...`, 500);
    }

    await appendLogMock(`Applying Economic Order Quantity (EOQ) shipping weight optimization models...`, 600);
    await appendLogMock(`Dispatched purchase order successfully! Local tracking node synced.`, 500);

    // Persist changes in inventory state
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const replenishmentAmount = item.id === '3' ? 500 : item.reorderLevel * 3;
          return { ...item, stock: item.stock + replenishmentAmount };
        }
        return item;
      });
      localStorage.setItem('pulse_erp_inventory', JSON.stringify(updated));
      return updated;
    });

    // Add a new shipment to the tracking state associated with a linked carrier
    const selectedCarrier = linkedCarriers.length > 0 
      ? linkedCarriers[Math.floor(Math.random() * linkedCarriers.length)].carrier
      : 'fedex';

    const newShpId = `SHP-${Math.floor(1000 + Math.random() * 9000)}`;
    setShipments(prev => {
      const updated = [
        {
          id: newShpId,
          origin: 'Shanghai Hub',
          destination: 'Central Warehouse',
          status: 'Procured (Dispatched)',
          expected: 'In 5 Days',
          progress: 10,
          carrier: selectedCarrier
        },
        ...prev
      ];
      localStorage.setItem('pulse_erp_shipments', JSON.stringify(updated));
      return updated;
    });

    setReplenishingId(null);
  };

  // Log append shortcut
  const appendLogMock = (msg: string, delay: number) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
        resolve();
      }, delay);
    });
  };

  const handleFetchLogisticsReport = async () => {
    setIsGeneratingReport(true);
    setAiReport('');

    const query = `Provide an active ERP Supply Chain Optimization report. 
Given parameters:
- Inventory items list: ${JSON.stringify(inventory.map(i => ({ name: i.name, sku: i.sku, stock: i.stock, lowLevel: i.reorderLevel })))}
- Shipments list: ${JSON.stringify(shipments)}
- Linked logistics carrier vectors: ${JSON.stringify(linkedCarriers.map(c => c.carrier))}
- Low stock points trigger limit: Auto depletion enabled

Please write a brief 3-section logistics directive recommending:
1. Maritime vs Air route redirection guidance to counter global harbor traffic.
2. Direct stock rebalancing target locations.
3. Multi-vendor diversification strategies to manage high velocity assembly items.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }] })
      });
      if (!res.ok) throw new Error('Api call failure');
      const data = await res.json();
      setAiReport(data.reply);
    } catch (e) {
      console.error(e);
      setAiReport("Failed to synchronize with Global Logistics API node. Please verify carrier configs.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 mt-6 select-none">
      
      {/* Title block with badges */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600 animate-pulse" />
              Pulse Smart Supply Chain & Logistics
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600 animate-bounce" /> Predictive replenishment ACTIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manual inventory modifications, dynamic safety threshold checking, and unified shipping carrier tracking.
          </p>
        </div>

        {/* Global Predictive toggle */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
          <label className="text-xs font-bold text-slate-600 tracking-wider uppercase flex items-center gap-1.5 cursor-pointer select-none">
            <Bot className={`w-4 h-4 ${isPredictiveActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            Predictive Depletion AI
          </label>
          <button 
            type="button" 
            onClick={() => setIsPredictiveActive(!isPredictiveActive)} 
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isPredictiveActive ? 'bg-emerald-600' : 'bg-slate-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isPredictiveActive ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {isPredictiveActive && (
        <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-4 flex gap-3 text-indigo-900 text-xs leading-relaxed items-start animate-in slide-in-from-top duration-300">
          <Bot className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">ERP Predictive Stock Signals:</span> System measures "Daily Consumption Velocity" to calculate the precise day of stock exhaustion. Tap <span className="underline font-bold">Smart PO Replenish</span> to launch automated geographical routes.
          </div>
        </div>
      )}

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-500" /> Total Capital Inventory
            </span>
            <div className="text-3xl font-light text-slate-900 mt-2">
              ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">Tracking {inventory.length} global warehousing items</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Inventory Alerts
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-light text-slate-900">{inventory.filter(i => i.stock <= i.reorderLevel).length}</span>
              <span className="text-xs font-bold text-slate-400">Items below optimal point</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs font-medium">
              <span className="text-amber-600">{lowStockCount} Critical safety levels</span>
              <span className="text-rose-600">{outOfStockCount} Depleted channels</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500 animate-pulse" /> Active Dispatched
            </span>
            <div className="text-3xl font-light text-slate-900 mt-2 flex items-center gap-2">
              {activeShipmentsCount}
              <span className="text-xs text-slate-400 font-bold">({linkedCarriers.length} connected carriers)</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">Live sync tracking feeds actively running</div>
          </div>
        </div>
      </div>

      {/* Main Core Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Stock Inventory Sheet */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" /> Inventory Management Console
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Allows manual admin entries, pricing valuation, and live reorder triggers.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Product Asset
            </button>
          </div>

          <div className="overflow-x-auto whitespace-nowrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4">SKU / Code & Details</th>
                  <th className="p-4">Asset Balance / Type</th>
                  {isPredictiveActive && <th className="p-4">Exhaustion Forecast</th>}
                  <th className="p-4">Unit Value (Total Price)</th>
                  <th className="p-4 text-right">Adaptive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isEditing = editingId === item.id;
                  const isOutOfStock = item.stock <= 0;
                  const isLowStock = !isOutOfStock && item.stock <= item.reorderLevel;
                  const daysToDepletion = item.stock > 0 ? Math.round(item.stock / item.dailyVelocity) : 0;
                  
                  if (isEditing) {
                    return (
                      <tr key={item.id} className="bg-slate-50 border-b font-sans transition-all text-xs">
                        <td className="p-4 space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Product Name</span>
                            <input 
                              type="text" 
                              className="w-full p-1.5 border rounded-md text-xs font-semibold outline-none focus:border-emerald-500 bg-white" 
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                            />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">SKU ID</span>
                            <input 
                              type="text" 
                              className="w-full p-1.5 border rounded-md text-xs font-mono outline-none focus:border-emerald-500 bg-white" 
                              value={editSku}
                              onChange={e => setEditSku(e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="p-4 space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Stock Level (Qty)</span>
                            <input 
                              type="number" 
                              className="w-24 p-1.5 border rounded-md text-xs font-semibold outline-none focus:border-emerald-500 bg-white" 
                              value={editStock}
                              onChange={e => setEditStock(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Product Type</span>
                            <select 
                              className="w-full p-1.5 border rounded-md text-xs outline-none bg-white font-medium" 
                              value={editType}
                              onChange={e => setEditType(e.target.value)}
                            >
                              <option value="Hardware Components">Hardware Components</option>
                              <option value="Raw Goods">Raw Goods</option>
                              <option value="Freight & Shipping">Freight & Shipping</option>
                              <option value="Packaging">Packaging</option>
                              <option value="Materials">Materials</option>
                            </select>
                          </div>
                        </td>
                        {isPredictiveActive && (
                          <td className="p-4 space-y-1">
                            <div>
                              <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Daily Velocity</span>
                              <input 
                                type="number" 
                                className="w-20 p-1.5 border rounded-md text-xs font-mono outline-none bg-white" 
                                value={editVelocity}
                                onChange={e => setEditVelocity(parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Reorder Safety Trigger</span>
                              <input 
                                type="number" 
                                className="w-20 p-1.5 border rounded-md text-xs font-mono outline-none bg-white" 
                                value={editReorder}
                                onChange={e => setEditReorder(parseInt(e.target.value) || 10)}
                              />
                            </div>
                          </td>
                        )}
                        <td className="p-4">
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Unit Value ($)</span>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-24 p-1.5 border rounded-md text-xs font-mono outline-none focus:border-emerald-500 bg-white" 
                              value={editPrice}
                              onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </td>
                        <td className="p-4 text-right space-y-1">
                          <button
                            onClick={() => saveInlineEdit(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-2.5 rounded-lg uppercase tracking-wider block ml-auto"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] py-1 px-2 rounded-lg uppercase tracking-wider block ml-auto"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-sm">{item.stock} units</div>
                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                          {item.type || 'Hardware Component'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Reorder limit: {item.reorderLevel}</div>
                      </td>
                      
                      {isPredictiveActive && (
                        <td className="p-4">
                          {isOutOfStock ? (
                            <span className="bg-rose-50 text-rose-700 font-bold px-2 py-1 rounded-md text-[10px] uppercase tracking-wider animate-pulse border border-rose-100">
                              Depleted Immediate Risk
                            </span>
                          ) : daysToDepletion <= 10 ? (
                            <span className="bg-amber-50 text-amber-700 font-bold px-2 py-1 rounded-md text-[10px] uppercase tracking-wider border border-amber-100">
                              ~{daysToDepletion} Days Left ({item.dailyVelocity}/day velocity)
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md text-[10px] uppercase tracking-wider border border-emerald-100">
                              ~{daysToDepletion} Days Stable
                            </span>
                          )}
                        </td>
                      )}

                      <td className="p-4">
                        <div className="font-mono text-xs text-slate-800 font-bold">${parseFloat(item.price).toFixed(2)} / unit</div>
                        <div className="text-[10px] text-slate-400 font-medium">Valuation: ${(item.stock * item.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex gap-1.5 justify-end items-center">
                          {(isOutOfStock || isLowStock) ? (
                            <button
                              onClick={() => handleSmartReplenish(item.id, item.name, item.sku)}
                              disabled={replenishingId !== null}
                              className="bg-emerald-600 hover:bg-emerald-700 font-bold text-[9px] text-white py-1.5 px-2.5 rounded-lg uppercase tracking-wider transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${replenishingId === item.id ? 'animate-spin' : ''}`} /> Smart PO
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest inline-flex items-center gap-1 bg-emerald-50 py-1 px-2 rounded-full select-none">
                              <CheckCircle className="w-3 h-3" /> Healthy
                            </span>
                          )}

                          <button
                            onClick={() => startInlineEdit(item)}
                            className="p-1 border text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteProduct(item.id)}
                            className="p-1 border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Interactive replenish micro log terminal */}
          {logMessages.length > 0 && (
            <div className="p-4 bg-slate-900 border-t border-slate-950 font-mono text-[10px] text-emerald-400 space-y-1 py-3">
              <div className="font-bold text-slate-400 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live ERP Pipeline Sync Log:
              </div>
              {logMessages.map((msg, idx) => (
                <div key={idx} className="leading-tight">{msg}</div>
              ))}
            </div>
          )}

        </div>

        {/* Sidebar Logistics Watchlist & Vendor Contracts */}
        <div className="flex flex-col gap-6">
          
          {/* TRACK SHIPMENTS Renamed */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" /> Track Shipments
                </h3>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded border border-emerald-200 uppercase">Live Tracker Sync</span>
              </div>
              
              <div className="space-y-5">
                {shipments.map((shipment) => {
                  const hasCarrier = !!shipment.carrier;
                  const carDetails = hasCarrier ? CARRIER_DETAILS[shipment.carrier as keyof typeof CARRIER_DETAILS] : null;

                  return (
                    <div key={shipment.id} className="flex flex-col gap-1.5 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                          {shipment.id} 
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> expected: {shipment.expected}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-800 font-semibold my-1">
                        <span>{shipment.origin}</span>
                        <span className="text-slate-300">→</span>
                        <span>{shipment.destination}</span>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 transition-all rounded-full animate-pulse" 
                          style={{ width: `${shipment.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between flex-wrap gap-1 mt-0.5">
                        <span className="text-[9px] font-black uppercase text-slate-500">{shipment.status} ({shipment.progress}%)</span>
                        
                        {/* Dynamic Connected Tracking Badges */}
                        {hasCarrier ? (
                          <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase flex items-center gap-0.5 ${carDetails?.bgColor} ${carDetails?.borderColor} ${carDetails?.logoColor}`}>
                            <Globe className="w-2.5 h-2.5 animate-bounce" /> {shipment.carrier}
                          </span>
                        ) : (
                          <span className="text-[8px] font-semibold font-mono bg-slate-50 border px-1 rounded text-slate-400">
                            Manual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <button 
                onClick={() => {
                  setShipments(INITIAL_SHIPMENTS);
                  localStorage.setItem('pulse_erp_shipments', JSON.stringify(INITIAL_SHIPMENTS));
                }}
                className="w-full py-2 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Reset Shipment Queue
              </button>

              <button
                onClick={() => setShowCarrierModal(true)}
                className="w-full py-2.5 bg-slate-900 border border-slate-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-1"
              >
                <Link2 className="w-3.5 h-3.5" /> Integrate Carrier APIs
              </button>
            </div>
          </div>

          {/* Connected Shipping Carriers Hub */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2 mb-4">
              <Link2 className="w-4 h-4 text-emerald-500" /> Carrier Connections
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-4">
              Connected developer keys authorize synchronized shipping live telemetry for our transit queue.
            </p>

            {linkedCarriers.length === 0 ? (
              <div className="p-3 border border-slate-100 rounded-lg text-slate-400 text-xs text-center font-semibold bg-slate-50">
                No active carrier logins configured
              </div>
            ) : (
              <div className="space-y-3">
                {linkedCarriers.map((conn) => {
                  const details = CARRIER_DETAILS[conn.carrier];
                  return (
                    <div key={conn.carrier} className="flex items-center justify-between p-2.5 border rounded-lg bg-slate-50/50">
                      <div>
                        <div className={`text-xs font-bold leading-tight ${details?.logoColor}`}>
                          {details?.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-1">
                          Account: {conn.accountId} • Sync active
                        </div>
                      </div>
                      <button
                        onClick={() => disconnectCarrier(conn.carrier)}
                        className="text-[9px] font-bold uppercase text-rose-500 hover:text-rose-700"
                      >
                        Disconnect
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vendors list with live renewal tracking */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 animate-in fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2 mb-6">
              <Factory className="w-4 h-4 animate-spin-slow text-emerald-500" /> Approved Enterprise Vendors
            </h3>
            
            <div className="space-y-4">
              {vendors.map(v => (
                <div key={v.id} className="flex items-start justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                  <div>
                    <div className="font-bold text-sm text-slate-800 leading-tight">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{v.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.1)] mb-1" />
                    <div className="text-[8px] font-mono text-slate-400 font-bold uppercase">EXP: {v.contractExp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modern AI Global Freight Congestion Advice */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5 animate-pulse animate-duration-1000" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">AI Global Logistics Route Diversifier</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assesses real-time sea harbor times, rail freight costs, and fuels risk indices using Gemini models.</p>
            </div>
          </div>

          <button
            onClick={handleFetchLogisticsReport}
            disabled={isGeneratingReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1 transition-colors shadow-sm shadow-indigo-50"
          >
            {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isGeneratingReport ? 'Compiling Report...' : 'Analyze Harbor Risks'}
          </button>
        </div>

        {isGeneratingReport ? (
          <div className="p-8 bg-slate-50 rounded-xl flex flex-col items-center justify-center space-y-3 border shadow-inner">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 animate-pulse">Pulse AI is querying maritime manifest endpoints & simulating air transit costs with synced carriers...</p>
          </div>
        ) : aiReport ? (
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl shadow-inner prose prose-sm max-w-none prose-indigo select-text relative animate-in fade-in duration-300">
            <button
              onClick={() => setAiReport('')}
              className="absolute top-4 right-4 text-xs font-bold font-mono text-slate-400 hover:text-slate-600 uppercase"
            >
              Close Plan
            </button>
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Bot className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold">Initiate harbor risk modeling to view intelligent multimodal dispatch proposals.</p>
          </div>
        )}
      </div>

      {/* Manual Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-emerald-600" /> Add New Stock Asset
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Product Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-emerald-500"
                  placeholder="e.g. Copper Heat Exchanger B"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">SKU identifier</label>
                  <input
                    required
                    type="text"
                    className="w-full p-2.5 border rounded-lg bg-white font-mono text-slate-700 outline-none focus:border-emerald-500"
                    placeholder="WID-X-902"
                    value={addSku}
                    onChange={e => setAddSku(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Product Type</label>
                  <select
                    className="w-full p-2.5 border bg-white rounded-lg outline-none font-medium"
                    value={addType}
                    onChange={e => setAddType(e.target.value)}
                  >
                    <option value="Hardware Components">Hardware Components</option>
                    <option value="Raw Goods">Raw Goods</option>
                    <option value="Freight & Shipping">Freight & Shipping</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Materials">Materials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Starting Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2.5 border rounded-lg bg-white font-semibold outline-none focus:border-emerald-500"
                    value={addStock}
                    onChange={e => setAddStock(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Unit valuation ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2.5 border rounded-lg bg-white font-mono outline-none focus:border-emerald-500"
                    value={addPrice}
                    onChange={e => setAddPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Safety limit trigger</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 border rounded-lg bg-white font-mono outline-none focus:border-emerald-500"
                    value={addReorder}
                    onChange={e => setAddReorder(parseInt(e.target.value) || 10)}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Daily Vel. Consumption</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 border rounded-lg bg-white font-mono outline-none focus:border-emerald-500"
                    value={addVelocity}
                    onChange={e => setAddVelocity(parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg uppercase tracking-wider text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg uppercase tracking-wider text-center"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Synchronize Carrier Modal */}
      {showCarrierModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Link2 className="w-4 h-4 text-emerald-600" /> Link Carrier Feed API
              </h3>
              <button
                onClick={() => setShowCarrierModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkCarrier} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Select Shipping Carrier</label>
                <select
                  className="w-full p-2.5 border bg-white rounded-lg outline-none font-bold"
                  value={carrierSelect}
                  onChange={e => setCarrierSelect(e.target.value as any)}
                >
                  <option value="fedex">FedEx Logistics Integration</option>
                  <option value="ups">UPS API Workspace</option>
                  <option value="dhl">DHL Express World Sync</option>
                  <option value="usps">USPS Web Toll Services</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Client Authorization Account ID</label>
                <input
                  required
                  type="text"
                  className="w-full p-2.5 border rounded-lg bg-white font-medium text-slate-800 outline-none"
                  placeholder={CARRIER_DETAILS[carrierSelect]?.placeholder}
                  value={carrierAccId}
                  onChange={e => setCarrierAccId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Web API Sandbox Secret Key</label>
                <input
                  type="password"
                  className="w-full p-2.5 border rounded-lg bg-white font-mono text-slate-800 outline-none"
                  placeholder="•••••••••••••••••••••"
                  value={carrierKey}
                  onChange={e => setCarrierKey(e.target.value)}
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed font-sans flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-slate-700">Security Guard:</span> API verification relies on custom corporate sandboxes. This will link the feed into of the live shipping hub trackers automatically.
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCarrierModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg uppercase tracking-wider text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
                >
                  {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLinking ? 'linking Account...' : 'Link Carrier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
