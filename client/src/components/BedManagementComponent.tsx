// BedManagementDrilldown.tsx
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, X } from "lucide-react";

/**
 * Bed Management — Drilldown UI (single-file)
 *
 * - Top: Ward-type -> Floors summary grid (collapsed default; this shows summary cards)
 * - Click a floor card to drill down to a compact, paginated table showing only that ward+floor
 * - Single shared modal to update bed (Esc closes modal)
 * - Role-based default filters (simulated currentRole variable)
 *
 * Drop into your project and adjust styles / API hooks as needed.
 */

/* --------------------
   Types
   -------------------- */
type BedStatus = "Available" | "Occupied" | "Cleaning" | "Under Maintenance" | "Blocked";

type PatientInfo = {
  name: string;
  id: string;
  admittingDoctor?: string;
  diagnosis?: string;
};

type BedItem = {
  id: string;
  bedNumber: string;
  type: string; // Ward type (ICU, General Ward, etc.)
  floor: string; // e.g., "Floor 1"
  status: BedStatus;
  patientInfo?: PatientInfo;
};

/* --------------------
   Simulated current user role
   (affects what they see by default and permitted actions)
   -------------------- */
const currentRole: "admin" | "admitting" | "doctor" | "housekeeping" = "admitting";

/* --------------------
   Helpers / Mock data
   -------------------- */
const statusBadge = (status: BedStatus) =>
  ({
    Available: "bg-green-100 text-green-800",
    Occupied: "bg-red-100 text-red-800",
    Cleaning: "bg-yellow-100 text-yellow-800",
    "Under Maintenance": "bg-orange-100 text-orange-800",
    Blocked: "bg-gray-200 text-gray-800",
  }[status]);

const wardTypes = ["ICU", "General Ward", "Private Room", "CCU", "NICU"];

/** Generate mock beds (configurable count) */
const generateMockBeds = (count = 600): BedItem[] => {
  const floors = ["Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5"];
  const statuses: BedStatus[] = ["Available", "Occupied", "Cleaning", "Under Maintenance", "Blocked"];
  return Array.from({ length: count }, (_, i) => {
    const type = wardTypes[i % wardTypes.length];
    const floor = floors[i % floors.length];
    const status = statuses[i % statuses.length];
    const occupied = status === "Occupied";
    return {
      id: `B-${i + 1}`,
      bedNumber: `${100 + i}`,
      type,
      floor,
      status,
      patientInfo: occupied
        ? { name: `Patient ${i + 1}`, id: `P-${1000 + i}`, admittingDoctor: `Dr. ${["Mehta", "Kumar", "Sharma"][i % 3]}`, diagnosis: "General" }
        : undefined,
    } as BedItem;
  });
};

/* --------------------
   Modal: update bed (shared)
   -------------------- */
const UpdateBedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  bed?: BedItem | null;
  onSave: (id: string, updates: Partial<BedItem> & { patientInfo?: PatientInfo | undefined }) => void;
}> = ({ isOpen, onClose, bed, onSave }) => {
  const [form, setForm] = useState<{ status: BedStatus; patientName: string; patientId: string; admittingDoctor: string; diagnosis: string }>({
    status: (bed?.status ?? "Available") as BedStatus,
    patientName: bed?.patientInfo?.name ?? "",
    patientId: bed?.patientInfo?.id ?? "",
    admittingDoctor: bed?.patientInfo?.admittingDoctor ?? "",
    diagnosis: bed?.patientInfo?.diagnosis ?? "",
  });

  useEffect(() => {
    setForm({
      status: (bed?.status ?? "Available") as BedStatus,
      patientName: bed?.patientInfo?.name ?? "",
      patientId: bed?.patientInfo?.id ?? "",
      admittingDoctor: bed?.patientInfo?.admittingDoctor ?? "",
      diagnosis: bed?.patientInfo?.diagnosis ?? "",
    });
  }, [bed, isOpen]);

  // ESC key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !bed) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<BedItem> & { patientInfo?: PatientInfo | undefined } = { status: form.status };
    if (form.status === "Occupied") {
      updates.patientInfo = { name: form.patientName, id: form.patientId, admittingDoctor: form.admittingDoctor, diagnosis: form.diagnosis };
    } else {
      updates.patientInfo = undefined;
    }
    onSave(bed.id, updates);
    onClose();
  };

  const allowedStatuses: BedStatus[] = ["Available", "Occupied", "Cleaning", "Under Maintenance", "Blocked"];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10"
          initial={{ y: 16, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 16, scale: 0.98 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Update Bed — {bed.bedNumber}</h3>
              <p className="text-sm text-gray-500">{bed.type} • {bed.floor}</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800" aria-label="Close modal">
              <X />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as BedStatus }))}>
                {allowedStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {form.status === "Occupied" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                  <input required className="mt-1 w-full border rounded px-3 py-2" value={form.patientName} onChange={(e) => setForm((s) => ({ ...s, patientName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                  <input required className="mt-1 w-full border rounded px-3 py-2" value={form.patientId} onChange={(e) => setForm((s) => ({ ...s, patientId: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admitting Doctor</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={form.admittingDoctor} onChange={(e) => setForm((s) => ({ ...s, admittingDoctor: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={form.diagnosis} onChange={(e) => setForm((s) => ({ ...s, diagnosis: e.target.value }))} />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};

/* --------------------
   Main Component (Drilldown)
   -------------------- */
const BedManagementDrilldown: React.FC = () => {
  // DATA - in real app you'll fetch this and subscribe to realtime updates
  const [beds, setBeds] = useState<BedItem[]>(() => generateMockBeds(1200));

  // Drilldown state
  const [selectedType, setSelectedType] = useState<string | null>(null); // ward type
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null); // floor
  const [selectedBed, setSelectedBed] = useState<BedItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // table controls for the active floor
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<BedStatus | "">("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // Derived grouping: type -> floor -> bed[]
  const bedsByTypeFloor = useMemo(() => {
    const map = new Map<string, Map<string, BedItem[]>>();
    for (const b of beds) {
      if (!map.has(b.type)) map.set(b.type, new Map());
      const floors = map.get(b.type)!;
      if (!floors.has(b.floor)) floors.set(b.floor, []);
      floors.get(b.floor)!.push(b);
    }
    return map;
  }, [beds]);

  // Summary counts per floor (for summary cards)
  const summaryByTypeFloor = useMemo(() => {
    const out: Record<string, Record<string, { total: number; available: number; occupied: number; dirty: number }>> = {};
    for (const [type, floors] of bedsByTypeFloor.entries()) {
      out[type] = out[type] || {};
      for (const [floor, list] of floors.entries()) {
        const total = list.length;
        const available = list.filter((b) => b.status === "Available").length;
        const occupied = list.filter((b) => b.status === "Occupied").length;
        const dirty = list.filter((b) => b.status === "Cleaning" || b.status === "Under Maintenance").length;
        out[type][floor] = { total, available, occupied, dirty };
      }
    }
    return out;
  }, [bedsByTypeFloor]);

  // Active floor's full list (before pagination & search)
  const activeFloorFullList = useMemo(() => {
    if (!selectedType || !selectedFloor) return [] as BedItem[];
    return bedsByTypeFloor.get(selectedType)?.get(selectedFloor) ?? [];
  }, [bedsByTypeFloor, selectedType, selectedFloor]);

  // Filtered + searched list for the table
  const filteredActiveList = useMemo(() => {
    const s = searchText.trim().toLowerCase();
    return activeFloorFullList.filter((b) => {
      const matchesStatus = !statusFilter || b.status === statusFilter;
      const matchesSearch =
        !s ||
        b.bedNumber.toLowerCase().includes(s) ||
        b.patientInfo?.name?.toLowerCase().includes(s) ||
        b.patientInfo?.id?.toLowerCase().includes(s);
      return matchesStatus && matchesSearch;
    });
  }, [activeFloorFullList, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredActiveList.length / PAGE_SIZE));
  const pageList = filteredActiveList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // handle open table for floor
  const openFloor = (type: string, floor: string) => {
    setSelectedType(type);
    setSelectedFloor(floor);
    setSearchText("");
    setStatusFilter("");
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Save changes from modal
  const saveBedUpdates = (id: string, updates: Partial<BedItem> & { patientInfo?: PatientInfo | undefined }) => {
    setBeds((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } as BedItem : b)));
    // TODO: call backend API and reconcile updates (optimistic UI used here)
  };

  // Role-based default focus suggestions (admission sees available floors first, housekeeping sees dirty floors first)
  const sortedTypes = useMemo(() => Array.from(bedsByTypeFloor.keys()).sort(), [bedsByTypeFloor]);

  /* Reset page when filters/search change */
  useEffect(() => setPage(1), [searchText, statusFilter, selectedType, selectedFloor]);

  /* Modal ESC handling is inside modal; keep here for safety */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) setModalOpen(false);
    };
    if (modalOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Bed Management</h1>
        <p className="text-sm text-gray-600 mt-1">Summary view → click a floor to drill down to bed list. Role: <strong>{currentRole}</strong></p>
      </header>

      {/* Top summary strip */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total beds</div>
          <div className="text-xl font-semibold">{beds.length}</div>
        </div>
        <div className="p-3 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Occupied</div>
          <div className="text-xl font-semibold">{beds.filter((b) => b.status === "Occupied").length}</div>
        </div>
        <div className="p-3 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Available</div>
          <div className="text-xl font-semibold">{beds.filter((b) => b.status === "Available").length}</div>
        </div>
      </div>

      {/* If no type/floor selected: show summary grid */}
      {!selectedType && !selectedFloor ? (
        <div className="space-y-6">
          {sortedTypes.map((type) => {
            const floorsObj = summaryByTypeFloor[type] ?? {};
            const floorKeys = Object.keys(floorsObj).sort();
            // optionally reorder floors by housekeeping need for roles
            return (
              <section key={type}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{type}</h2>
                  <div className="text-sm text-gray-600">{floorKeys.length} floors</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {floorKeys.map((floor) => {
                    const s = floorsObj[floor];
                    // highlight floors useful to role
                    const highlight =
                      (currentRole === "admitting" && s.available > 0) ||
                      (currentRole === "housekeeping" && s.dirty > 0) ||
                      (currentRole === "doctor" && s.occupied > 0);
                    return (
                      <div key={floor} className={`p-4 rounded-lg shadow ${highlight ? "border-2 border-blue-200" : "border border-gray-100"} bg-white`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{floor}</div>
                            <div className="text-sm text-gray-500">{s.total} beds</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Avail</div>
                            <div className="font-semibold text-green-700">{s.available}</div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                          <div className="p-1 bg-red-50 rounded">Occ <div className="font-bold">{s.occupied}</div></div>
                          <div className="p-1 bg-yellow-50 rounded">Dirty <div className="font-bold">{s.dirty}</div></div>
                          <div className="p-1 bg-gray-50 rounded">Total <div className="font-bold">{s.total}</div></div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <button onClick={() => openFloor(type, floor)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Open</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Drilldown view: showing table for selectedType+selectedFloor */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <button onClick={() => { setSelectedType(null); setSelectedFloor(null); }} className="text-sm text-blue-600 hover:underline">← Back to summary</button>
              <h2 className="text-xl font-semibold mt-2">{selectedType} — {selectedFloor}</h2>
              <p className="text-sm text-gray-500 mt-1">{activeFloorFullList.length} beds on this floor</p>
            </div>

            <div className="flex items-center gap-3">
              <input placeholder="Search bed / patient / id" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="border px-3 py-2 rounded w-64" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border px-3 py-2 rounded">
                <option value="">All statuses</option>
                <option>Available</option>
                <option>Occupied</option>
                <option>Cleaning</option>
                <option>Under Maintenance</option>
                <option>Blocked</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Bed</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Doctor</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageList.map((b) => (
                  <tr key={b.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">{b.bedNumber}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusBadge(b.status)}`}>{b.status}</span>
                    </td>
                    <td className="px-3 py-2">{b.patientInfo?.name ?? "-"}</td>
                    <td className="px-3 py-2">{b.patientInfo?.admittingDoctor ?? "-"}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => { setSelectedBed(b); setModalOpen(true); }} className="text-blue-600 hover:underline flex items-center gap-2">
                        <Edit3 className="w-4 h-4" /> Update
                      </button>
                    </td>
                  </tr>
                ))}

                {pageList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No beds match your search / filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-600">Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredActiveList.length)} of {filteredActiveList.length}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <div className="px-3 py-1 border rounded bg-gray-50 text-sm">{page} / {totalPages}</div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}

      <UpdateBedModal isOpen={modalOpen} onClose={() => setModalOpen(false)} bed={selectedBed} onSave={saveBedUpdates} />
    </div>
  );
};

export default BedManagementDrilldown;
