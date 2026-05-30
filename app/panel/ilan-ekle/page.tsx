import { EquipmentForm } from "@/components/equipment/EquipmentForm";

export default function IlanEklePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-dark mb-8">Yeni İlan Ekle</h1>
      <EquipmentForm mode="create" />
    </div>
  );
}
