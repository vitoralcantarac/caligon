import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ClientAccount() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Minha conta</h1>
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email || ""} disabled />
        </div>
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button onClick={save} disabled={saving}>Salvar alterações</Button>
      </Card>
    </div>
  );
}
