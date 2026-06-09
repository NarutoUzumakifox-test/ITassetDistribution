'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';

const ASSET_TYPES = ['PC', 'Printer', 'UPS', 'Antivirus'];
const DEPARTMENTS = ['ADRM','DRM', 'Safety' ,'Stores' , 'Operating' , 'Accounts' , 'Commercial', 'Engineering', 'Electrical General', 'Electrical Operations', 'Electrical TRD', 'Mechanical C&W', 'Mechanical O&F',
                         'Medical','Personal','RPF', 'S&T'];
const WARRANTY_STATUSES = ['all', 'active', 'expired'];

function getTypeClass(type) {
  return { PC: 'type-pc', Printer: 'type-printer', UPS: 'type-ups', Antivirus: 'type-antivirus' }[type] || 'type-pc';
}

function isWarrantyActive(endDate) {
  return new Date(endDate) >= new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntilExpiry(endDate) {
  const diff = new Date(endDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

//Toast Component
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

//Summary Card
function SummaryCard({ label, value, icon, type, sub }) {
  return (
    <div className={`summary-card ${type}`}>
      <div className="summary-icon">{icon}</div>
      <div className="summary-info">
        <div className="summary-label">{label}</div>
        <div className="summary-value">{value}</div>
        {sub && <div className="summary-sub">{sub}</div>}
      </div>
    </div>
  );
}

//Asset Card
function AssetCard({ asset, onEdit, onDelete }) {
  const active = isWarrantyActive(asset.warrantyEndDate);
  const days = daysUntilExpiry(asset.warrantyEndDate);

  return (
    <div className="asset-card">
      <div className="asset-card-header">
        <span className={`asset-type-badge ${getTypeClass(asset.assetType)}`}>
          {asset.assetType}
        </span>
        <span className={`warranty-status-badge ${active ? 'warranty-active' : 'warranty-expired'}`}>
          {active ? '● Active' : '● Expired'}
        </span>
      </div>

      <div className="asset-card-body">
        <div className="asset-id">{asset.assetId}</div>
        <div className="asset-details">
          <div className="asset-detail-row">
            <span className="asset-detail-label">Department</span>
            <span className="asset-detail-value">{asset.department}</span>
          </div>
          <div className="asset-detail-row">
            <span className="asset-detail-label">Brand</span>
            <span className="asset-detail-value">{asset.brand || '—'}</span>
          </div>
          <div className="asset-detail-row">
            <span className="asset-detail-label">Serial No.</span>
            <span className="asset-detail-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {asset.serialNumber || '—'}
            </span>
          </div>
          <div className="asset-detail-row">
            <span className="asset-detail-label">Processor</span>
            <span className="asset-detail-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {asset.processor || '—'}
            </span>
          </div>
          <div className="asset-detail-row">
            <span className="asset-detail-label">Purchased</span>
            <span className="asset-detail-value">{formatDate(asset.purchaseDate)}</span>
          </div>
          <div className="asset-detail-row">
            <span className="asset-detail-label">Delivery</span>
            <span className="asset-detail-value">{formatDate(asset.deliveryDate)}</span>
          </div>
          <div className="asset-detail-row">
            <span className="asset-detail-label">Warranty End</span>
            <span
              className="asset-detail-value"
              style={{ color: active ? (days <= 90 ? 'var(--accent-orange)' : 'var(--accent-green)') : 'var(--accent-red)', fontWeight: 700 }}
            >
              {formatDate(asset.warrantyEndDate)}
            </span>
          </div>
          {active && days <= 90 && (
            <div className="asset-detail-row">
              <span className="asset-detail-label" style={{ color: 'var(--accent-orange)' }}>Expires in</span>
              <span className="asset-detail-value" style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{days} days</span>
            </div>
          )}
        </div>
      </div>

      <div className="asset-card-footer">
        <button className="btn btn-edit btn-sm" onClick={() => onEdit(asset)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(asset)}>Delete</button>
      </div>
    </div>
  );
}

//Asset Form Modal
function AssetModal({ isOpen, onClose, onSubmit, editAsset, loading }) {
  const isEdit = !!editAsset;
  const today = new Date().toISOString().split('T')[0];

  const emptyForm = {
    assetType: 'PC',
    brand: '',
    serialNumber: '',
    processor: '',
    deliveryDate: '',
    purchaseDate: today,
    warrantyStartDate: today,
    department: 'ADRM',
  };

  const [form, setForm] = useState(emptyForm);
  const [computedWarrantyEnd, setComputedWarrantyEnd] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editAsset) {
        setForm({
          assetType: editAsset.assetType,
          brand: editAsset.brand,
          serialNumber: editAsset.serialNumber,
          processor: editAsset.processor,
          deliveryDate: editAsset.deliveryDate,
          purchaseDate: editAsset.purchaseDate,
          warrantyStartDate: editAsset.warrantyStartDate,
          department: editAsset.department,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, editAsset]);

  useEffect(() => {
    if (form.warrantyStartDate) {
      const d = new Date(form.warrantyStartDate);
      d.setFullYear(d.getFullYear() + 3);
      setComputedWarrantyEnd(d.toISOString().split('T')[0]);
    }
  }, [form.warrantyStartDate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div className="modal-title" id="modal-title">
            {isEdit ? 'Edit Asset' : 'Add New Asset'}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Asset ID (auto-generated) */}
              <div className="form-group full-width">
                <label className="form-label">Asset ID</label>
                <input
                  className="form-input"
                  value={isEdit ? editAsset.assetId : `Auto-generated (${form.assetType === 'PC' ? 'PC' : form.assetType === 'Printer' ? 'PR' : form.assetType === 'UPS' ? 'UPS' : 'AV'}-XXX)`}
                  disabled
                  readOnly
                />
                <span className="form-hint">Asset ID is auto-generated based on type</span>
              </div>

              <hr className="form-divider" />

              {/* Asset Type */}
              <div className="form-group">
                <label className="form-label" htmlFor="assetType">
                  Asset Type <span className="required">*</span>
                </label>
                <select
                  id="assetType"
                  name="assetType"
                  className="form-select"
                  value={form.assetType}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {isEdit && <span className="form-hint">Asset type cannot be changed</span>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="department">
                  Department <span className="required">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  className="form-select"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="form-group">
                <label className="form-label" htmlFor="brand">
                  Brand <span className="required">*</span>
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  className="form-input"
                  placeholder=""
                  value={form.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Serial Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="serialNumber">
                  Serial Number <span className="required">*</span>
                </label>
                <input
                  id="serialNumber"
                  name="serialNumber"
                  type="text"
                  className="form-input"
                  placeholder=""
                  value={form.serialNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Processor */}
              <div className="form-group">
                <label className="form-label" htmlFor="processor">
                  Processor <span className="required">*</span>
                </label>
                <input
                  id="processor"
                  name="processor"
                  type="text"
                  className="form-input"
                  placeholder=""
                  value={form.processor}
                  onChange={handleChange}
                  required
                />
              </div>

              <hr className="form-divider" />

              {/* Purchase Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="purchaseDate">
                  Purchase Date <span className="required">*</span>
                </label>
                <input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  className="form-input"
                  value={form.purchaseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Delivery Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="deliveryDate">
                  Delivery Date <span className="required">*</span>
                </label>
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  className="form-input"
                  value={form.deliveryDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Warranty Start Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="warrantyStartDate">
                  Warranty Start Date <span className="required">*</span>
                </label>
                <input
                  id="warrantyStartDate"
                  name="warrantyStartDate"
                  type="date"
                  className="form-input"
                  value={form.warrantyStartDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Warranty End Date (computed) */}
              <div className="form-group full-width">
                <label className="form-label">Warranty End Date (Auto-calculated)</label>
                <input
                  className="form-input"
                  value={computedWarrantyEnd ? formatDate(computedWarrantyEnd) : ''}
                  disabled
                  readOnly
                />
                <span className="form-hint">Automatically set to 3 years from warranty start date</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="modal-submit-btn">
              {loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//Confirm Delete
function ConfirmDialog({ isOpen, asset, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-icon">⚠️</div>
        <h3>Delete Asset?</h3>
        <p>
          Are you sure you want to delete <strong>{asset?.assetId}</strong>?<br />
          This action cannot be undone.
        </p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} id="confirm-delete-btn">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

//Demand & Supplied
function DistributionTable({ assets, demandData, onDemandChange }) {
  const [expandedDepts, setExpandedDepts] = useState(new Set());

  const departments = [...new Set([...DEPARTMENTS, ...assets.map((a) => a.department)])];
  const getCount = (dept, type) => assets.filter((a) => a.department === dept && a.assetType === type).length;
  const getTotal = (dept) => assets.filter((a) => a.department === dept).length;
  const activeDepts = departments.filter((d) => getTotal(d) > 0 || DEPARTMENTS.includes(d));

  const toggleDept = (dept) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const getDemandValue = (dept, category, subCategory, type) =>
    demandData?.[dept]?.[category]?.[subCategory]?.[type] ?? 0;

  const getTotalAllottedDemand = (dept) =>
    ASSET_TYPES.reduce(
      (sum, t) =>
        sum +
        getDemandValue(dept, 'demanded', 'additional', t) +
        getDemandValue(dept, 'demanded', 'replacement', t),
      0
    );

  const getSubRowTotal = (dept, category, subCategory) =>
    ASSET_TYPES.reduce((sum, t) => sum + getDemandValue(dept, category, subCategory, t), 0);

  const DEMANDED_ROWS = [
    { subKey: 'demanded-additional', category: 'demanded', subCategory: 'additional', label: 'Demanded on Additional' },
    { subKey: 'demanded-replacement', category: 'demanded', subCategory: 'replacement', label: 'Demanded on Replacement' },
  ];

  const SUPPLIED_ROWS = [
    { subKey: 'supplied-additional', category: 'supplied', subCategory: 'additional', label: 'Additional' },
    { subKey: 'supplied-replacement', category: 'supplied', subCategory: 'replacement', label: 'Replacement' },
  ];

  return (
    <div className="distribution-section">
      <div className="section-header">
        <div className="section-title">
          Asset Distribution
          <span className="badge">{activeDepts.length} departments</span>
        </div>
        <span className="dist-expand-hint">▸ Click a department row to expand demand &amp; supply details</span>
      </div>
      <div className="distribution-table-wrapper">
        <table className="distribution-table" id="distribution-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Allotted Demand</th>
              <th>PCs</th>
              <th>Printers</th>
              <th>UPS</th>
              <th>Antivirus</th>
              <th>Total Asset</th>
            </tr>
          </thead>
          <tbody>
            {activeDepts.map((dept) => {
              const pc = getCount(dept, 'PC');
              const pr = getCount(dept, 'Printer');
              const ups = getCount(dept, 'UPS');
              const av = getCount(dept, 'Antivirus');
              const total = pc + pr + ups + av;
              const totalDemand = getTotalAllottedDemand(dept);
              const isExpanded = expandedDepts.has(dept);

              return (
                <Fragment key={dept}>
                  {/*Department Row (clickable)*/}
                  <tr
                    className={`dept-row${isExpanded ? ' dept-row-expanded' : ''}`}
                    onClick={() => toggleDept(dept)}
                  >
                    <td>
                      <div className="dept-name">
                        <span className="expand-icon">{isExpanded ? '▾' : '▸'}</span>
                        {dept}
                      </div>
                    </td>
                    <td>
                      <span className={`count-pill ${totalDemand > 0 ? 'demand-pill' : 'zero'}`}>
                        {totalDemand}
                      </span>
                    </td>
                    {[pc, pr, ups, av].map((c, i) => (
                      <td key={i}>
                        <span className={`count-pill ${c > 0 ? 'has-count' : 'zero'}`}>{c}</span>
                      </td>
                    ))}
                    <td>
                      <strong style={{ color: total > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {total}
                      </strong>
                    </td>
                  </tr>

                  {/*Demanded rows then Supplied section*/}
                  {isExpanded && (
                    <>
                      {/* Demanded on Additional / Replacement */}
                      {DEMANDED_ROWS.map(({ subKey, category, subCategory, label }) => (
                        <tr key={`${dept}-${subKey}`} className="sub-row sub-row-demanded">
                          <td>
                            <div className="sub-row-label">
                              <span className="sub-row-dot dot-demanded" />
                              {label}
                            </div>
                          </td>
                          <td />
                          {ASSET_TYPES.map((type) => (
                            <td key={type}>
                              <input
                                type="number"
                                min="0"
                                className="demand-input input-demanded"
                                value={getDemandValue(dept, category, subCategory, type)}
                                onChange={(e) =>
                                  onDemandChange(dept, category, subCategory, type, parseInt(e.target.value) || 0)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                          ))}
                          <td>
                            <span className="sub-total sub-total-demanded">
                              {getSubRowTotal(dept, category, subCategory)}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Supplied — section header */}
                      <tr className="sub-section-header">
                        <td colSpan={7}>
                          <div className="sub-section-title">
                            <span className="sub-row-dot dot-supplied" />
                            Supplied
                          </div>
                        </td>
                      </tr>

                      {/* Supplied — Additional / Replacement */}
                      {SUPPLIED_ROWS.map(({ subKey, category, subCategory, label }) => (
                        <tr key={`${dept}-${subKey}`} className="sub-row sub-row-supplied">
                          <td>
                            <div className="sub-row-label sub-label-indent">
                              <span className="sub-row-dot dot-supplied" />
                              {label}
                            </div>
                          </td>
                          <td />
                          {ASSET_TYPES.map((type) => (
                            <td key={type}>
                              <input
                                type="number"
                                min="0"
                                className="demand-input input-supplied"
                                value={getDemandValue(dept, category, subCategory, type)}
                                onChange={(e) =>
                                  onDemandChange(dept, category, subCategory, type, parseInt(e.target.value) || 0)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                          ))}
                          <td>
                            <span className="sub-total sub-total-supplied">
                              {getSubRowTotal(dept, category, subCategory)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        <div className="dist-total">
          Total Assets: {assets.length} &nbsp;|&nbsp; Departments Active: {activeDepts.filter((d) => getTotal(d) > 0).length}
        </div>
      </div>
    </div>
  );
}

//Main Page
export default function HomePage() {
  const [allAssets, setAllAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterWarranty, setFilterWarranty] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast
  const [toasts, setToasts] = useState([]);

  const [currentTime, setCurrentTime] = useState('');

  // Demand / supply data
  const [demandData, setDemandData] = useState({});
  const saveDemandRef = useRef(null);

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  function addToast(message, type = 'success') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterType) params.set('type', filterType);
      if (filterDept) params.set('department', filterDept);
      if (filterWarranty) params.set('warrantyStatus', filterWarranty);

      const res = await fetch(`/api/assets?${params}`);
      const json = await res.json();
      if (json.success) setFilteredAssets(json.data);
    } catch {
      addToast('Failed to load assets', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterDept, filterWarranty]);

  const fetchAllAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/assets');
      const json = await res.json();
      if (json.success) setAllAssets(json.data);
    } catch {}
  }, []);

  const fetchDemands = useCallback(async () => {
    try {
      const res = await fetch('/api/demands');
      const json = await res.json();
      if (json.success) setDemandData(json.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAssets();
    fetchAllAssets();
    fetchDemands();
  }, [fetchAssets, fetchAllAssets, fetchDemands]);

  const totalAssets = allAssets.length;
  const warrantyActive = allAssets.filter((a) => isWarrantyActive(a.warrantyEndDate)).length;
  const warrantyExpired = allAssets.filter((a) => !isWarrantyActive(a.warrantyEndDate)).length;

  async function handleAddOrEdit(form) {
    setSubmitting(true);
    try {
      let res;
      if (editAsset) {
        res = await fetch(`/api/assets/${editAsset.assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      const json = await res.json();
      if (json.success) {
        addToast(editAsset ? `Asset ${editAsset.assetId} updated!` : `Asset ${json.data.assetId} added!`, 'success');
        setShowModal(false);
        setEditAsset(null);
        fetchAssets();
        fetchAllAssets();
      } else {
        addToast(json.error || 'Operation failed', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assets/${deleteTarget.assetId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        addToast(`Asset ${deleteTarget.assetId} deleted`, 'info');
        setDeleteTarget(null);
        fetchAssets();
        fetchAllAssets();
      } else {
        addToast(json.error || 'Delete failed', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function openAddModal() {
    setEditAsset(null);
    setShowModal(true);
  }

  function openEditModal(asset) {
    setEditAsset(asset);
    setShowModal(true);
  }

  function clearFilters() {
    setSearch('');
    setFilterType('');
    setFilterDept('');
    setFilterWarranty('');
  }

  // Persist demand changes with 600 ms debounce
  function handleDemandChange(dept, category, subCategory, type, value) {
    setDemandData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[dept]) next[dept] = { demanded: { additional: {}, replacement: {} }, supplied: { additional: {}, replacement: {} } };
      if (!next[dept][category]) next[dept][category] = { additional: {}, replacement: {} };
      if (!next[dept][category][subCategory]) next[dept][category][subCategory] = {};
      next[dept][category][subCategory][type] = value;

      clearTimeout(saveDemandRef.current);
      saveDemandRef.current = setTimeout(() => {
        fetch('/api/demands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        }).catch(() => {});
      }, 600);

      return next;
    });
  }

  const hasFilters = search || filterType || filterDept || filterWarranty;

  return (
    <>
      {/* MAIN */}
      <main className="main-container">
        {/* PAGE HEADER */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Asset Dashboard</h1>
          </div>
          <button className="btn btn-primary btn-lg" onClick={openAddModal} id="add-asset-btn">
            + Add New Asset
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="summary-grid">
          <SummaryCard label="Total Assets" value={totalAssets} type="total" />
          <SummaryCard label="Under Warranty" value={warrantyActive} type="active" />
          <SummaryCard label="Warranty Expired" value={warrantyExpired} type="expired" />
        </div>

        {/* SEARCH & FILTER */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              className="filter-input"
              type="text"
              placeholder="Search by Asset ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-divider" />

          <select
            id="filter-type"
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            id="filter-dept"
            className="filter-select"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            id="filter-warranty"
            className="filter-select"
            value={filterWarranty}
            onChange={(e) => setFilterWarranty(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Warranty</option>
            <option value="expired">Expired</option>
          </select>

          {hasFilters && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters} id="clear-filters-btn">
              ✕ Clear
            </button>
          )}
        </div>

        {/* ASSETS GRID */}
        <div className="section-header">
          <div className="section-title">
            IT Assets
            <span className="badge">{filteredAssets.length} {hasFilters ? 'matching' : 'total'}</span>
          </div>
          {hasFilters && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing filtered results
            </span>
          )}
        </div>

        <div className="assets-grid">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>{hasFilters ? 'No matching assets found' : 'No assets yet'}</h3>
              <p>
                {hasFilters
                  ? 'Try clearing your filters to see all assets.'
                  : 'Click "+ Add New Asset" to register your first IT asset.'}
              </p>
              {hasFilters && (
                <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <AssetCard
                key={asset.assetId}
                asset={asset}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </div>

        {/* DISTRIBUTION TABLE */}
        <DistributionTable
          assets={allAssets}
          demandData={demandData}
          onDemandChange={handleDemandChange}
        />
      </main>

      {/* MODALS */}
      <AssetModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditAsset(null); }}
        onSubmit={handleAddOrEdit}
        editAsset={editAsset}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        asset={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={submitting}
      />

      {/* TOASTS */}
      <Toast toasts={toasts} />
    </>
  );
}
