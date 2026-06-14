import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateEstateMutation, useGetEstatesQuery, useDeleteEstateMutation, useUpdateEstateMutation } from "@/services/estatesApi";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Wand2 } from "lucide-react";
import { EstateManagementSkeleton } from "@/components/ui/skeletons";
import { EstateOverviewCards } from "./EstateOverviewCards";
import { EstateSetupWizard } from "./EstateSetupWizard";


interface Estate { id: string; name: string; description?: string }

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const EstateManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Estates from API
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const navigate = useNavigate();
  const { data: estatesPage, isLoading: estatesLoading } = useGetEstatesQuery({ page, limit, search: searchTerm || undefined });

  // Dialog state
  const [createEstateOpen, setCreateEstateOpen] = useState(false);
  const [newEstateName, setNewEstateName] = useState("");
  const [newEstateDesc, setNewEstateDesc] = useState("");
  const [newEstateUnits, setNewEstateUnits] = useState("");
  const [isCreatingEstate, setIsCreatingEstate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [createEstate] = useCreateEstateMutation();
  const [deleteEstate] = useDeleteEstateMutation();

  // Edit Estate state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editUnits, setEditUnits] = useState("");
  const [updateEstate, { isLoading: updating }] = useUpdateEstateMutation();

  // Estates options from API
  const estateOptions = estatesPage?.data ?? [];

  // Show skeleton while loading
  if (estatesLoading) {
    return <EstateManagementSkeleton />;
  }


  const handleCreateEstate = async () => {
    const name = newEstateName.trim();
    const unitsNum = Number(newEstateUnits);
    if (!name || !Number.isFinite(unitsNum) || unitsNum <= 0) return;
    if ((estateOptions ?? []).some((e: { name?: string }) => (e.name || '').toLowerCase() === name.toLowerCase())) {
      setCreateEstateOpen(false);
      setNewEstateName("");
      setNewEstateDesc("");
      setNewEstateUnits("");
      return;
    }
    try {
      setIsCreatingEstate(true);
      await createEstate({ name, description: newEstateDesc || undefined, totalUnits: unitsNum }).unwrap();
      toast({ title: "Estate created", description: `${name} has been created.` });
    } catch (e) {
      toast({ title: "Failed to create estate", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsCreatingEstate(false);
      setCreateEstateOpen(false);
      setNewEstateName("");
      setNewEstateDesc("");
      setNewEstateUnits("");
    }
  };

  const handleDeleteEstate = async (estateId: string) => {
    try {
      setDeletingId(estateId);
      await deleteEstate(estateId).unwrap();
      toast({ title: 'Estate deleted' });
    } catch (e) {
      toast({ title: 'Failed to delete estate', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-foreground">Estate Management</h1>
          <p className="text-muted-foreground text-sm">Manage estates, units and tenants</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={createEstateOpen} onOpenChange={setCreateEstateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Quick Create</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Estate</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="estate-name">Estate name</Label>
                  <Input id="estate-name" placeholder="e.g. Balado Estate" value={newEstateName} onChange={e => setNewEstateName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estate-desc">Description (optional)</Label>
                  <Input id="estate-desc" placeholder="Short description" value={newEstateDesc} onChange={e => setNewEstateDesc(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estate-units">Total units</Label>
                  <Input id="estate-units" type="number" min={1} placeholder="e.g. 120" value={newEstateUnits} onChange={e => setNewEstateUnits(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setCreateEstateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateEstate} disabled={isCreatingEstate}>{isCreatingEstate ? 'Creating...' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <EstateOverviewCards />

      {/* Edit Estate Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Estate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-estate-name">Estate name</Label>
              <Input id="edit-estate-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-estate-desc">Description (optional)</Label>
              <Input id="edit-estate-desc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-estate-units">Total units</Label>
              <Input id="edit-estate-units" type="number" min={1} value={editUnits} onChange={(e) => setEditUnits(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!editId) return;
                const name = editName.trim();
                const unitsNum = Number(editUnits);
                if (!name || !Number.isFinite(unitsNum) || unitsNum <= 0) return;
                try {
                  await updateEstate({ id: editId, name, description: editDesc || undefined, totalUnits: unitsNum }).unwrap();
                  toast({ title: 'Estate updated' });
                  setEditOpen(false);
                } catch (e) {
                  toast({ title: 'Failed to update estate', variant: 'destructive' });
                }
              }} disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estates (from API) */}
      <Card>
        <CardHeader>
          <CardTitle>Estates</CardTitle>
          <CardDescription>Manage your estates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="Search estates..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full sm:max-w-sm"
            />
          </div>

          {estateOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No estates found.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead className="w-[15%]">Total Units</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estateOptions.map((est: { id: string; name: string; description?: string; totalUnits?: number }) => (
                    <TableRow key={est.id}>
                      <TableCell className="font-medium">{est.name}</TableCell>
                      <TableCell>
                        {typeof est.totalUnits === 'number' ? (
                          <Badge variant="secondary">{est.totalUnits} units</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="truncate max-w-[400px]">
                        {est.description || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/estate/${est.id}`)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditId(est.id);
                                setEditName(est.name);
                                setEditDesc(est.description || "");
                                setEditUnits(typeof est.totalUnits === 'number' ? String(est.totalUnits) : "");
                                setEditOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={deletingId === est.id}>
                                  {deletingId === est.id ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete estate?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the estate "{est.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEstate(est.id)}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-muted-foreground">
              Page {estatesPage?.page ?? page} of {estatesPage?.total && estatesPage?.limit ? Math.ceil(estatesPage.total / estatesPage.limit) : '-'}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={estatesPage?.total ? page * (estatesPage?.limit ?? limit) >= estatesPage.total : false}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EstateSetupWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
};
