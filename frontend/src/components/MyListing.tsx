import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/api/authApi";
import {
  useGetPetSitterProfileQuery,
  useUpdatePetSitterMutation,
  useCreatePetSitterMutation,
} from "@/api/petApi";

type ProfileDTO = {
  name?: string;
  bio?: string | null;
  location?: string;
  hourlyRate?: number | null;
  experience?: number | null;
  serviceTypes?: string[];
  petTypes?: string[];
};

type FormState = {
  name: string;
  location: string;
  hourlyRate: string;
  experience: string;
  bio: string;
  petTypes: string[];
  services: string;
};

const PET_OPTIONS: { value: string; label: string }[] = [
  { value: "dog", label: "🐶 Dogs" },
  { value: "cat", label: "🐱 Cats" },
];

const inputCls =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground disabled:cursor-default disabled:opacity-60";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

const EMPTY_FORM: FormState = {
  name: "",
  location: "",
  hourlyRate: "",
  experience: "",
  bio: "",
  petTypes: [],
  services: "",
};

const toForm = (p: ProfileDTO): FormState => ({
  name: p.name ?? "",
  location: p.location ?? "",
  hourlyRate: p.hourlyRate != null ? String(p.hourlyRate) : "",
  experience: p.experience != null ? String(p.experience) : "",
  bio: p.bio ?? "",
  petTypes: p.petTypes ?? [],
  services: (p.serviceTypes ?? []).join(", "),
});

export default function ListingLocationSection() {
  const { data: me } = useGetMeQuery();
  const petSitterId = me?.petSitterId;
  const isSitter = !!petSitterId;

  const { data: profile, isLoading } = useGetPetSitterProfileQuery(
    { id: String(petSitterId) },
    { skip: !petSitterId },
  );
  const [updatePetSitter, { isLoading: saving }] = useUpdatePetSitterMutation();
  const [createPetSitter, { isLoading: creating }] = useCreatePetSitterMutation();
  const busy = saving || creating;

  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState(false);

  // Existing sitters start in a locked, read-only view; new sitters fill the
  // form to create their listing, so inputs stay enabled for them.
  const readOnly = isSitter && !editing;

  useEffect(() => {
    if (profile) setForm(toForm(profile as ProfileDTO));
    else if (!petSitterId) setForm(EMPTY_FORM);
  }, [profile, petSitterId]);

  // Existing sitter, profile still loading
  if (isSitter && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!form) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const togglePet = (value: string) =>
    set(
      "petTypes",
      form.petTypes.includes(value)
        ? form.petTypes.filter((p) => p !== value)
        : [...form.petTypes, value],
    );

  const cancelEdit = () => {
    if (profile) setForm(toForm(profile as ProfileDTO));
    setEditing(false);
  };

  const save = async () => {
    const trimmedBio = form.bio.trim();
    const services = form.services
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (form.name.trim().length < 2 || form.name.trim().length > 50) {
      toast.error("Name must be between 2 and 50 characters");
      return;
    }
    if (form.location.trim().length < 2 || form.location.trim().length > 100) {
      toast.error("Location must be between 2 and 100 characters");
      return;
    }
    if (trimmedBio && trimmedBio.length < 10) {
      toast.error("Bio must be at least 10 characters (or leave it empty)");
      return;
    }
    if (form.hourlyRate !== "" && (Number(form.hourlyRate) < 0 || Number(form.hourlyRate) > 5000)) {
      toast.error("Hourly rate must be between ₹0 and ₹5000");
      return;
    }
    if (form.experience !== "" && (Number(form.experience) < 0 || Number(form.experience) > 60)) {
      toast.error("Experience must be between 0 and 60 years");
      return;
    }
    if (services.length > 10) {
      toast.error("You can list up to 10 services");
      return;
    }
    if (services.some((s) => s.length > 30)) {
      toast.error("Each service name must be 30 characters or fewer");
      return;
    }

    const data: Record<string, unknown> = {
      name: form.name.trim(),
      location: form.location.trim(),
      bio: trimmedBio || undefined,
      hourlyRate: form.hourlyRate === "" ? undefined : Number(form.hourlyRate),
      experience: form.experience === "" ? undefined : Number(form.experience),
      petTypes: form.petTypes,
      serviceTypes: services,
    };

    try {
      if (isSitter) {
        await updatePetSitter({ id: petSitterId, data }).unwrap();
        toast.success("Listing updated");
        setEditing(false);
      } else {
        await createPetSitter(data).unwrap();
        toast.success("You're now a pet sitter! 🎉");
      }
    } catch (err) {
      const msg = (err as { data?: { error?: string } })?.data?.error || "Could not save listing";
      toast.error(msg);
    }
  };

  const serviceTags = form.services
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {isSitter ? "My listing" : "Become a pet sitter"}
        </h2>
        {isSitter && (
          <div className="flex items-center gap-2">
            <Link to={`/sitter-profile/${petSitterId}`}>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                View public profile
              </Button>
            </Link>
            {readOnly && (
              <Button size="sm" className="rounded-full px-4" onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            )}
          </div>
        )}
      </div>

      {!isSitter && (
        <p className="-mt-4 text-sm text-muted-foreground">
          Fill in your details to list your services and start receiving bookings.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            maxLength={50}
            disabled={readOnly}
          />
        </Field>

        <Field label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City / area"
            maxLength={100}
            disabled={readOnly}
          />
        </Field>

        <Field label="Hourly rate (₹)">
          <input
            type="number"
            min={0}
            max={5000}
            inputMode="numeric"
            className={inputCls}
            value={form.hourlyRate}
            onChange={(e) => set("hourlyRate", e.target.value)}
            placeholder="e.g. 250"
            disabled={readOnly}
          />
        </Field>

        <Field label="Experience (years)">
          <input
            type="number"
            min={0}
            max={60}
            inputMode="numeric"
            className={inputCls}
            value={form.experience}
            onChange={(e) => set("experience", e.target.value)}
            placeholder="e.g. 3"
            disabled={readOnly}
          />
        </Field>
      </div>

      <Field label="Pets you sit">
        <div className="flex flex-wrap gap-2 pt-1">
          {PET_OPTIONS.map((opt) => {
            const active = form.petTypes.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => togglePet(opt.value)}
                disabled={readOnly}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:cursor-default disabled:opacity-60 ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Services offered">
        <input
          className={inputCls}
          value={form.services}
          onChange={(e) => set("services", e.target.value)}
          placeholder="dog walking, overnight stays, grooming"
          disabled={readOnly}
        />
        <p className="text-xs text-muted-foreground">
          Separate services with commas. Up to 10 services, 30 characters each.
        </p>
        {serviceTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {serviceTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs capitalize text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Field>

      <Field label="About / bio">
        <textarea
          rows={4}
          maxLength={500}
          className={`${inputCls} resize-none`}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Tell pet owners about your experience and what makes you a great sitter…"
          disabled={readOnly}
        />
      </Field>

      {!readOnly && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-6">
          {!isSitter ? (
            <Button onClick={save} disabled={busy} className="rounded-full px-6">
              {creating ? "Creating…" : "Create sitter profile"}
            </Button>
          ) : (
            <>
              <Button onClick={save} disabled={busy} className="rounded-full px-6">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button onClick={cancelEdit} variant="outline" disabled={busy} className="rounded-full px-6">
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
