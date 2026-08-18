import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore, MEKANIK, tanggalPanjang, rupiah, type Servis, type StatusServis } from "@/lib/store";

export const Route = createFileRoute("/_shell/servis")({
  head: () => ({
    meta: [
      { title: "Data Servis — Bengkel Pitstop" },
      { name: "description", content: "Catat dan kelola pekerjaan servis kendaraan beserta status pengerjaannya." },
      { property: "og:title", content: "Data Servis — Bengkel Pitstop" },
      { property: "og:description", content: "Pencatatan servis kendaraan dan status pengerjaan." },
    ],
  }),
  component: ServisPage;
});

function ServisPage() {
  return null;
}
