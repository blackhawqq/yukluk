"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { PageSpinner } from "@/components/ui/Spinner";
import { useEquipment } from "@/hooks/useEquipment";
import type { Equipment } from "@/types";

export default function IlanDuzenlePage() {
  const { id } = useParams<{ id: string }>();
  const { getEquipmentById } = useEquipment();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEquipmentById(id).then(({ data }) => {
      setEquipment(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!equipment) return <p className="p-6 text-stone">İlan bulunamadı.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-dark mb-8">İlanı Düzenle</h1>
      <EquipmentForm mode="edit" initialData={equipment as never} />
    </div>
  );
}
