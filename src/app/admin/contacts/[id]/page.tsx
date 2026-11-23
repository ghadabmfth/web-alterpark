import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { Card } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminForm, FormSelect, FormText } from "@/components/admin/AdminForm";
import { CONTACT_STATUS, shortDateTime } from "@/components/admin/format";
import { routes } from "@/config/site";
import { adminActor } from "@/modules/admin/page-guard";
import { getContact, staffMembers } from "@/modules/admin/customers";
import { addContactNoteAction, updateContactAction } from "@/modules/admin/actions/catalog";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/modules/contact/schema";

export const metadata: Metadata = { title: "Demande de contact" };

export default async function AdminContact({ params }: PageProps<"/admin/contacts/[id]">) {
  const actor = await adminActor("CONTACT_READ");
  if (!actor) return <AccessDenied />;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [m, staff] = await Promise.all([getContact(actor, id), staffMembers(actor)]);
  if (!m) notFound();
  const canManage = actor.can("CONTACT_MANAGE");
  return (
    <>
      <PageHeader
        title={`Demande de ${m.name}`}
        description={CONTACT_SUBJECTS[m.subject as ContactSubject] ?? m.subject}
        breadcrumbs={[{ label: "Back-office", href: routes.admin }, { label: "Demandes de contact", href: `${routes.admin}/contacts` }, { label: m.name }]}
        actions={<Badge tone={CONTACT_STATUS[m.status]![1]}>{CONTACT_STATUS[m.status]![0]}</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Message" titleAs="h2">
          <DescriptionList
            items={[
              { term: "Reçu le", value: shortDateTime(m.createdAt) },
              { term: "E-mail", value: <a className="text-primary underline" href={`mailto:${m.email}`}>{m.email}</a> },
              { term: "Téléphone", value: m.phone ?? "—" },
              { term: "Parking", value: m.parking?.name ?? "—" },
              { term: "Compte client", value: m.user && actor.can("CUSTOMER_READ") ? <Link className="text-primary underline" href={`${routes.admin}/clients/${m.user.id}`}>Voir la fiche</Link> : m.user ? "Oui" : "Non" },
            ]}
          />
          <p className="mt-6 mb-0 whitespace-pre-line">{m.message}</p>
        </Card>
        <Card title="Suivi" titleAs="h2">
          {canManage ? (
            <AdminForm action={updateContactAction} hidden={{ id: m.id }} submitLabel="Enregistrer" label="Suivi de la demande">
              <FormSelect label="Statut" name="status" defaultValue={m.status} options={Object.entries(CONTACT_STATUS).map(([value, [label]]) => ({ value, label }))} />
              <FormSelect label="Assignée à" name="assignedToId" defaultValue={m.assignedTo?.id ?? ""} placeholder="Personne" options={staff.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))} />
            </AdminForm>
          ) : (
            <p className="m-0">{m.assignedTo ? `Assignée à ${m.assignedTo.firstName} ${m.assignedTo.lastName}` : "Non assignée"}</p>
          )}
        </Card>
      </div>
      <Card title="Notes internes" titleAs="h2" className="mt-6">
        <div className="flex flex-col gap-6">
          {m.notes.length ? (
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {m.notes.map((n) => (
                <li key={n.id}>
                  <p className="m-0 font-bold">{`${n.author.firstName} ${n.author.lastName} — ${shortDateTime(n.createdAt)}`}</p>
                  <p className="m-0 whitespace-pre-line">{n.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="m-0 text-text-secondary">Aucune note. Les notes ne sont jamais envoyées au client.</p>
          )}
          {canManage ? (
            <AdminForm action={addContactNoteAction} hidden={{ id: m.id }} submitLabel="Ajouter la note" label="Nouvelle note">
              <FormText label="Note" name="body" multiline rows={3} required />
            </AdminForm>
          ) : null}
        </div>
      </Card>
    </>
  );
}
